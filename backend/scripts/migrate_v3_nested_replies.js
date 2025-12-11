const { connectDB, sql } = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const migrate = async () => {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log('Starting migration v3 (Nested Replies)...');

        // Add ParentReplyID to ReviewReplies if not exists
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'ParentReplyID' AND Object_ID = Object_ID(N'ReviewReplies'))
            BEGIN
                ALTER TABLE ReviewReplies ADD ParentReplyID INT NULL;
                ALTER TABLE ReviewReplies ADD CONSTRAINT FK_ReviewReplies_Parent FOREIGN KEY (ParentReplyID) REFERENCES ReviewReplies(ReplyID);
                PRINT 'ParentReplyID column added to ReviewReplies.';
            END
            ELSE
            BEGIN
                PRINT 'ParentReplyID column already exists.';
            END
        `);

        console.log('Migration v3 completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
