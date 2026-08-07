import urllib.request
url = "https://raw.githubusercontent.com/scikit-video/scikit-video/master/skvideo/io/abstract.py"
urllib.request.urlretrieve(url, "abstract.py")
with open("abstract.py", "r") as f:
    for line in f:
        if "int(" in line:
            print(line.strip())
