import urllib.request
url = "https://raw.githubusercontent.com/hzwer/arXiv2020-RIFE/master/inference_video.py"
urllib.request.urlretrieve(url, "inf_vid.py")
with open("inf_vid.py", "r") as f:
    for line in f:
        if "int(" in line:
            print(line.strip())
