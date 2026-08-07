import os
import urllib.request
url = "https://raw.githubusercontent.com/scikit-video/scikit-video/master/skvideo/io/abstract.py"
urllib.request.urlretrieve(url, "abstract_sys2.py")

with open("patch_skvideo2.py", "w") as f:
    f.write("""
import os
cmd = "find . -type f -name 'abstract_sys2.py' -exec sed -i 's/int(viddict\[self\.INFO_NB_FRAMES\])/REPLACED/g' {} +"
os.system(cmd)
""")

os.system("python3 patch_skvideo2.py")

with open("abstract_sys2.py", "r") as f:
    lines = f.readlines()
    if any("REPLACED" in l for l in lines):
        print("Success!")
    else:
        print("Failed!")
