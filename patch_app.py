import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Update handleStartProcessing signature and set fixed URL
content = re.sub(r'const handleStartProcessing = useCallback\(async \(fps: number, apiUrl: string, user: User\) => \{',
                 r'const FIXED_API_URL = "https://adena-dangerless-infrequently.ngrok-free.dev/interpolate";\n  const handleStartProcessing = useCallback(async (fps: number, apiUrl: string, user: User) => {\n    apiUrl = FIXED_API_URL;', content)

# 2. Update polling logic to map progress
old_polling = r'''            if (res.ok) {
              const data = await res.json();
              setProgress(data.progress);
              setProgressMessage(data.message);
              setSystemInfo(data.systemInfo || '');
            }'''

new_polling = r'''            if (res.ok) {
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
              setProgress(Math.round(mappedProgress));
              
              if (data.message === 'Iniciando...') {
                 setProgressMessage('Enviando e Processando via API...');
              } else {
                 setProgressMessage(data.message);
              }
              setSystemInfo(data.systemInfo || '');
            }'''
content = content.replace(old_polling, new_polling)

# 3. Fix the saving issue
old_save = r'''            await addDoc(collection(db, 'videos'), {
              userId: user.uid,
              fileName: file.name,
              fps: fps,
              videoUrl: cloudUrl,
              createdAt: serverTimestamp()
            });'''
new_save = r'''            await addDoc(collection(db, 'videos'), {
              userId: user.uid,
              fileName: file.name,
              fps: fps,
              videoUrl: cloudUrl || 'error',
              createdAt: serverTimestamp()
            });'''
content = content.replace(old_save, new_save)

with open('src/App.tsx', 'w') as f:
    f.write(content)

