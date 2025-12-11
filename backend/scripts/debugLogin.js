const testLogin = async () => {
    console.log('--- Debugging Login (using fetch) ---');
    const url = 'http://localhost:5000/api/users/login';
    const email = 'albaraatallozy14@gmail.com'; // From user screenshot

    const testUser = {
        username: 'DebugUser',
        email: 'debug' + Date.now() + '@test.com',
        password: 'password123'
    };

    try {
        console.log(`1. Attempting to Register new user: ${testUser.username}`);
        const regRes = await fetch('http://localhost:5000/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        const regData = await regRes.json();
        console.log(`Response Status: ${regRes.status}`);
        console.log('Reg Data:', regData);

        if (regRes.ok) {
            console.log(`2. Attempting to Login with: ${testUser.email}`);
            const loginRes = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testUser.email,
                    password: testUser.password
                })
            });
            const loginData = await loginRes.json();
            console.log(`Login Status: ${loginRes.status}`);
            console.log('Login Data:', loginData);
        }

    } catch (err) {
        console.log('❌ Error:', err.message);
    }
};

testLogin();
