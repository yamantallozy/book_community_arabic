const { sql, connectDB } = require('../config/db');

// Config
const API_URL = 'http://localhost:5000/api';
let token = '';

const loginAdmin = async () => {
    try {
        const res = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password123' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Login failed');
        token = data.token;
        console.log('✅ Admin Logged In');
    } catch (err) {
        console.error('❌ Login Failed:', err.message);
        process.exit(1);
    }
};

const createTestBookSeries = async () => {
    try {
        const payload = {
            title: 'Series Book Test',
            author: 'Test Author',
            description: 'Testing series flag.',
            isSeries: true
        };

        const res = await fetch(`${API_URL}/books`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.msg || 'Create failed');

        console.log('✅ Book Created:', data.bookId);
        return data.bookId;
    } catch (err) {
        console.error('❌ Create Book Failed:', err.message);
    }
};

const verifyMetadata = async (bookId) => {
    try {
        const res = await fetch(`${API_URL}/books/${bookId}`);
        const book = await res.json();

        if (book.IsSeries === true || book.IsSeries === 1) {
            console.log('✅ IsSeries Verified: TRUE');
        } else {
            console.error('❌ IsSeries Failed. Value:', book.IsSeries);
        }
    } catch (err) {
        console.error('❌ Verify Failed:', err.message);
    }
};

const run = async () => {
    await loginAdmin();
    const bookId = await createTestBookSeries();
    if (bookId) await verifyMetadata(bookId);
};

run();
