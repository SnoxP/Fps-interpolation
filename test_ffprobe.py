import urllib.request
url = "https://raw.githubusercontent.com/scikit-video/scikit-video/master/skvideo/io/ffprobe.py"
urllib.request.urlretrieve(url, "ffprobe.py")
with open("ffprobe.py", "r") as f:
    for line in f:
        if "outputdict" in line:
            pass
