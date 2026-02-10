const { sql, connectDB } = require('../config/db');

async function debugGetBooks() {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log('Running query...');

        let query = `
            SELECT 
                b.BookID, b.Title, b.Author, b.Description, b.CoverImageURL, b.CreatedAt, 
                b.CategoryID, b.Translator, b.Publisher, b.PageCount, b.OriginalLanguage, b.PublicationYear, b.ISBN,
                c.Name AS CategoryName, c.DisplayName_Ar AS CategoryNameAr,
                COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) AS AverageRating, 
                COUNT(DISTINCT r.ReviewID) AS ReviewCount,
                (
                    SELECT STRING_AGG(s.Name, ',') WITHIN GROUP (ORDER BY s.Name)
                    FROM BookSubgenres bs
                    JOIN Subgenres s ON bs.SubgenreID = s.SubgenreID
                    WHERE bs.BookID = b.BookID
                ) AS Subgenres,
                (
                    SELECT STRING_AGG(t.Name, ',') WITHIN GROUP (ORDER BY t.Name)
                    FROM BookTags bt
                    JOIN Tags t ON bt.TagID = t.TagID
                    WHERE bt.BookID = b.BookID
                ) AS Tags
            FROM Books b 
            LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
            LEFT JOIN Reviews r ON b.BookID = r.BookID AND r.IsDeleted = 0
            GROUP BY b.BookID, b.Title, b.Author, b.Description, b.CoverImageURL, b.CreatedAt, 
                     b.CategoryID, b.Translator, b.Publisher, b.PageCount, b.OriginalLanguage, b.PublicationYear, b.ISBN,
                     c.Name, c.DisplayName_Ar
            ORDER BY b.CreatedAt DESC
        `;

        const result = await pool.request().query(query);
        console.log(`Success! Found ${result.recordset.length} books.`);
        if (result.recordset.length > 0) {
            console.log('Sample book:', result.recordset[0]);
        }
        process.exit(0);

    } catch (err) {
        console.error('---------------------------------------------------');
        console.error('QUERY FAILED:', err.message);
        console.error('Full Error:', err);
        console.error('---------------------------------------------------');
        process.exit(1);
    }
}

debugGetBooks();
