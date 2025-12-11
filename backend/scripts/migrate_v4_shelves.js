const { connectDB, sql } = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const migrate = async () => {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log('Starting migration v4 (UserShelves)...');

        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserShelves]') AND type in (N'U'))
            BEGIN
                CREATE TABLE UserShelves (
                    ShelfID INT IDENTITY(1,1) PRIMARY KEY,
                    UserID INT NOT NULL,
                    BookID INT NOT NULL,
                    Status NVARCHAR(50) NOT NULL CHECK (Status IN ('WantToRead', 'CurrentlyReading', 'Read')),
                    CreatedAt DATETIME DEFAULT GETDATE(),
                    UpdatedAt DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_UserShelves_User FOREIGN KEY (UserID) REFERENCES Users(UserID),
                    CONSTRAINT FK_UserShelves_Book FOREIGN KEY (BookID) REFERENCES Books(BookID),
                    CONSTRAINT UQ_UserShelves_UserBook UNIQUE (UserID, BookID)
                );
                PRINT 'UserShelves table created.';
            END
            ELSE
            BEGIN
                PRINT 'UserShelves table already exists.';
            END
        `);

        console.log('Migration v4 completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
