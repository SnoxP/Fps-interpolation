
patch_script = """
import os
import skvideo
path = os.path.dirname(skvideo.__file__)
cmd = "find " + path + " -type f -name '*.py' -exec sed -i 's/np\\.float/float/g; s/np\\.int/int/g; s/int(viddict\\[self\\.INFO_NB_FRAMES\\])/int(viddict.get(self.INFO_NB_FRAMES) or 0)/g; s/int(viddict\\[self\\.INFO_WIDTH\\])/int(viddict.get(self.INFO_WIDTH) or 0)/g; s/int(viddict\\[self\\.INFO_HEIGHT\\])/int(viddict.get(self.INFO_HEIGHT) or 0)/g' {} +"
os.system(cmd)
"""
with open("patch_skvideo.py", "w") as f:
    f.write(patch_script)
subprocess.run("python3 patch_skvideo.py", shell=True)

