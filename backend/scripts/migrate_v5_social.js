const { connectDB, sql } = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const migrate = async () => {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log('Starting migration v5 (Social & Profile)...');

        // 1. Add new columns to Users table
        console.log('Adding specific columns to Users table...');
        const userColumnsToCheck = [
            { name: 'Location', type: 'NVARCHAR(100)' },
            { name: 'FavoriteGenres', type: 'NVARCHAR(MAX)' }, // Store as JSON or comma-separated
            { name: 'SocialLinks', type: 'NVARCHAR(MAX)' }    // Store as JSON
        ];

        for (const col of userColumnsToCheck) {
            const checkCol = await pool.request().query(`
                SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = '${col.name}'
            `);

            if (checkCol.recordset.length === 0) {
                await pool.request().query(`ALTER TABLE Users ADD ${col.name} ${col.type}`);
                console.log(`Added column ${col.name} to Users.`);
            } else {
                console.log(`Column ${col.name} already exists in Users.`);
            }
        }

        // 2. Create Follows table
        console.log('Checking/Creating Follows table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Follows]') AND type in (N'U'))
            BEGIN
                CREATE TABLE Follows (
                    FollowID INT IDENTITY(1,1) PRIMARY KEY,
                    FollowerID INT NOT NULL,
                    FollowingID INT NOT NULL,
                    CreatedAt DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_Follows_Follower FOREIGN KEY (FollowerID) REFERENCES Users(UserID),
                    CONSTRAINT FK_Follows_Following FOREIGN KEY (FollowingID) REFERENCES Users(UserID),
                    CONSTRAINT UQ_Follows_User UNIQUE (FollowerID, FollowingID),
                    CONSTRAINT CK_Follows_Self CHECK (FollowerID <> FollowingID)
                );
                PRINT 'Follows table created.';
            END
            ELSE
            BEGIN
                PRINT 'Follows table already exists.';
            END
        `);

        console.log('Migration v5 completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
