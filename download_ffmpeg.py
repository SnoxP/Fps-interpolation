import urllib.request
url = "https://raw.githubusercontent.com/scikit-video/scikit-video/master/skvideo/io/ffmpeg.py"
urllib.request.urlretrieve(url, "ffmpeg.py")
with open("ffmpeg.py", "r") as f:
    for line in f:
        if "int(" in line:
            print(line.strip())
