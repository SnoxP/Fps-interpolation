patch_script = """
cmd = "find path -type f -name '*.py' -exec sed -i 's/np\\.float/float/g; s/np\\.int/int/g; s/int(viddict\\[self\\.INFO_NB_FRAMES\\])/int(viddict.get(self.INFO_NB_FRAMES) or 0)/g; s/int(viddict\\[self\\.INFO_WIDTH\\])/int(viddict.get(self.INFO_WIDTH) or 0)/g; s/int(viddict\\[self\\.INFO_HEIGHT\\])/int(viddict.get(self.INFO_HEIGHT) or 0)/g' {} +"
"""
with open("test_eval_out.py", "w") as f:
    f.write(patch_script)
