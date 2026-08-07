const fs = require('fs');
let code = fs.readFileSync('src/lib/colabScript.ts', 'utf8');
let match = code.match(/export const colabScriptContent = `([\s\S]*?)`;/);
if (match) {
    let pythonCode = match[1];
    let lines = pythonCode.split('\n');
    for(let i=0; i<40; i++) console.log(lines[i]);
}
