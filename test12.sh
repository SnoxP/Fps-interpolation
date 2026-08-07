cat << 'PY' > test12.py
self.inputframenum = int(viddict[self.INFO_NB_FRAMES])
PY
sed -i 's/int(viddict\[self\.INFO_NB_FRAMES\])/int(viddict.get(self.INFO_NB_FRAMES) or 0)/g' test12.py
cat test12.py
