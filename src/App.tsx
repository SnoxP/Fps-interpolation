import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadArea } from './components/UploadArea';
import { ConfigPanel } from './components/ConfigPanel';
import { ProcessingView } from './components/ProcessingView';
import { ResultView } from './components/ResultView';
import { AuthWrapper } from './components/AuthWrapper';
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

  const handleStartProcessing = useCallback(async (fps: number, apiUrl: string, user: User) => {
    if (!file) return;
    setStatus('processing');
    setProgress(0);
    setProgressMessage('Analyzing frames...');
    setSystemInfo('');
    setErrorMessage(null);

    let pollingInterval: number | null = null;

    try {
      if (apiUrl) {
        // Real process
        setProgressMessage('Uploading and Processing via API...');
        setProgress(5);
        
        const statusUrl = apiUrl.replace('/interpolate', '/status');
        
        pollingInterval = window.setInterval(async () => {
          try {
            const statusUrl = apiUrl.replace('/interpolate', `/status?t=${Date.now()}`);
            const res = await fetch(statusUrl, { headers: { 'ngrok-skip-browser-warning': 'true' } });
            if (res.ok) {
              const data = await res.json();
              setProgress(data.progress);
              setProgressMessage(data.message);
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
          body: formData
        });

        if (pollingInterval) clearInterval(pollingInterval);

        // Check if the response is JSON (often an error object)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.error) {
            throw new Error(data.error + (data.details ? `\n\nDetalhes: ${data.details}` : ''));
          }
        }

        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }

        setProgress(80);
        setProgressMessage('Finalizing...');
        
        const blob = await response.blob();
        console.log(`Received blob: ${blob.size} bytes, type: ${blob.type}`);
        
        if (blob.size === 0) {
          throw new Error('Received an empty video file from the API.');
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

          // Save history to Firebase
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
      } else {
        // Simulation process
        const stages = [
          { p: 10, m: 'Extracting frames...' },
          { p: 35, m: 'Running optical flow analysis...' },
          { p: 65, m: `Interpolating to ${fps} FPS...` },
          { p: 90, m: 'Encoding output video...' },
          { p: 100, m: 'Done' }
        ];

        let currentStage = 0;
        
        const simulateInterval = setInterval(() => {
          if (currentStage < stages.length) {
            setProgress(stages[currentStage].p);
            setProgressMessage(stages[currentStage].m);
            currentStage++;
          } else {
            clearInterval(simulateInterval);
            
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
      if (pollingInterval) clearInterval(pollingInterval);
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'An error occurred during processing.');
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
                  <h4 className="text-red-400 font-medium">Processing Failed</h4>
                  <p className="text-red-300/80 text-sm mt-1">{errorMessage}</p>
                  <button 
                    onClick={() => setStatus('configuring')}
                    className="text-sm font-medium text-red-400 underline mt-2 hover:text-red-300"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {(status === 'idle' || status === 'error') && (
              <UploadArea onFileSelect={handleFileSelect} />
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
