const { sql, connectDB } = require('../config/db');

async function checkSchema() {
    try {
        await connectDB();
        const pool = await sql.connect();

        const tables = ['Categories', 'Subgenres', 'Tags', 'Books'];

        for (const table of tables) {
            console.log(`\n--- ${table} Columns ---`);
            const result = await pool.query(`
                SELECT COLUMN_NAME, DATA_TYPE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${table}'
            `);
            if (result.recordset.length === 0) {
                console.log('(Table does not exist)');
            } else {
                result.recordset.forEach(col => console.log(`${col.COLUMN_NAME} (${col.DATA_TYPE})`));
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
