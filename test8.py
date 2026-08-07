import subprocess
print("Python will run this string in shell:")
s = "find /usr/local/lib/python3.*/dist-packages/skvideo/ -type f -name \"*.py\" -exec sed -i 's/np\\.float/float/g; s/np\\.int/int/g; s/int(viddict\\[self\\.INFO_NB_FRAMES\\])/int(viddict.get(self.INFO_NB_FRAMES) or 0)/g; s/int(viddict\\[self\\.INFO_WIDTH\\])/int(viddict.get(self.INFO_WIDTH) or 0)/g; s/int(viddict\\[self\\.INFO_HEIGHT\\])/int(viddict.get(self.INFO_HEIGHT) or 0)/g' {} +"
print(s)
