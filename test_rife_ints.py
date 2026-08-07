import os
import urllib.request
import zipfile

url = "https://github.com/hzwer/arXiv2020-RIFE/archive/refs/heads/master.zip"
urllib.request.urlretrieve(url, "rife.zip")

with zipfile.ZipFile("rife.zip", 'r') as zip_ref:
    zip_ref.extractall("rife")

for root, dirs, files in os.walk("rife"):
    for file in files:
        if file.endswith(".py"):
            filepath = os.path.join(root, file)
            with open(filepath, "r") as f:
                lines = f.readlines()
                for i, line in enumerate(lines):
                    if "int(" in line:
                        print(f"{file}:{i+1}: {line.strip()}")
