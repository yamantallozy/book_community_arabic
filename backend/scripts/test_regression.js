const { sql, connectDB } = require('../config/db');

// Config
const API_URL = 'http://localhost:5000/api';

const run = async () => {
    try {
        console.log('--- Fetching /api/books (Regression Test) ---');
        const res = await fetch(`${API_URL}/books`);
        console.log('Status:', res.status);
        if (res.status === 200) {
            console.log('✅ Server seems alive and working.');
        } else {
            const text = await res.text();
            console.log('❌ Server still failing:', text);
        }
    } catch (err) {
        console.error('Fetch Error:', err.message);
    }
};

run();
