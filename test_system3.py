import os
import urllib.request
url = "https://raw.githubusercontent.com/scikit-video/scikit-video/master/skvideo/io/abstract.py"
urllib.request.urlretrieve(url, "abstract_sys3.py")

with open("patch_skvideo3.py", "w") as f:
    f.write("""
import os
cmd = "find . -type f -name 'abstract_sys3.py' -exec sed -i 's/int(viddict\[self\.INFO_WIDTH\])/REPLACED_WIDTH/g' {} +"
os.system(cmd)
""")

os.system("python3 patch_skvideo3.py")

with open("abstract_sys3.py", "r") as f:
    lines = f.readlines()
    if any("REPLACED_WIDTH" in l for l in lines):
        print("Success for WIDTH!")
    else:
        print("Failed for WIDTH!")
