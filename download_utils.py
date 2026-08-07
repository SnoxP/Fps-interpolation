import urllib.request
url = "https://raw.githubusercontent.com/scikit-video/scikit-video/master/skvideo/utils/__init__.py"
urllib.request.urlretrieve(url, "utils.py")
with open("utils.py", "r") as f:
    for line in f:
        if "int(" in line:
            print(line.strip())
