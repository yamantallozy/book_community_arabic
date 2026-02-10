const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/books',
    method: 'GET'
};

const req = http.request(options, res => {
    console.log(`StatusCode: ${res.statusCode}`);

    let data = '';
    res.on('data', chunk => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('Success: Books loaded');
            // console.log(data); // Too verbose
        } else {
            console.log('Error Body:', data);
        }
    });
});

req.on('error', error => {
    console.error('Request Error:', error);
});

req.end();
