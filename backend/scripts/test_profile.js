const API_URL = 'http://localhost:5000/api';

async function testFetchProfile() {
    try {
        console.log('Fetching profile for ID 1...');
        const res = await fetch(`${API_URL}/users/1`);

        if (res.ok) {
            const data = await res.json();
            console.log('Success! Found user:', data.username);
        } else {
            console.log('Failed:', res.status, await res.text());
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

testFetchProfile();
