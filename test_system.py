import os
import urllib.request
url = "https://raw.githubusercontent.com/scikit-video/scikit-video/master/skvideo/io/abstract.py"
urllib.request.urlretrieve(url, "abstract_sys.py")

cmd = "find . -type f -name 'abstract_sys.py' -exec sed -i 's/int(viddict\\[self\\.INFO_NB_FRAMES\\])/REPLACED/g' {} +"
print("Executing:", cmd)
os.system(cmd)

with open("abstract_sys.py", "r") as f:
    lines = f.readlines()
    if any("REPLACED" in l for l in lines):
        print("Success!")
    else:
        print("Failed!")
