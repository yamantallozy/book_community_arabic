const sql = require('mssql/msnodesqlv8');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
    driver: 'msnodesqlv8',
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER || '.\\SQLEXPRESS'};Database=${process.env.DB_NAME};Trusted_Connection=yes;`
};

async function clearContent() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to database (Trusted Connection)...');


        // Clear ReviewReplies first due to FK constraints (if table exists)
        try {
            await pool.request().query('DELETE FROM ReviewReplies');
            console.log('Cleared ReviewReplies');
        } catch (err) {
            console.log('ReviewReplies table might not exist or error:', err.message);
        }

        // Clear Reviews
        await pool.request().query('DELETE FROM Reviews');
        console.log('Cleared Reviews');

        // Clear Highlights
        await pool.request().query('DELETE FROM Highlights');
        console.log('Cleared Highlights');

        // Reset shelving to 'None' for all users? 
        // User asked to clean ratings/reviews/highlights. 
        // Usually shelf status is separate, but if they want a clean slate for "ratings", 
        // the "Read" status might be linked. 
        // For now, I will stick to the explicit request: Ratings, Reviews, Highlights.
        // If I delete reviews, the rating average will naturally be recalculated as 0.

        console.log('All specified content cleared successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error clearing content:', err);
        process.exit(1);
    }
}

clearContent();
