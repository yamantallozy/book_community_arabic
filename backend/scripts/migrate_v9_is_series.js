const { sql, connectDB } = require('../config/db');

const migrate = async () => {
    try {
        await connectDB();

        // Check if column exists, if not add it
        const checkQuery = `
            IF NOT EXISTS (
                SELECT * FROM sys.columns 
                WHERE object_id = OBJECT_ID(N'[dbo].[Books]') 
                AND name = 'IsSeries'
            )
            BEGIN
                ALTER TABLE Books
                ADD IsSeries BIT DEFAULT 0;
                PRINT 'Column IsSeries added to Books table.';
            END
            ELSE
            BEGIN
                PRINT 'Column IsSeries already exists.';
            END
        `;

        await sql.query(checkQuery);
        console.log('✅ Migration v9 (IsSeries) completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
};

migrate();
