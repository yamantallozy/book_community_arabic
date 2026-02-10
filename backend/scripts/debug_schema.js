const { sql, connectDB } = require('../config/db');

const checkSchema = async () => {
    try {
        await connectDB();
        const result = await sql.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Books'
        `);
        console.log('Books Columns:', result.recordset.map(c => c.COLUMN_NAME));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkSchema();
