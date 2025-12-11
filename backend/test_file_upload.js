const fs = require('fs');
const path = require('path');

// Ensure we have a dummy image
const dummyParams = {
    username: 'uploadUser_' + Date.now(),
    email: 'upload_' + Date.now() + '@test.com',
    password: 'password123'
};

const BASE_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        console.log('--- Starting File Upload Test ---');

        // 1. Create dummy image
        const imgPath = path.join(__dirname, 'test_image.png');
        if (!fs.existsSync(imgPath)) {
            // Create a small 1x1 png (base64)
            const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
            fs.writeFileSync(imgPath, buffer);
        }

        // 2. Register
        console.log('Registering user...', dummyParams.email);
        const regRes = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dummyParams)
        });
        const user = await regRes.json();
        if (!user.token) throw new Error('Registration failed: ' + JSON.stringify(user));
        console.log('User registered ID:', user.id);

        // 3. Upload File
        console.log('Uploading avatar...');
        const formData = new FormData();
        formData.append('bio', 'I have an image now!');

        // Read file as blob
        const fileBuffer = fs.readFileSync(imgPath);
        const fileBlob = new Blob([fileBuffer], { type: 'image/png' });
        formData.append('avatar', fileBlob, 'test_image.png');

        const uploadRes = await fetch(`${BASE_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${user.token}`
                // Note: Do NOT set Content-Type header when using FormData, fetch sets it with boundary
            },
            body: formData
        });

        if (uploadRes.status !== 200) {
            const txt = await uploadRes.text();
            throw new Error('Upload failed: ' + txt);
        }

        const uploadData = await uploadRes.json();
        console.log('Upload Response:', uploadData);

        if (!uploadData.avatar || !uploadData.avatar.includes('/uploads/')) {
            throw new Error('Avatar URL invalid: ' + uploadData.avatar);
        }

        console.log('PASS: Avatar updated to:', uploadData.avatar);

        // 4. Cleanup (optional)
        // fs.unlinkSync(imgPath);

    } catch (err) {
        console.error('TEST FAILED:', err);
    }
};

runTest();
