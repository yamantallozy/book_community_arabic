const sql = require('mssql/msnodesqlv8');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Build connection string matching your working setup
const buildConnString = (dbName) =>
    `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER || 'localhost\\SQLEXPRESS'};Database=${dbName};Trusted_Connection=yes;`;

async function seedDb() {
    try {
        console.log('--- Seeding Database ---');

        const connString = buildConnString(process.env.DB_NAME || 'BookCommunityDB');
        console.log(`Connecting to database...`);

        const pool = await sql.connect({
            driver: 'msnodesqlv8',
            connectionString: connString
        });

        console.log('Inserting sample books...');

        const books = [
            {
                title: 'The Prophet (Al-Mustafa)',
                author: 'Kahlil Gibran',
                desc: 'A collection of poetic essays on philosophical topics mostly regarding life and the human condition.',
                cover: 'https://placehold.co/200x300'
            },
            {
                title: 'Season of Migration to the North',
                author: 'Tayeb Salih',
                desc: 'A classic post-colonial Arabic novel exploring the relationship between East and West.',
                cover: 'https://placehold.co/200x300'
            },
            {
                title: 'The Cairo Trilogy',
                author: 'Naguib Mahfouz',
                desc: 'A monumental work tracking three generations of a Cairo family.',
                cover: 'https://placehold.co/200x300'
            }
        ];

        for (const book of books) {
            await pool.request()
                .input('Title', sql.NVarChar, book.title)
                .input('Author', sql.NVarChar, book.author)
                .input('Description', sql.NVarChar, book.desc)
                .input('CoverImageURL', sql.NVarChar, book.cover)
                .query(`
                    INSERT INTO Books (Title, Author, Description, CoverImageURL)
                    VALUES (@Title, @Author, @Description, @CoverImageURL)
                `);
            console.log(`Added: ${book.title}`);
        }

        console.log('\n✅ Database seeded successfully!');
        await pool.close();

    } catch (err) {
        console.error('\n❌ Error seeding database:', err);
    }
}

seedDb();
