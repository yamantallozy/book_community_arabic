const sql = require('mssql/msnodesqlv8');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
    driver: 'msnodesqlv8',
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER || '.\\SQLEXPRESS'};Database=${process.env.DB_NAME};Trusted_Connection=yes;`
};

async function migrate() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to database...');

        // Check if IsDeleted exists in Reviews
        const check = await pool.request().query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Reviews' AND COLUMN_NAME = 'IsDeleted'
        `);

        if (check.recordset.length === 0) {
            console.log('Adding IsDeleted column to Reviews table...');
            await pool.request().query(`
                ALTER TABLE Reviews ADD IsDeleted BIT DEFAULT 0;
            `);
            // Update existing records to 0
            await pool.request().query(`UPDATE Reviews SET IsDeleted = 0 WHERE IsDeleted IS NULL`);
            console.log('IsDeleted column added to Reviews.');
        } else {
            console.log('IsDeleted column already exists in Reviews.');
        }

        // Check if IsDeleted exists in ReviewReplies
        const checkReplies = await pool.request().query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'ReviewReplies' AND COLUMN_NAME = 'IsDeleted'
        `);

        if (checkReplies.recordset.length === 0) {
            // Check if ReviewReplies table exists first
            const tableCheck = await pool.request().query(`SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ReviewReplies'`);
            if (tableCheck.recordset.length > 0) {
                console.log('Adding IsDeleted column to ReviewReplies table...');
                await pool.request().query(`
                    ALTER TABLE ReviewReplies ADD IsDeleted BIT DEFAULT 0;
                `);
                await pool.request().query(`UPDATE ReviewReplies SET IsDeleted = 0 WHERE IsDeleted IS NULL`);
                console.log('IsDeleted column added to ReviewReplies.');
            }
        } else {
            console.log('IsDeleted column already exists in ReviewReplies.');
        }

        console.log('Migration completed successfully.');
        process.exit(0);

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
