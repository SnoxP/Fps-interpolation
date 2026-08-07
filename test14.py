import subprocess
with open('test14.txt', 'w') as f:
    f.write('self.inputframenum = int(viddict[self.INFO_NB_FRAMES])\n')
subprocess.run("sed -i 's/int(viddict\\[self\\.INFO_NB_FRAMES\\])/int(viddict.get(self.INFO_NB_FRAMES) or 0)/g' test14.txt", shell=True)
with open('test14.txt', 'r') as f:
    print(f.read())
