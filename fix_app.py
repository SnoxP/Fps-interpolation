import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace any duplicated fixed URLs and apiUrl assignments
content = re.sub(r'(const FIXED_API_URL = "https://adena-dangerless-infrequently\.ngrok-free\.dev/interpolate";\s*)+', 
                 'const FIXED_API_URL = "https://adena-dangerless-infrequently.ngrok-free.dev/interpolate";\n', content)

content = re.sub(r'const handleStartProcessing = useCallback\(async \(fps: number, user: User\) => \{\s*const apiUrl = FIXED_API_URL;\s*apiUrl = FIXED_API_URL;',
                 'const handleStartProcessing = useCallback(async (fps: number, user: User) => {\n    const apiUrl = FIXED_API_URL;', content)


with open('src/App.tsx', 'w') as f:
    f.write(content)

