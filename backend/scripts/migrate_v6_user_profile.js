const { connectDB, sql } = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const migrate = async () => {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log('Starting migration v6 (User Profile)...');

        // Add Bio column
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'Bio' AND Object_ID = Object_ID(N'Users'))
            BEGIN
                ALTER TABLE Users ADD Bio NVARCHAR(MAX) NULL;
                PRINT 'Bio column added to Users.';
            END
        `);

        // Add Avatar column (URL)
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'Avatar' AND Object_ID = Object_ID(N'Users'))
            BEGIN
                ALTER TABLE Users ADD Avatar NVARCHAR(500) NULL;
                PRINT 'Avatar column added to Users.';
            END
        `);

        console.log('Migration v6 completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
