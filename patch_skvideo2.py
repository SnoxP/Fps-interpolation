
import os
cmd = "find . -type f -name 'abstract_sys2.py' -exec sed -i 's/int(viddict\[self\.INFO_NB_FRAMES\])/REPLACED/g' {} +"
os.system(cmd)
