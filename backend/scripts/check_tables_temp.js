const { sql, connectDB } = require('../config/db');

async function checkTables() {
    try {
        await connectDB();
        const pool = await sql.connect();
        const result = await pool.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
        console.log('Tables in DB:', result.recordset.map(r => r.TABLE_NAME));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkTables();
