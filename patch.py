with open('src/lib/colabScript.ts', 'r') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'skvideo' in line and 'sed' in line:
        lines[i] = "subprocess.run(\"find /usr/local/lib/python3.*/dist-packages/skvideo/ -type f -name \\\"*.py\\\" -exec sed -i 's/np\\\\.float/float/g; s/np\\\\.int/int/g; s/int(viddict\\\\\\\\[self\\\\.INFO_NB_FRAMES\\\\\\\\])/int(viddict.get(self.INFO_NB_FRAMES) or 0)/g; s/int(viddict\\\\\\\\[self\\\\.INFO_WIDTH\\\\\\\\])/int(viddict.get(self.INFO_WIDTH) or 0)/g; s/int(viddict\\\\\\\\[self\\\\.INFO_HEIGHT\\\\\\\\])/int(viddict.get(self.INFO_HEIGHT) or 0)/g' {} +\", shell=True)\n"
with open('src/lib/colabScript.ts', 'w') as f:
    f.writelines(lines)
