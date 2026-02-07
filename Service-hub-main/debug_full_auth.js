const http = require('http');

const TEST_EMAIL = 'customer_debug@example.com';
const TEST_PASSWORD = 'password123';

const callApi = (path, method, body) => {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(postData);
        req.end();
    });
};

const runTest = async () => {
    console.log('--- Phase 1: Cleanup Existing Test User ---');
    // We don't have a delete API exposed here easily, but we can just use a unique email if needed.
    // Let's just try signup directly. If it fails with "User already exists", that's also fine.

    console.log('--- Phase 2: Signup ---');
    const signupRes = await callApi('/api/auth/signup', 'POST', {
        name: 'Debug Customer',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        role: 'customer'
    });
    console.log('Signup Status:', signupRes.statusCode);
    console.log('Signup Res:', signupRes.body);

    console.log('--- Phase 3: Login ---');
    const loginRes = await callApi('/api/auth/login', 'POST', {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
    });
    console.log('Login Status:', loginRes.statusCode);
    console.log('Login Res:', JSON.stringify(loginRes.body.user, null, 2));
};

runTest();
