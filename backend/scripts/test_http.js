const http = require('http');

function get(path) {
    console.log(`Requesting ${path}...`);
    http.get(`http://localhost:5000${path}`, (res) => {
        console.log(`Status: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log(`Body length: ${data.length}`);
            console.log(`Body preview: ${data.substring(0, 200)}`);
        });
    }).on('error', (err) => {
        console.error('Error:', err.message);
    });
}

get('/api/books');
setTimeout(() => get('/api/events'), 1000);
