import urllib.request
import os

files = [
    "skvideo/io/abstract.py",
    "skvideo/io/ffmpeg.py",
    "skvideo/io/ffprobe.py",
    "skvideo/io/mplayer.py",
    "skvideo/io/v4l2.py",
]
for f in files:
    url = f"https://raw.githubusercontent.com/scikit-video/scikit-video/master/{f}"
    filename = os.path.basename(f)
    urllib.request.urlretrieve(url, filename)
    with open(filename, "r") as fp:
        for line in fp:
            if "int(" in line:
                print(f"{filename}: {line.strip()}")
