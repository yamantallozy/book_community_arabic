const { sql } = require('../config/db');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
    try {
        const { q, sort, rating, category, subgenre, tag, publisher, translator, year, bookLength, originalLanguage } = req.query;
        const pool = await sql.connect();

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

        // Dynamic Filtering
        let whereClauses = [];

        // 1. Text Search
        if (q) {
            whereClauses.push(`(b.Title LIKE @search OR b.Author LIKE @search OR b.Translator LIKE @search)`);
            request.input('search', sql.NVarChar, `%${q}%`);
        }

        // 2. Metadata Filters
        if (category) {
            whereClauses.push(`c.Name = @category`);
            request.input('category', sql.NVarChar, category);
        }
        if (publisher) {
            whereClauses.push(`b.Publisher LIKE @publisher`);
            request.input('publisher', sql.NVarChar, `%${publisher}%`);
        }
        if (translator) {
            whereClauses.push(`b.Translator LIKE @translator`);
            request.input('translator', sql.NVarChar, `%${translator}%`);
        }
        if (year) {
            whereClauses.push(`b.PublicationYear = @year`);
            request.input('year', sql.Int, year);
        }

        // Book Length Filter (based on PageCount)
        if (bookLength) {
            if (bookLength === 'short') {
                whereClauses.push(`b.PageCount < 200`);
            } else if (bookLength === 'medium') {
                whereClauses.push(`b.PageCount >= 200 AND b.PageCount <= 400`);
            } else if (bookLength === 'long') {
                whereClauses.push(`b.PageCount > 400`);
            }
        }

        // Original Language Filter
        if (originalLanguage) {
            whereClauses.push(`b.OriginalLanguage = @originalLanguage`);
            request.input('originalLanguage', sql.NVarChar, originalLanguage);
        }

        // 3. Junction Filters (Subgenre/Tags) - using EXISTS for performance
        if (subgenre) {
            whereClauses.push(`EXISTS (
                SELECT 1 FROM BookSubgenres bs 
                JOIN Subgenres s ON bs.SubgenreID = s.SubgenreID 
                WHERE bs.BookID = b.BookID AND s.Name = @subgenre
            )`);
            request.input('subgenre', sql.NVarChar, subgenre);
        }
        if (tag) {
            whereClauses.push(`EXISTS (
                SELECT 1 FROM BookTags bt 
                JOIN Tags t ON bt.TagID = t.TagID 
                WHERE bt.BookID = b.BookID AND t.Name = @tag
            )`);
            request.input('tag', sql.NVarChar, tag);
        }

        if (whereClauses.length > 0) {
            query += ` AND ` + whereClauses.join(' AND ');
        }

        query += ` GROUP BY b.BookID, b.Title, b.Author, b.Description, b.CoverImageURL, b.CreatedAt, 
                            b.CategoryID, b.Translator, b.Publisher, b.PageCount, b.OriginalLanguage, b.PublicationYear, b.ISBN,
                            b.Status, b.RejectionReason,
                            c.Name, c.DisplayName_Ar `;

        // Rating Filter (HAVING)
        if (rating) {
            query += ` HAVING COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) >= @rating `;
            request.input('rating', sql.Float, Number(rating));
        }

        // Sorting
        if (sort === 'rating') {
            query += ` ORDER BY AverageRating DESC `;
        } else if (sort === 'oldest') {
            query += ` ORDER BY b.CreatedAt ASC `;
        } else {
            query += ` ORDER BY b.CreatedAt DESC `;
        }

        const result = await request.query(query);

        // Parse Subgenres/Tags from CSV string to Array
        const books = result.recordset.map(book => ({
            ...book,
            Subgenres: book.Subgenres ? book.Subgenres.split(',') : [],
            Tags: book.Tags ? book.Tags.split(',') : []
        }));

        res.json(books);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect();

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
                WHERE b.BookID = @id
        `;

        // If not admin/super_admin, strict filter
        // Note: req.user might not be populated in public route unless we add auth middleware tentatively or check it.
        // For public route, we assume unauthenticated users cannot see PENDING.

        // This controler is usually Public. If we want to allow Admins to see PENDING, we need to handle auth manually or passed from prev middleware
        // But getBookById is Public. 
        // We will filter Status = 'APPROVED' in the query if we want to strict block.
        // Or we rely on the frontend admin dashboard using a DIFFERENT endpoint for previewing.
        // Let's add strict filtering for normal public usage:

        // query += ` AND b.Status = 'APPROVED' `; 
        // Wait, if an admin clicks "Preview", they might use this endpoint.
        // Let's rely on the WHERE clause logic:

        // IMPORTANT: For simplicity, public endpoint ONLY returns APPROVED.
        // Admins viewing pending books should use the admin endpoints.

        query += ` AND b.Status = 'APPROVED' `;

        query += `
                GROUP BY b.BookID, b.Title, b.Author, b.Description, b.CoverImageURL, b.CreatedAt, 
                         b.CategoryID, b.Translator, b.Publisher, b.PageCount, b.OriginalLanguage, b.PublicationYear, b.ISBN,
                         b.Status, b.RejectionReason,
                         c.Name, c.DisplayName_Ar
        `;

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ msg: 'Book not found' });
        }

        const book = result.recordset[0];
        book.Subgenres = book.Subgenres ? book.Subgenres.split(',') : [];
        book.Tags = book.Tags ? book.Tags.split(',') : [];

        res.json(book);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

const getBookDebug = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT b.BookID, b.CategoryID,
                       COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) AS DebugAvg
                FROM Books b 
                LEFT JOIN Reviews r ON b.BookID = r.BookID AND r.IsDeleted = 0
                WHERE b.BookID = @id
                GROUP BY b.BookID, b.CategoryID
            `);
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json(err);
    }
};

