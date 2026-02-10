const { sql, connectDB } = require('../config/db');

// Config
const API_URL = 'http://localhost:5000/api';

const debugFetch = async () => {
    try {
        console.log('--- Fetching /api/books ---');
        const res = await fetch(`${API_URL}/books`);
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Raw Body:', text.substring(0, 500)); // First 500 chars
    } catch (err) {
        console.error('Fetch Error:', err.message);
    }
};

const checkColumns = async () => {
    try {
        await connectDB();
        console.log('\n--- Checking Books Table Columns ---');
        // Get one row to see actual columns
        const result = await sql.query(`SELECT TOP 1 * FROM Books`);
        if (result.recordset.length > 0) {
            console.log('Columns found in SELECT *:', Object.keys(result.recordset[0]));
        } else {
            // Fallback to schema if empty
            const schema = await sql.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'Books'
            `);
            console.log('Schema Columns:', schema.recordset.map(c => c.COLUMN_NAME));
        }
    } catch (err) {
        console.error('DB Error:', err.message);
    }
    process.exit(0);
};

const run = async () => {
    await debugFetch();
    await checkColumns();
};

run();
