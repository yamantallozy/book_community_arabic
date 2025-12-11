const { sql } = require('../config/db');

// @desc    Get all highlights
// @route   GET /api/highlights
// @access  Public
const getHighlights = async (req, res) => {
    try {
        const { bookId } = req.query;
        const pool = await sql.connect();
        let query = `
            SELECT h.*, u.Username, u.Avatar, b.Title as BookTitle, b.CoverImageURL 
            FROM Highlights h
            JOIN Users u ON h.UserID = u.UserID
            JOIN Books b ON h.BookID = b.BookID
        `;

        if (bookId) {
            query += ` WHERE h.BookID = @bookId `;
        }

        query += ` ORDER BY h.CreatedAt DESC `;

        const request = pool.request();
        if (bookId) {
            request.input('bookId', sql.Int, bookId);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Add a highlight
// @route   POST /api/highlights
// @access  Private
const addHighlight = async (req, res) => {
    try {
        const { bookId, textContent } = req.body;
        let imageUrl = req.body.imageUrl || null;
        const userId = req.user.id;

        if (req.file) {
            imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }

        if (!bookId || (!textContent && !imageUrl)) {
            return res.status(400).json({ msg: 'Please provide book and either text or image' });
        }

        const pool = await sql.connect();
        await pool.request()
            .input('UserID', sql.Int, userId)
            .input('BookID', sql.Int, bookId)
            .input('TextContent', sql.NVarChar, textContent)
            .input('ImageURL', sql.NVarChar, imageUrl)
            .query(`
                INSERT INTO Highlights (UserID, BookID, TextContent, ImageURL)
                VALUES (@UserID, @BookID, @TextContent, @ImageURL)
            `);

        res.status(201).json({ msg: 'Highlight added' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getHighlights, addHighlight };
