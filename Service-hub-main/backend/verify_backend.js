const http = require('http');

const runRequest = (path, method, body) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({ status: res.statusCode, data: data ? JSON.parse(data) : {} });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
};

const verify = async () => {
    const email = `test${Date.now()}@example.com`;
    const password = 'password123';
    const name = 'Test User';

    console.log(`Testing with email: ${email}`);

    try {
        // 1. Signup
        console.log('--- Testing Signup ---');
        const signupRes = await runRequest('/signup', 'POST', { name, email, password });
        console.log('Signup Status:', signupRes.status);
        console.log('Signup Response:', signupRes.data);

        if (signupRes.status !== 201) {
            throw new Error('Signup failed');
        }

        // 2. Login
        console.log('\n--- Testing Login ---');
        const loginRes = await runRequest('/login', 'POST', { email, password });
        console.log('Login Status:', loginRes.status);
        console.log('Login Response:', loginRes.data);

        if (loginRes.status !== 200) {
            throw new Error('Login failed');
        }

        if (!loginRes.data.token) {
            throw new Error('Login response missing token');
        }

        console.log('\n✅ VERIFICATION SUCCESSFUL');
    } catch (err) {
        console.error('\n❌ VERIFICATION FAILED:', err.message);
        if (err.data) console.error('Error Data:', err.data);
    }
};

// Wait a bit for server to start if running immediately
setTimeout(verify, 3000);
