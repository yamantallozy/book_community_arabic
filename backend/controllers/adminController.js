const { sql } = require('../config/db');

// @desc    Get pending books
// @route   GET /api/admin/books/pending
// @access  Private/Admin
const getPendingBooks = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query(`
            SELECT 
                b.BookID, b.Title, b.Author, b.Description, b.CoverImageURL, b.CreatedAt, 
                b.CategoryID, b.Status, b.RejectionReason,
                c.Name AS CategoryName, c.DisplayName_Ar AS CategoryNameAr,
                u.Username AS SubmittedBy, u.Email AS SubmitterEmail
            FROM Books b 
            LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
            LEFT JOIN Users u ON b.CreatedBy = u.UserID
            WHERE b.Status = 'PENDING'
            ORDER BY b.CreatedAt DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

// @desc    Review book (Approve/Reject)
// @route   PUT /api/admin/books/:id/review
// @access  Private/Admin
const reviewBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        const adminId = req.user.id;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const pool = await sql.connect();

        await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.NVarChar, status)
            .input('rejectionReason', sql.NVarChar, rejectionReason || null)
            .input('approvedBy', sql.Int, status === 'APPROVED' ? adminId : null)
            .input('approvedAt', sql.DateTime, status === 'APPROVED' ? new Date() : null)
            .query(`
                UPDATE Books 
                SET Status = @status, 
                    RejectionReason = @rejectionReason, 
                    ApprovedBy = @approvedBy, 
                    ApprovedAt = @approvedAt 
                WHERE BookID = @id
            `);

        res.json({ msg: `Book ${status.toLowerCase()}` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

// @desc    Get detailed pending book for editing
// @route   GET /api/admin/books/:id
// @access  Private/Admin
const getAdminBookDetails = async (req, res) => {
    try {
        // This is similar to public getBookById but allows viewing PENDING
        const { id } = req.params;
        const pool = await sql.connect();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT 
                    b.*,
                    c.Name AS CategoryName, c.DisplayName_Ar AS CategoryNameAr,
                    (
                        SELECT STRING_AGG(s.Name, ',') WITHIN GROUP (ORDER BY s.Name)
                        FROM BookSubgenres bs
                        JOIN Subgenres s ON bs.SubgenreID = s.SubgenreID
                        WHERE bs.BookID = b.BookID
                    ) AS Subgenres,
                    (
                        SELECT STRING_AGG(CAST(bs.SubgenreID AS VARCHAR), ',') 
                        FROM BookSubgenres bs WHERE bs.BookID = b.BookID
                    ) AS SubgenreIDs,
                    (
                        SELECT STRING_AGG(t.Name, ',') WITHIN GROUP (ORDER BY t.Name)
                        FROM BookTags bt
                        JOIN Tags t ON bt.TagID = t.TagID
                        WHERE bt.BookID = b.BookID
                    ) AS Tags,
                    (
                         SELECT STRING_AGG(CAST(bt.TagID AS VARCHAR), ',') 
                         FROM BookTags bt WHERE bt.BookID = b.BookID
                    ) AS TagIDs
                FROM Books b 
                LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
                WHERE b.BookID = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ msg: 'Book not found' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

// @desc    Update pending book details
// @route   PUT /api/admin/books/:id
// @access  Private/Admin
const updatePendingBook = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title, author, description, coverImageURL,
            translator, publisher, pageCount, originalLanguage, publicationYear, isbn,
            categoryId, subgenreIds, tagIds
        } = req.body;

        const pool = await sql.connect();
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();
            const request = new sql.Request(transaction);

            // Update Main Book Data
            await request
                .input('id', sql.Int, id)
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
                .query(`
                    UPDATE Books SET
                        Title = @title, Author = @author, Description = @description, CoverImageURL = @coverImageURL,
                        Translator = @translator, Publisher = @publisher, PageCount = @pageCount,
                        OriginalLanguage = @originalLanguage, PublicationYear = @publicationYear, ISBN = @isbn,
                        CategoryID = @categoryId
                    WHERE BookID = @id
                `);

            // Update Junctions (Delete all and Re-insert) - Simplest strategy
            const reqTrx = new sql.Request(transaction);
            reqTrx.input('id', sql.Int, id);

            // Subgenres
            if (subgenreIds !== undefined) {
                await reqTrx.query('DELETE FROM BookSubgenres WHERE BookID = @id');
                if (subgenreIds && subgenreIds.length > 0) {
                    for (const subId of subgenreIds) {
                        await new sql.Request(transaction)
                            .input('bid', sql.Int, id)
                            .input('sid', sql.Int, subId)
                            .query(`INSERT INTO BookSubgenres (BookID, SubgenreID) VALUES (@bid, @sid)`);
                    }
                }
            }

            // Tags
            if (tagIds !== undefined) {
                await reqTrx.query('DELETE FROM BookTags WHERE BookID = @id');
                if (tagIds && tagIds.length > 0) {
                    for (const tagId of tagIds) {
                        await new sql.Request(transaction)
                            .input('bid', sql.Int, id)
                            .input('tid', sql.Int, tagId)
                            .query(`INSERT INTO BookTags (BookID, TagID) VALUES (@bid, @tid)`);
                    }
                }
            }

            await transaction.commit();
            res.json({ msg: 'Book updated successfully' });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

module.exports = { getPendingBooks, reviewBook, getAdminBookDetails, updatePendingBook };