// @desc    Create a new book
// @route   POST /api/books
// @access  Private/Admin
const createBook = async (req, res) => {
    try {
        const {
            title, author, description, coverImageURL,
            translator, publisher, pageCount, originalLanguage, publicationYear, isbn,
            categoryId, subgenreIds, tagIds
        } = req.body;

        if (!title || !author) {
            return res.status(400).json({ msg: 'Please provide title and author' });
        }

        const pool = await sql.connect();
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            const request = new sql.Request(transaction);

            // 1. Insert Book (Optional fields handle nulls implicitly or explicit null)
            const result = await request
                .input('title', sql.NVarChar, title)
                .input('author', sql.NVarChar, author)
                .input('description', sql.NVarChar, description || '')
                .input('coverImageURL', sql.NVarChar, coverImageURL || '')
                .input('translator', sql.NVarChar, translator || null)
                .input('publisher', sql.NVarChar, publisher || null)
                .input('pageCount', sql.Int, pageCount || null)
                .input('originalLanguage', sql.NVarChar, originalLanguage || null)
                .input('publicationYear', sql.Int, publicationYear || null)
                .input('isbn', sql.NVarChar, isbn || null)
                .input('categoryId', sql.Int, categoryId || null)
                .input('createdBy', sql.Int, req.user.id)
                .query(`
                    INSERT INTO Books (
                        Title, Author, Description, CoverImageURL, 
                        Translator, Publisher, PageCount, OriginalLanguage, PublicationYear, ISBN, 
                        CategoryID, Status, CreatedBy
                    )
                    OUTPUT inserted.BookID
                    VALUES (
                        @title, @author, @description, @coverImageURL, 
                        @translator, @publisher, @pageCount, @originalLanguage, @publicationYear, @isbn, 
                        @categoryId, 'PENDING', @createdBy
                    )
                `);

            const bookId = result.recordset[0].BookID;

            // 2. Insert Subgenres (Bulk)
            if (subgenreIds && subgenreIds.length > 0) {
                for (const subId of subgenreIds) {
                    await new sql.Request(transaction)
                        .input('bid', sql.Int, bookId)
                        .input('sid', sql.Int, subId)
                        .query(`INSERT INTO BookSubgenres (BookID, SubgenreID) VALUES (@bid, @sid)`);
                }
            }

            // 3. Insert Tags (Bulk)
            if (tagIds && tagIds.length > 0) {
                for (const tagId of tagIds) {
                    await new sql.Request(transaction)
                        .input('bid', sql.Int, bookId)
                        .input('tid', sql.Int, tagId)
                        .query(`INSERT INTO BookTags (BookID, TagID) VALUES (@bid, @tid)`);
                }
            }

            await transaction.commit();
            res.status(201).json({ msg: 'Book created', bookId });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error('Create Book Error:', err);
        res.status(500).send('Server Error: ' + err.message);
    }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect();

        const checkBook = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Books WHERE BookID = @id');

        if (checkBook.recordset.length === 0) {
            return res.status(404).json({ msg: 'Book not found' });
        }

        // Manual Cascade Delete (Constraints might not be set to CASCADE)
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            const reqTrx = new sql.Request(transaction);
            reqTrx.input('id', sql.Int, id);

            await reqTrx.query('DELETE FROM Reviews WHERE BookID = @id');
            await reqTrx.query('DELETE FROM BookSubgenres WHERE BookID = @id');
            await reqTrx.query('DELETE FROM BookTags WHERE BookID = @id');
            await reqTrx.query('DELETE FROM Books WHERE BookID = @id');

            await transaction.commit();
            res.json({ msg: 'Book removed' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

module.exports = { getBooks, getBookById, createBook, deleteBook, getBookDebug };
