import subprocess
subprocess.run("echo 'a[b]' | sed 's/a\\[b\\]/c/'", shell=True)
