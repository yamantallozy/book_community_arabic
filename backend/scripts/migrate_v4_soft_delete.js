const { connectDB, sql } = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const migrate = async () => {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log('Starting migration v4 (Soft Delete)...');

        // Add IsDeleted to Reviews
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'IsDeleted' AND Object_ID = Object_ID(N'Reviews'))
            BEGIN
                ALTER TABLE Reviews ADD IsDeleted BIT DEFAULT 0;
                PRINT 'IsDeleted column added to Reviews.';
            END
            ELSE
            BEGIN
                PRINT 'IsDeleted column already exists in Reviews.';
            END
        `);

        // Add IsDeleted to ReviewReplies
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'IsDeleted' AND Object_ID = Object_ID(N'ReviewReplies'))
            BEGIN
                ALTER TABLE ReviewReplies ADD IsDeleted BIT DEFAULT 0;
                PRINT 'IsDeleted column added to ReviewReplies.';
            END
            ELSE
            BEGIN
                PRINT 'IsDeleted column already exists in ReviewReplies.';
            END
        `);

        // Update existing records to default 0 (though ALTER DEFAULT takes care of future, existing might be NULL? No, nullable int usually. Let's force update if needed)
        // With ALTER TABLE ... ADD ... DEFAULT 0, existing rows get the default value if NOT NULL is specified.
        // If we didn't specify NOT NULL, we should probably update them.
        await pool.request().query(`UPDATE Reviews SET IsDeleted = 0 WHERE IsDeleted IS NULL`);
        await pool.request().query(`UPDATE ReviewReplies SET IsDeleted = 0 WHERE IsDeleted IS NULL`);

        console.log('Migration v4 completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
