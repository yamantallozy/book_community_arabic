const { sql, connectDB } = require('../config/db');

async function testFilterQuery() {
    try {
        await connectDB();
        const pool = await sql.connect();

        // Simulate the getBooks query with a category filter
        const category = 'Novel';

        let query = `
            SELECT 
                b.BookID, b.Title, b.Author, b.Description, b.CoverImageURL, b.CreatedAt, 
                b.CategoryID, b.Translator, b.Publisher, b.PageCount, b.OriginalLanguage, b.PublicationYear, b.ISBN,
                b.Status, b.RejectionReason,
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
            WHERE b.Status = 'APPROVED'
        `;

        const request = pool.request();
        let whereClauses = [];

        if (category) {
            whereClauses.push(`c.Name = @category`);
            request.input('category', sql.NVarChar, category);
        }

        if (whereClauses.length > 0) {
            query += ` AND ` + whereClauses.join(' AND ');
        }

        query += ` GROUP BY b.BookID, b.Title, b.Author, b.Description, b.CoverImageURL, b.CreatedAt, 
                            b.CategoryID, b.Translator, b.Publisher, b.PageCount, b.OriginalLanguage, b.PublicationYear, b.ISBN,
                            b.Status, b.RejectionReason,
                            c.Name, c.DisplayName_Ar `;

        query += ` ORDER BY b.CreatedAt DESC `;

        console.log('=== GENERATED QUERY ===');
        console.log(query);
        console.log('=======================');

        console.log('\nExecuting query...');
        const result = await request.query(query);
        console.log(`\nSuccess! Found ${result.recordset.length} books`);
        if (result.recordset.length > 0) {
            console.log('First book:', result.recordset[0].Title);
        }

        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
}

testFilterQuery();
