const sql = require('mssql/msnodesqlv8');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
    driver: 'msnodesqlv8',
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER || '.\\SQLEXPRESS'};Database=${process.env.DB_NAME};Trusted_Connection=yes;`
};

async function debugReviews() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to database...');

        const bookId = 5; // Based on user provided URL http://localhost:5173/books/5

        console.log(`Checking reviews for BookID: ${bookId}`);

        const result = await pool.request()
            .input('bookId', sql.Int, bookId)
            .query(`
                SELECT * FROM Reviews WHERE BookID = @bookId
            `);

        console.log('Raw Reviews:', result.recordset);

        if (result.recordset.length > 0) {
            console.log('Sample Review IsDeleted:', result.recordset[0].IsDeleted);
        }

        const aggResult = await pool.request()
            .input('bookId', sql.Int, bookId)
            .query(`
             SELECT b.BookID, 
                   COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) AS AverageRating, 
                   COUNT(r.ReviewID) AS ReviewCount 
            FROM Books b 
            LEFT JOIN Reviews r ON b.BookID = r.BookID AND r.IsDeleted = 0
            WHERE b.BookID = @bookId
            GROUP BY b.BookID
        `);
        console.log('Aggregation Result:', aggResult.recordset);

    } catch (err) {
        console.error('Debug failed:', err);
    } finally {
        process.exit();
    }
}

debugReviews();
