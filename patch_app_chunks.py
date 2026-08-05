import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import for videoUtils
if "import { splitVideo, mergeVideos }" not in content:
    content = content.replace("import { VideoTask } from './types';", "import { VideoTask } from './types';\nimport { splitVideo, mergeVideos } from './lib/videoUtils';")

old_process = r'''  const processTask = async (task: VideoTask, fps: number, user: User) => {
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
      } : t));'''

new_process = r'''  const processTask = async (task: VideoTask, fps: number, user: User) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'processing', progress: 0, message: 'Preparando vídeo...' } : t));
    
    abortControllerRef.current = new AbortController();
    const FIXED_API_URL = "https://adena-dangerless-infrequently.ngrok-free.dev/interpolate";
    
    try {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress: 5, message: 'Analisando e dividindo vídeo...' } : t));
      const chunks = await splitVideo(task.file, 15);
      const processedChunks: Blob[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
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
              
              const chunkWeight = 80 / chunks.length;
              const baseProgress = 10 + (i * chunkWeight);
              const totalProgress = baseProgress + (mappedProgress / 100) * chunkWeight;
              
              setTasks(prev => prev.map(t => {
                if (t.id === task.id) {
                  let msg = data.message;
                  if (msg === 'Iniciando...') {
                    msg = `Enviando parte ${i + 1} de ${chunks.length}...`;
                  } else {
                    msg = `[Parte ${i + 1}/${chunks.length}] ${msg}`;
                  }
                  return { 
                    ...t, 
                    progress: Math.min(90, Math.round(totalProgress)), 
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
        const chunkFile = new File([chunk], `part${i}.mp4`, { type: 'video/mp4' });
        formData.append('file', chunkFile);
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
          throw new Error(`Erro na API na parte ${i + 1}: ${response.statusText}`);
        }

        const blob = await response.blob();
        if (blob.size === 0) {
          throw new Error(`A API retornou um arquivo vazio na parte ${i + 1}.`);
        }
        
        processedChunks.push(blob);
      }

      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress: 95, message: 'Unindo partes do vídeo...' } : t));
      
      const finalBlob = await mergeVideos(processedChunks);
      const url = URL.createObjectURL(finalBlob);
      
      setTasks(prev => prev.map(t => t.id === task.id ? { 
        ...t, 
        status: 'done', 
        progress: 100, 
        message: 'Concluído', 
        resultUrl: url 
      } : t));'''

content = content.replace(old_process, new_process)

with open('src/App.tsx', 'w') as f:
    f.write(content)
