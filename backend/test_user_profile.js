// Native fetch is available in Node 20+
const BASE_URL = 'http://localhost:5000/api';
const timestamp = Date.now();
const userData = { username: `profileUser_${timestamp}`, email: `profile_${timestamp}@test.com`, password: 'password123' };

const runTest = async () => {
    try {
        console.log('--- Starting User Profile Test ---');

        // 1. Register User
        console.log('Registering user...');
        const regRes = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const user = await regRes.json();

        if (!user.token) throw new Error('Registration failed');
        console.log('User registered, ID:', user.id);

        // 2. Fetch Initial Profile (Should be empty bio)
        console.log('Fetching initial profile...');
        const profileRes = await fetch(`${BASE_URL}/users/${user.id}`);
        const profile = await profileRes.json();

        if (profileRes.status !== 200) throw new Error('Failed to fetch profile');
        console.log('Initial Bio:', profile.bio); // Should be null

        // 3. Update Profile
        console.log('Updating profile...');
        const updateRes = await fetch(`${BASE_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ bio: 'Hello World', avatar: 'http://avatar.com/img.png' })
        });

        if (updateRes.status !== 200) {
            const txt = await updateRes.text();
            throw new Error(`Update failed: ${txt}`);
        }
        console.log('PASS: Profile updated.');

        // 4. Verify Update
        console.log('Verifying update...');
        const verifyRes = await fetch(`${BASE_URL}/users/${user.id}`);
        const verifyProfile = await verifyRes.json();

        if (verifyProfile.bio === 'Hello World' && verifyProfile.avatar === 'http://avatar.com/img.png') {
            console.log('PASS: Profile Data Verified.');
        } else {
            console.error('FAIL: Profile data mismatch', verifyProfile);
        }

        console.log('--- ALL TESTS PASSED ---');

    } catch (err) {
        console.error('TEST FAILED:', err);
    }
};

runTest();
