import urllib.request
import subprocess
url = "https://raw.githubusercontent.com/scikit-video/scikit-video/master/skvideo/io/abstract.py"
urllib.request.urlretrieve(url, "abstract.py")
subprocess.run("sed -i 's/int(viddict\\[self\\.INFO_NB_FRAMES\\])/int(viddict.get(self.INFO_NB_FRAMES) or 0)/g' abstract.py", shell=True)
with open("abstract.py", "r") as f:
    for line in f:
        if "INFO_NB_FRAMES" in line:
            print(line.strip())
