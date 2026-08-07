with open('src/lib/colabScript.ts', 'r') as f:
    content = f.read()

old_skvideo = """subprocess.run("find /usr/local/lib/python3.*/dist-packages/skvideo/ -type f -name \\"*.py\\" -exec sed -i 's/np\.float/float/g; s/np\.int/int/g' {} +", shell=True)"""
new_skvideo = """subprocess.run("find /usr/local/lib/python3.*/dist-packages/skvideo/ -type f -name \\"*.py\\" -exec sed -i 's/np\.float/float/g; s/np\.int/int/g; s/int(viddict\\[\\([^\\]]*\\)\\])/int(viddict[\\\\1] or 0)/g' {} +", shell=True)"""
content = content.replace(old_skvideo, new_skvideo)

with open('src/lib/colabScript.ts', 'w') as f:
    f.write(content)
