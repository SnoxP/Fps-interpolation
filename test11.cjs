const fs = require('fs');
let code = fs.readFileSync('src/lib/colabScript.ts', 'utf8');
console.log(code.includes('subprocess.run("find /usr/local/lib/python3.*/dist-packages/skvideo/ -type f -name \\"*.py\\" -exec sed -i \\\'s/np\\\\.float/float/g'));
