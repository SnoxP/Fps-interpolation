const fs = require('fs');
console.log(fs.readFileSync('src/lib/colabScript.ts', 'utf8').includes('patch_skvideo.py'));
