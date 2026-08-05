with open('src/components/UploadArea.tsx', 'r') as f:
    content = f.read()

content = content.replace('Array.from(e.dataTransfer.files)', 'Array.from(e.dataTransfer.files as Iterable<File>)')
content = content.replace('Array.from(e.target.files)', 'Array.from(e.target.files as Iterable<File>)')

with open('src/components/UploadArea.tsx', 'w') as f:
    f.write(content)

