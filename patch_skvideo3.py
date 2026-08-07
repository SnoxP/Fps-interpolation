
import os
cmd = "find . -type f -name 'abstract_sys3.py' -exec sed -i 's/int(viddict\[self\.INFO_WIDTH\])/REPLACED_WIDTH/g' {} +"
os.system(cmd)
