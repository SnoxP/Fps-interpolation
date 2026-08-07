const fs = require('fs');
let code = fs.readFileSync('src/lib/colabScript.ts', 'utf8');
let match = code.match(/export const colabScriptContent = `([\s\S]*?)`;/);
if (match) {
    let py = match[1];
    let lines = py.split('\n');
    lines.forEach(l => {
        if(l.includes('find ')) console.log(l);
    });
}
