const { connectDB, sql } = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const migrate = async () => {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log('Starting migration...');

        // 1. Add Unique Constraint to Reviews (UserID, BookID)
        // We use a try-catch block in SQL via checking existence to avoid errors if run multiple times
        try {
            await pool.request().query(`
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_Reviews_User_Book' AND object_id = OBJECT_ID('Reviews'))
                BEGIN
                    ALTER TABLE Reviews ADD CONSTRAINT UQ_Reviews_User_Book UNIQUE(UserID, BookID);
                    PRINT 'Unique constraint added to Reviews.';
                END
                ELSE
                BEGIN
                    PRINT 'Unique constraint already exists on Reviews.';
                END
            `);
        } catch (err) {
            console.log('Error adding unique constraint (might already exist or violations present):', err.message);
        }

        // 2. Create ReviewReplies Table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ReviewReplies')
            BEGIN
                CREATE TABLE ReviewReplies (
                    ReplyID INT PRIMARY KEY IDENTITY(1,1),
                    ReviewID INT FOREIGN KEY REFERENCES Reviews(ReviewID) ON DELETE CASCADE,
                    UserID INT FOREIGN KEY REFERENCES Users(UserID),
                    Comment NVARCHAR(MAX) NOT NULL,
                    CreatedAt DATETIME DEFAULT GETDATE()
                );
                PRINT 'ReviewReplies table created.';
            END
            ELSE
            BEGIN
                PRINT 'ReviewReplies table already exists.';
            END
        `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
