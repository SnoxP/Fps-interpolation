const fs = require('fs');
let code = fs.readFileSync('src/lib/colabScript.ts', 'utf8');
let match = code.match(/export const colabScriptContent = `([\s\S]*?)`;/);
if(match) console.log(match[1].match(/subprocess\.run.*find.*skvideo.*/)[0]);
