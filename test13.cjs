const fs = require('fs');
let code = fs.readFileSync('src/lib/colabScript.ts', 'utf8');
let match = code.match(/export const colabScriptContent = `([\s\S]*?)`;/);
if (match) {
    let pythonCode = match[1];
    console.log(pythonCode.includes('int(viddict.get(self.INFO_NB_FRAMES) or 0)'));
    let lines = pythonCode.split('\n');
    lines.forEach(line => {
        if(line.includes('sed -i')) console.log(line);
    });
}
