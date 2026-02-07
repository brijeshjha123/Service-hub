const http = require('http');

const testLogin = () => {
    const postData = JSON.stringify({
        email: 'admin@servicehub.com', // Using a known default admin account for testing connectivity
        password: 'admin123'
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    console.log(`Attempting login to http://${options.hostname}:${options.port}${options.path}...`);

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log('Status Code:', res.statusCode);
            try {
                const parsedData = JSON.parse(data);
                console.log('Response Body:', JSON.stringify(parsedData, null, 2));
            } catch (e) {
                console.log('Raw Response Body:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.write(postData);
    req.end();
};

testLogin();
