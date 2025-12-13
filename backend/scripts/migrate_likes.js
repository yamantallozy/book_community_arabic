const sql = require('mssql/msnodesqlv8');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
    driver: 'msnodesqlv8',
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER || '.\\SQLEXPRESS'};Database=${process.env.DB_NAME};Trusted_Connection=yes;`
};

async function migrateLikes() {
    try {
        console.log('Connecting to database...');
        const pool = await sql.connect(config);

        console.log('Creating ReviewLikes table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ReviewLikes' AND xtype='U')
            BEGIN
                CREATE TABLE ReviewLikes (
                    LikeID INT PRIMARY KEY IDENTITY(1,1),
                    UserID INT FOREIGN KEY REFERENCES Users(UserID),
                    ReviewID INT FOREIGN KEY REFERENCES Reviews(ReviewID),
                    CreatedAt DATETIME DEFAULT GETDATE(),
                    UNIQUE (UserID, ReviewID)
                );
                PRINT 'ReviewLikes table created.';
            END
            ELSE
            BEGIN
                PRINT 'ReviewLikes table already exists.';
            END
        `);

        console.log('Creating HighlightLikes table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HighlightLikes' AND xtype='U')
            BEGIN
                CREATE TABLE HighlightLikes (
                    LikeID INT PRIMARY KEY IDENTITY(1,1),
                    UserID INT FOREIGN KEY REFERENCES Users(UserID),
                    HighlightID INT FOREIGN KEY REFERENCES Highlights(HighlightID),
                    CreatedAt DATETIME DEFAULT GETDATE(),
                    UNIQUE (UserID, HighlightID)
                );
                PRINT 'HighlightLikes table created.';
            END
            ELSE
            BEGIN
                PRINT 'HighlightLikes table already exists.';
            END
        `);

        // Check if tables allow cascading deletes or if we need to handle cleanup manually
        // For now, simpler foreign keys are fine.

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrateLikes();
