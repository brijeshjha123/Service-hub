const http = require('http');

const testSignup = () => {
    const postData = JSON.stringify({
        name: 'Test Customer',
        email: 'testcustomer_' + Date.now() + '@example.com',
        password: 'password123',
        role: 'customer'
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/signup',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    console.log(`Attempting signup to http://${options.hostname}:${options.port}${options.path}...`);

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

testSignup();
