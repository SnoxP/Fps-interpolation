import subprocess
try:
    subprocess.run("pip install numpy==1.26.4", shell=True)
except:
    pass

import numpy as np
try:
    print("Trying int(np.round(None))")
    int(np.round(None))
except Exception as e:
    print(type(e).__name__, e)
