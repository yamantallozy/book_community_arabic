require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const sql = require('mssql/msnodesqlv8');

const config = {
    driver: 'msnodesqlv8',
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER || '.\\SQLEXPRESS'};Database=${process.env.DB_NAME};Trusted_Connection=yes;`
};

const checkReviews = async () => {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to database...');

        const bookId = 5;
        console.log(`Checking reviews for BookID: ${bookId}`);

        const result = await pool.request()
            .input('bookId', sql.Int, bookId)
            .query('SELECT * FROM Reviews WHERE BookID = @bookId');

        console.log('All Reviews for Book 5 (including deleted):');
        console.table(result.recordset);

        // Test Aggregation Query
        console.log('Testing Aggregation Query...');
        const aggResult = await pool.request()
            .input('id', sql.Int, bookId)
            .query(`
                SELECT b.BookID, b.Title,
                       COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) AS AverageRating, 
                       COUNT(r.ReviewID) AS ReviewCount 
                FROM Books b 
                LEFT JOIN Reviews r ON b.BookID = r.BookID AND r.IsDeleted = 0
                WHERE b.BookID = @id
                GROUP BY b.BookID, b.Title
            `);

        console.table(aggResult.recordset);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        // sql.close(); // Keep pool open if needed or close
        process.exit();
    }
};

checkReviews();
