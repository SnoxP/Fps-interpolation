import re

with open('src/components/ConfigPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace('onStart: (fps: number, apiUrl: string) => void;', 'onStart: (fps: number) => void;')
content = content.replace('onClick={() => onStart(fps, \'\')}', 'onClick={() => onStart(fps)}')

with open('src/components/ConfigPanel.tsx', 'w') as f:
    f.write(content)

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'const handleStartProcessing = useCallback\(async \(fps: number, apiUrl: string, user: User\) => \{',
                 r'const FIXED_API_URL = "https://adena-dangerless-infrequently.ngrok-free.dev/interpolate";\n  const handleStartProcessing = useCallback(async (fps: number, user: User) => {\n    const apiUrl = FIXED_API_URL;', content)
content = content.replace('onStart={(fps, apiUrl) => handleStartProcessing(fps, apiUrl, user)}', 'onStart={(fps) => handleStartProcessing(fps, user)}')

with open('src/App.tsx', 'w') as f:
    f.write(content)

