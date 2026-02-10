const { sql, connectDB } = require('../config/db');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function testWorkflow() {
    try {
        console.log('--- STARTING RBAC WORKFLOW TEST ---');
        await connectDB();

        // Helper for fetch
        const post = async (url, body, token) => {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || data.message || 'Request failed');
            return data;
        };

        const get = async (url, token) => {
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(url, { headers });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || data.message || 'Request failed');
            return data;
        };

        const put = async (url, body, token) => {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(url, {
                method: 'PUT',
                headers,
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || data.message || 'Request failed');
            return data;
        };

        // 1. Create Normal User
        const uniqueSuffix = Date.now();
        const userEmail = `user${uniqueSuffix}@test.com`;
        const userPass = 'password123';
        console.log(`\n1. Registering Normal User: ${userEmail}`);

        let userToken;
        try {
            const res = await post(`${API_URL}/users`, {
                username: 'Test User',
                email: userEmail,
                password: userPass
            });
            userToken = res.token;
            console.log('User Registered. Role:', res.role);
        } catch (e) {
            console.error('Registration failed:', e.message);
            process.exit(1);
        }

        // 2. Submit a PENDING Book
        console.log('\n2. Submitting a Book (Should be PENDING)');
        let bookId;
        try {
            const res = await post(`${API_URL}/books`, {
                title: `Test Book ${uniqueSuffix}`,
                author: 'Test Author',
                description: 'Pending book description',
                coverImageURL: 'http://example.com/cover.jpg'
            }, userToken);
            bookId = res.bookId;
            console.log('Book Submitted. ID:', bookId);
        } catch (e) {
            console.error('Submission failed:', e.message);
            process.exit(1);
        }

        // 3. Verify Public API does NOT show it
        console.log('\n3. Verifying Public API (Should NOT see the book)');
        const publicRes = await get(`${API_URL}/books`);
        const foundPublic = publicRes.find(b => b.BookID === bookId);
        if (foundPublic) {
            console.error('FAIL: Pending book is visible publicly!');
            process.exit(1);
        } else {
            console.log('PASS: Book is hidden from public API.');
        }

        // 4. Create/Get Admin User
        const adminEmail = `admin${uniqueSuffix}@test.com`;
        console.log(`\n4. Creating Admin User: ${adminEmail}`);
        let adminToken;

        // Register as normal first
        await post(`${API_URL}/users`, { username: 'Admin User', email: adminEmail, password: userPass });

        // Manually promote in DB
        const pool = await sql.connect();
        await pool.request().query(`UPDATE Users SET Role = 'admin' WHERE Email = '${adminEmail}'`);

        // Login to get updated token
        const loginRes = await post(`${API_URL}/users/login`, { email: adminEmail, password: userPass });
        adminToken = loginRes.token;
        console.log('Admin Logged in. Role:', loginRes.role);

        // 5. Fetch Pending Books as Admin
        console.log('\n5. Fetching Pending Books as Admin');
        try {
            const pendingRes = await get(`${API_URL}/books/pending`, adminToken);
            const foundPending = pendingRes.find(b => b.BookID === bookId);
            if (foundPending) {
                console.log('PASS: Admin found the pending book.');
            } else {
                console.error('FAIL: Admin could NOT find the pending book.');
                process.exit(1);
            }
        } catch (e) {
            console.error('Admin fetch failed:', e.message);
            process.exit(1);
        }

        // 6. Approve Book
        console.log('\n6. Approving Book...');
        try {
            await put(`${API_URL}/books/${bookId}/review`, {
                status: 'APPROVED'
            }, adminToken);
            console.log('Book Approved.');
        } catch (e) {
            console.error('Approval failed:', e.message);
            process.exit(1);
        }

        // 7. Verify Public API SHOWS it now
        console.log('\n7. Verifying Public API (Should SEE the book)');
        const publicRes2 = await get(`${API_URL}/books`);
        const foundPublic2 = publicRes2.find(b => b.BookID === bookId);
        if (foundPublic2) {
            console.log('PASS: Approved book is now visible publicly.');
        } else {
            console.error('FAIL: Approved book is still NOT visible!');
            process.exit(1);
        }

        console.log('\n--- SUCCESS: ALL TESTS PASSED ---');
        process.exit(0);

    } catch (err) {
        console.error('Test Failed:', err);
        process.exit(1);
    }
}

testWorkflow();
