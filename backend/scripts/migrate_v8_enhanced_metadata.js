const { sql, connectDB } = require('../config/db');

async function migrate() {
    try {
        await connectDB();
        const pool = await sql.connect();
        console.log('Connected to database...');

        // Helper to safely add column
        const addColumn = async (table, colName, colType) => {
            const result = await pool.query(`
                SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${table}' AND COLUMN_NAME = '${colName}'
            `);
            if (result.recordset.length === 0) {
                console.log(`Adding ${colName} to ${table}...`);
                await pool.query(`ALTER TABLE ${table} ADD ${colName} ${colType}`);
            } else {
                console.log(`Column ${colName} in ${table} exists.`);
            }
        };

        // 1. Ensure Tables Exist
        const createTable = async (name, query) => {
            const result = await pool.query(`SELECT * FROM sysobjects WHERE name='${name}' AND xtype='U'`);
            if (result.recordset.length === 0) {
                console.log(`Creating table ${name}...`);
                await pool.query(query);
            } else {
                console.log(`Table ${name} exists.`);
            }
        }

        await createTable('Categories', `
            CREATE TABLE Categories (
                CategoryID INT IDENTITY(1,1) PRIMARY KEY,
                Name NVARCHAR(100) NOT NULL UNIQUE
            )
        `);
        await addColumn('Categories', 'DisplayName_Ar', 'NVARCHAR(100)');

        await createTable('Subgenres', `
            CREATE TABLE Subgenres (
                SubgenreID INT IDENTITY(1,1) PRIMARY KEY,
                Name NVARCHAR(100) NOT NULL,
                CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID)
            )
        `);
        await addColumn('Subgenres', 'DisplayName_Ar', 'NVARCHAR(100)');

        await createTable('Tags', `
            CREATE TABLE Tags (
                TagID INT IDENTITY(1,1) PRIMARY KEY,
                Name NVARCHAR(100) NOT NULL UNIQUE
            )
        `);
        await addColumn('Tags', 'DisplayName_Ar', 'NVARCHAR(100)');

        await createTable('BookSubgenres', `
            CREATE TABLE BookSubgenres (
                BookID INT FOREIGN KEY REFERENCES Books(BookID),
                SubgenreID INT FOREIGN KEY REFERENCES Subgenres(SubgenreID),
                PRIMARY KEY (BookID, SubgenreID)
            )
        `);

        await createTable('BookTags', `
            CREATE TABLE BookTags (
                BookID INT FOREIGN KEY REFERENCES Books(BookID),
                TagID INT FOREIGN KEY REFERENCES Tags(TagID),
                PRIMARY KEY (BookID, TagID)
            )
        `);

        // 2. Seed Data (Upsert)
        console.log('Seeding metadata...');
        // Removed N prefix for Javascript strings
        const categories = [
            { n: 'Novel', ar: 'رواية' }, { n: 'Non-Fiction', ar: 'كتب غير فكرية' },
            { n: 'Poetry', ar: 'شعر' }, { n: 'Science', ar: 'علوم' },
            { n: 'History', ar: 'تاريخ' }, { n: 'Religion', ar: 'دين' },
            { n: 'Philosophy', ar: 'فلسفة' }, { n: 'Self-Help', ar: 'تطوير الذات' },
            { n: 'Biographies', ar: 'سير ذاتية' }
        ];

        for (const cat of categories) {
            // Upsert Category
            const check = await pool.request().input('n', sql.NVarChar, cat.n).query(`SELECT CategoryID FROM Categories WHERE Name = @n`);
            if (check.recordset.length === 0) {
                await pool.request().input('n', sql.NVarChar, cat.n).input('ar', sql.NVarChar, cat.ar)
                    .query(`INSERT INTO Categories (Name, DisplayName_Ar) VALUES (@n, @ar)`);
            } else {
                await pool.request().input('n', sql.NVarChar, cat.n).input('ar', sql.NVarChar, cat.ar)
                    .query(`UPDATE Categories SET DisplayName_Ar = @ar WHERE Name = @n`);
            }
        }

        const tags = [
            { n: 'Dystopian', ar: 'ديستوبيا' }, { n: 'Feminism', ar: 'نسوية' },
            { n: 'Politics', ar: 'سياسة' }, { n: 'War', ar: 'حرب' },
            { n: 'Romance', ar: 'رومانسية' }, { n: 'Mental Health', ar: 'صحة نفسية' }
        ];

        for (const tag of tags) {
            const check = await pool.request().input('n', sql.NVarChar, tag.n).query(`SELECT TagID FROM Tags WHERE Name = @n`);
            if (check.recordset.length === 0) {
                await pool.request().input('n', sql.NVarChar, tag.n).input('ar', sql.NVarChar, tag.ar)
                    .query(`INSERT INTO Tags (Name, DisplayName_Ar) VALUES (@n, @ar)`);
            } else {
                await pool.request().input('n', sql.NVarChar, tag.n).input('ar', sql.NVarChar, tag.ar)
                    .query(`UPDATE Tags SET DisplayName_Ar = @ar WHERE Name = @n`);
            }
        }


        // 3. Add Enhanced Metadata Columns to Books
        console.log('Adding enhanced metadata columns to Books...');
        const newCols = [
            { name: 'CategoryID', type: 'INT', fk: 'FOREIGN KEY REFERENCES Categories(CategoryID)' },
            { name: 'Translator', type: 'NVARCHAR(255)' },
            { name: 'Publisher', type: 'NVARCHAR(255)' },
            { name: 'PageCount', type: 'INT' },
            { name: 'OriginalLanguage', type: 'NVARCHAR(100)' },
            { name: 'PublicationYear', type: 'INT' },
            { name: 'ISBN', type: 'NVARCHAR(50)' }
        ];

        for (const col of newCols) {
            await addColumn('Books', col.name, col.type);
        }

        try {
            const fkCheck = await pool.query(`
                SELECT * FROM sys.foreign_keys 
                WHERE parent_object_id = OBJECT_ID('Books') AND name = 'FK_Books_Categories'
            `);
            if (fkCheck.recordset.length === 0) {
                console.log('Adding FK_Books_Categories...');
                await pool.query(`ALTER TABLE Books ADD CONSTRAINT FK_Books_Categories FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)`);
            }
        } catch (e) {
            console.log('FK_Books_Categories setup warning: ' + e.message);
        }

        console.log('Migration v8 completed successfully.');
        process.exit(0);

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
