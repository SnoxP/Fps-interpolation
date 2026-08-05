import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadArea } from './components/UploadArea';
import { ConfigPanel } from './components/ConfigPanel';
import { BatchProcessingView } from './components/BatchProcessingView';
import { Header } from './components/Header';
import { AlertCircle } from 'lucide-react';
import { AuthWrapper } from './components/AuthWrapper';
import { User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';
import { VideoTask } from './types';

export default function App() {
  const [tasks, setTasks] = useState<VideoTask[]>([]);
  const [globalStatus, setGlobalStatus] = useState<'idle' | 'configuring' | 'processing_batch' | 'done'>('idle');
  const [globalErrorMessage, setGlobalErrorMessage] = useState<string | null>(null);
  const [targetFps, setTargetFps] = useState(60);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);

  const handleFilesSelect = useCallback((files: File[]) => {
    const newTasks: VideoTask[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'pending',
      progress: 0,
      message: 'Aguardando na fila...',
      systemInfo: '',
      resultUrl: null,
      errorMessage: null
    }));
    
    setTasks(newTasks);
    setGlobalStatus('configuring');
    setGlobalErrorMessage(null);
  }, []);

  const handleCancelConfig = useCallback(() => {
    setTasks([]);
    setGlobalStatus('idle');
  }, []);

  const handleCancelAll = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    setTasks(prev => prev.map(t => 
      t.status === 'processing' || t.status === 'pending' 
        ? { ...t, status: 'error', errorMessage: 'Cancelado pelo usuário' } 
        : t
    ));
    // Keep globalStatus as processing_batch so the user can see the errors and retry or reset
  }, []);

  const processTask = async (task: VideoTask, fps: number, user: User) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'processing', progress: 0, message: 'Iniciando...' } : t));
    
    abortControllerRef.current = new AbortController();
    const FIXED_API_URL = "https://adena-dangerless-infrequently.ngrok-free.dev/interpolate";
    
    try {
      pollingIntervalRef.current = window.setInterval(async () => {
        try {
          const statusUrl = FIXED_API_URL.replace('/interpolate', `/status?t=${Date.now()}`);
          const res = await fetch(statusUrl, { headers: { 'ngrok-skip-browser-warning': 'true' } });
          if (res.ok) {
            const data = await res.json();
            let p = data.progress || 0;
            let mappedProgress = 0;
            if (p < 10) {
              mappedProgress = (p / 10) * 5;
            } else if (p <= 90) {
              mappedProgress = 5 + ((p - 10) / 80) * 90;
            } else {
              mappedProgress = 95 + ((p - 90) / 10) * 5;
            }
            
            setTasks(prev => prev.map(t => {
              if (t.id === task.id) {
                let msg = data.message;
                if (msg === 'Iniciando...') {
                  msg = 'Enviando e Processando via API...';
                }
                return { 
                  ...t, 
                  progress: Math.round(mappedProgress), 
                  message: msg,
                  systemInfo: data.systemInfo || ''
                };
              }
              return t;
            }));
          }
        } catch (e) {
          // Ignore polling errors
        }
      }, 1500);

      const formData = new FormData();
      formData.append('file', task.file);
      formData.append('fps', fps.toString());
      
      const response = await fetch(FIXED_API_URL, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        body: formData,
        signal: abortControllerRef.current.signal
      });

      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error + (data.details ? `\n\nDetalhes: ${data.details}` : ''));
        }
      }

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }
      
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress: 80, message: 'Finalizando...' } : t));

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('A API retornou um arquivo de vídeo vazio.');
      }
      
      const url = URL.createObjectURL(blob);
      
      setTasks(prev => prev.map(t => t.id === task.id ? { 
        ...t, 
        status: 'done', 
        progress: 100, 
        message: 'Concluído', 
        resultUrl: url 
      } : t));

      // Save to cloud and history
      (async () => {
        let cloudUrl = null;
        try {
          const formData = new FormData();
          formData.append('reqtype', 'fileupload');
          formData.append('time', '1h');
          formData.append('fileToUpload', task.file, task.file.name);
          const uploadRes = await fetch('https://litterbox.catbox.moe/user/api.php', {
            method: 'POST',
            body: formData
          });
          if (uploadRes.ok) {
            cloudUrl = await uploadRes.text();
          }
        } catch (err) {
          console.error('Upload to catbox failed:', err);
        }

        try {
          await addDoc(collection(db, 'videos'), {
            userId: user.uid,
            fileName: task.file.name,
            fps: fps,
            videoUrl: cloudUrl || 'error',
            createdAt: serverTimestamp()
          });
        } catch (e) {
          console.error('Failed to save to history', e);
        }
      })();

    } catch (err: any) {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      
      if (err.name === 'AbortError') {
        // Handled globally
        return;
      }
      
      let msg = err.message || 'Ocorreu um erro durante o processamento.';
      if (msg.includes('Failed to fetch')) {
        msg = 'Falha na conexão com o servidor. A interpolação pode ter concluído no Colab, mas ocorreu um erro de timeout (Ngrok) ou limite de tamanho ao baixar o vídeo final. Recomendamos enviar vídeos mais curtos (10-15s).';
      }
      
      setTasks(prev => prev.map(t => t.id === task.id ? { 
        ...t, 
        status: 'error', 
        errorMessage: msg 
      } : t));
    }
  };

  const processQueue = async (currentTasks: VideoTask[], fps: number, user: User) => {
    let tasksToProcess = [...currentTasks];
    for (let i = 0; i < tasksToProcess.length; i++) {
      // Re-fetch the task to check if it was cancelled
      let stillPending = false;
      setTasks(prev => {
        const t = prev.find(pt => pt.id === tasksToProcess[i].id);
        if (t && (t.status === 'pending' || t.status === 'processing')) {
           stillPending = true;
        }
        return prev;
      });
      
      if (!stillPending) continue;

      await processTask(tasksToProcess[i], fps, user);
    }
    
    // Check if everything is done
    setTasks(prev => {
      const allDone = prev.every(t => t.status === 'done' || t.status === 'error');
      if (allDone) {
        // Let BatchProcessingView show "Done" instead of changing global status right away
      }
      return prev;
    });
  };

  const handleStartProcessing = useCallback((fps: number, user: User) => {
    setTargetFps(fps);
    setCurrentUser(user);
    setGlobalStatus('processing_batch');
    
    setTasks(prev => {
      const cloned = [...prev];
      processQueue(cloned, fps, user);
      return cloned;
    });
    
  }, []);

  const handleRetry = useCallback((taskId: string) => {
    if (!currentUser) return;
    setTasks(prev => {
      const updated = prev.map(t => t.id === taskId ? { ...t, status: 'pending', errorMessage: null } : t);
      const toProcess = updated.filter(t => t.id === taskId);
      processQueue(toProcess, targetFps, currentUser);
      return updated;
    });
  }, [currentUser, targetFps]);

  const handleReset = useCallback(() => {
    tasks.forEach(task => {
      if (task.resultUrl) {
        URL.revokeObjectURL(task.resultUrl);
      }
    });
    setTasks([]);
    setGlobalStatus('idle');
    setGlobalErrorMessage(null);
  }, [tasks]);

  return (
    <AuthWrapper>
      {(user) => (
        <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-indigo-500/30">
          <Header user={user} />
          
          <main className="container mx-auto px-6 py-12">
            {globalStatus === 'idle' && (
              <UploadArea onFilesSelect={handleFilesSelect} />
            )}
            
            {globalStatus === 'configuring' && tasks.length > 0 && (
              <ConfigPanel 
                files={tasks.map(t => t.file)} 
                onStart={(fps) => handleStartProcessing(fps, user)} 
                onCancel={handleCancelConfig} 
              />
            )}
            
            {globalStatus === 'processing_batch' && (
              <BatchProcessingView 
                 tasks={tasks}
                 onCancelAll={handleCancelAll}
                 onRetry={handleRetry}
                 onReset={handleReset}
              />
            )}
          </main>
        </div>
      )}
    </AuthWrapper>
  );
}
