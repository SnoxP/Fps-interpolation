const fetch = require('node-fetch');
fetch('https://litterbox.catbox.moe/user/api.php', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:3000',
    'Access-Control-Request-Method': 'POST'
  }
}).then(res => {
  console.log('CORS headers:', res.headers.raw());
});
