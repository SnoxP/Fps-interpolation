const fs = require('fs');
let code = fs.readFileSync('src/lib/colabScript.ts', 'utf8');
let match = code.match(/export const colabScriptContent = `([\s\S]*?)`;/);
if(match) {
    let pythonCode = match[1];
    let lines = pythonCode.split('\n');
    lines.forEach((line, i) => {
        if(line.includes('re.search')) console.log("Line " + i + ": " + line);
    });
}
