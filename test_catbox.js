fetch('https://catbox.moe/user/api.php', { method: 'OPTIONS' }).then(res => { console.log("Status: " + res.status); console.log("CORS: " + res.headers.get('Access-Control-Allow-Origin')); })
