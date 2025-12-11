const { connectDB, sql } = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const migrate = async () => {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log('Starting migration v5 (Admin Role)...');

        // Add IsAdmin to Users
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'IsAdmin' AND Object_ID = Object_ID(N'Users'))
            BEGIN
                ALTER TABLE Users ADD IsAdmin BIT DEFAULT 0;
                PRINT 'IsAdmin column added to Users.';
            END
            ELSE
            BEGIN
                PRINT 'IsAdmin column already exists in Users.';
            END
        `);

        // Update existing users to be non-admins (IsAdmin = 0) if null
        await pool.request().query(`UPDATE Users SET IsAdmin = 0 WHERE IsAdmin IS NULL`);

        console.log('Migration v5 completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
