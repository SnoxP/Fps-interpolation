import { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { UploadArea } from './components/UploadArea';
import { ConfigPanel } from './components/ConfigPanel';
import { ProcessingView } from './components/ProcessingView';
import { ResultView } from './components/ResultView';
import { AuthWrapper } from './components/AuthWrapper';
import { HistoryPanel } from './components/HistoryPanel';
import { ProcessStatus } from './types';
import { AlertCircle } from 'lucide-react';
import { db } from './lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

export default function App() {
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [systemInfo, setSystemInfo] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const apiUrlRef = useRef<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setStatus('configuring');
    setErrorMessage(null);
  }, []);

  const handleCancel = useCallback(() => {
    setFile(null);
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  const handleCancelProcessing = useCallback(async () => {
    if (apiUrlRef.current) {
      try {
        await fetch(apiUrlRef.current.replace('/interpolate', '/cancel'), { method: 'POST', headers: { 'ngrok-skip-browser-warning': 'true' } });
      } catch (e) {
        console.error('Failed to cancel on server', e);
      }
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    setStatus('configuring');
    setIsPaused(false);
    setErrorMessage('O processo foi cancelado pelo usuário.');
  }, []);

  const handlePauseProcessing = useCallback(async () => {
    if (apiUrlRef.current) {
      try {
        const res = await fetch(apiUrlRef.current.replace('/interpolate', '/pause'), { method: 'POST', headers: { 'ngrok-skip-browser-warning': 'true' } });
        if (res.ok) setIsPaused(true);
      } catch (e) {
        console.error('Failed to pause on server', e);
      }
    }
  }, []);

  const handleResumeProcessing = useCallback(async () => {
    if (apiUrlRef.current) {
      try {
        const res = await fetch(apiUrlRef.current.replace('/interpolate', '/resume'), { method: 'POST', headers: { 'ngrok-skip-browser-warning': 'true' } });
        if (res.ok) setIsPaused(false);
      } catch (e) {
        console.error('Failed to resume on server', e);
      }
    }
  }, []);

  const handleStartProcessing = useCallback(async (fps: number, apiUrl: string, user: User) => {
    if (!file) return;
    apiUrlRef.current = apiUrl;
    setStatus('processing');
    setIsPaused(false);
    setProgress(0);
    setProgressMessage('Analisando quadros...');
    setSystemInfo('');
    setErrorMessage(null);

    abortControllerRef.current = new AbortController();

    try {
      if (apiUrl) {
        // Real process
        setProgressMessage('Enviando e Processando via API...');
        setProgress(5);
        
        const statusUrl = apiUrl.replace('/interpolate', '/status');
        
        pollingIntervalRef.current = window.setInterval(async () => {
          try {
            const statusUrl = apiUrl.replace('/interpolate', `/status?t=${Date.now()}`);
            const res = await fetch(statusUrl, { headers: { 'ngrok-skip-browser-warning': 'true' } });
            if (res.ok) {
              const data = await res.json();
              if (data.status === 'paused') {
                setIsPaused(true);
              } else if (data.status === 'processing' || data.status === 'idle') {
                setIsPaused(false);
              }
              let p = data.progress || 0;
              let mappedProgress = 0;
              if (p < 10) {
                mappedProgress = (p / 10) * 5;
              } else if (p <= 90) {
                mappedProgress = 5 + ((p - 10) / 80) * 90;
              } else {
                mappedProgress = 95 + ((p - 90) / 10) * 5;
              }
              setProgress(Math.round(mappedProgress));
              
              if (data.message === 'Iniciando...') {
                 setProgressMessage('Enviando e Processando via API...');
              } else {
                 setProgressMessage(data.message);
              }
              setSystemInfo(data.systemInfo || '');
            }
          } catch (e) {
            // Ignore polling errors
          }
        }, 1500);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fps', fps.toString());

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'ngrok-skip-browser-warning': 'true'
          },
          body: formData,
          signal: abortControllerRef.current.signal
        });

        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

        // Check if the response is JSON (often an error object)
        const resContentType = response.headers.get('content-type');
        if (resContentType && resContentType.includes('application/json')) {
          const data = await response.json();
          if (data.error) {
            throw new Error(data.error + (data.details ? `\n\nDetalhes: ${data.details}` : ''));
          }
        }

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.statusText}`);
        }

        setProgress(80);
        setProgressMessage('Finalizando...');
        
        const resContentType2 = response.headers.get('content-type');
        let cloudUrl = null;
        let finalUrl = null;
        let blob = null;
        
        if (resContentType2 && resContentType2.includes('application/json')) {
            const data = await response.json();
            if (data.url) {
                cloudUrl = data.url;
                finalUrl = data.url;
            } else if (data.error) {
                throw new Error(data.error);
            }
        } else {
            blob = await response.blob();
            if (blob.size === 0) {
              throw new Error('O vídeo retornado está vazio.');
            }
            finalUrl = URL.createObjectURL(blob);
        }

        console.log(`Received blob: ${blob.size} bytes, type: ${blob.type}`);
        
        if (blob.size === 0) {
          throw new Error('A API retornou um arquivo de vídeo vazio.');
        }

        const url = URL.createObjectURL(blob);
        
        setProgress(100);
        setResultUrl(url);
        setStatus('done');
        
        // Save to cloud in background
        (async () => {
          let cloudUrl = null;
          try {
            const formData = new FormData();
            formData.append('reqtype', 'fileupload');
            formData.append('time', '1h');
            const resultFileName = file.name.replace(/\.[^/.]+$/, "") + ".mp4";
            formData.append('fileToUpload', blob, resultFileName);

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

          // Save history to Firebase
          try {
            await addDoc(collection(db, 'videos'), {
              userId: user.uid,
              fileName: file.name,
              fps: fps,
              videoUrl: cloudUrl || 'error',
              createdAt: serverTimestamp()
            });
          } catch (e) {
            console.error('Failed to save to history', e);
          }
        })();
      } else {
        // Simulation process
        const stages = [
          { p: 10, m: 'Extraindo quadros...' },
          { p: 35, m: 'Executando análise de fluxo óptico...' },
          { p: 65, m: `Interpolando para ${fps} FPS...` },
          { p: 90, m: 'Codificando vídeo de saída...' },
          { p: 100, m: 'Concluído' }
        ];

        let currentStage = 0;
        
        pollingIntervalRef.current = window.setInterval(() => {
          if (currentStage < stages.length) {
            setProgress(stages[currentStage].p);
            setProgressMessage(stages[currentStage].m);
            currentStage++;
          } else {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            
            // In simulation, we just return the original file as a mock result
            const url = URL.createObjectURL(file);
            setResultUrl(url);
            setStatus('done');

            // Save to cloud in background
            (async () => {
              let cloudUrl = null;
              try {
                const formData = new FormData();
                formData.append('reqtype', 'fileupload');
                formData.append('time', '1h');
                formData.append('fileToUpload', file, file.name);

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
                  fileName: file.name,
                  fps: fps,
                  videoUrl: cloudUrl,
                  createdAt: serverTimestamp()
                });
              } catch (e) {
                console.error('Failed to save to history', e);
              }
            })();
          }
        }, 1500);
      }
    } catch (err: any) {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (err.name === 'AbortError') {
        console.log('Process aborted');
        return;
      }
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Ocorreu um erro durante o processamento.');
    }
  }, [file]);

  const handleReset = useCallback(() => {
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }
    setFile(null);
    setResultUrl(null);
    setStatus('idle');
    setErrorMessage(null);
  }, [resultUrl]);

  return (
    <AuthWrapper>
      {(user) => (
        <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-indigo-500/30">
          <Header user={user} />
          
          <main className="container mx-auto px-6 py-12">
            {status === 'error' && (
              <div className="w-full max-w-2xl mx-auto mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-400 font-medium">Falha no Processamento</h4>
                  <p className="text-red-300/80 text-sm mt-1">{errorMessage}</p>
                  <button 
                    onClick={() => setStatus('configuring')}
                    className="text-sm font-medium text-red-400 underline mt-2 hover:text-red-300"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            )}

            {(status === 'idle' || status === 'error') && (
              <>
                <UploadArea onFileSelect={handleFileSelect} />
                <HistoryPanel user={user} />
              </>
            )}

            {status === 'configuring' && file && (
              <ConfigPanel 
                file={file} 
                onStart={(fps, apiUrl) => handleStartProcessing(fps, apiUrl, user)} 
                onCancel={handleCancel} 
              />
            )}

            {status === 'processing' && (
              <ProcessingView 
                progress={progress} 
                message={progressMessage} 
                systemInfo={systemInfo}
                isPaused={isPaused}
                onCancel={handleCancelProcessing}
                onPause={handlePauseProcessing}
                onResume={handleResumeProcessing}
              />
            )}

            {status === 'done' && file && resultUrl && (
              <ResultView 
                originalFile={file} 
                resultUrl={resultUrl} 
                onReset={handleReset} 
              />
            )}
          </main>
        </div>
      )}
    </AuthWrapper>
  );
}
