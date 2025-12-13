const { sql } = require('../config/db');
const jwt = require('jsonwebtoken');

// Helper to get optional user ID from token
const getUserIdFromToken = (req) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded.id;
        } catch (error) {
            return null;
        }
    }
    return null;
};

// @desc    Get all highlights
// @route   GET /api/highlights
// @access  Public
const getHighlights = async (req, res) => {
    try {
        const { bookId } = req.query;
        const currentUserId = getUserIdFromToken(req);
        const pool = await sql.connect();

        let query = `
            SELECT h.*, u.Username, u.Avatar, b.Title as BookTitle, b.CoverImageURL,
                   (SELECT COUNT(*) FROM HighlightLikes WHERE HighlightID = h.HighlightID) AS LikeCount,
                   CASE WHEN EXISTS (SELECT 1 FROM HighlightLikes WHERE HighlightID = h.HighlightID AND UserID = @currentUserId) THEN 1 ELSE 0 END AS IsLiked
            FROM Highlights h
            JOIN Users u ON h.UserID = u.UserID
            JOIN Books b ON h.BookID = b.BookID
        `;

        // Note: Using direct string concatenation for WHERE clause is okay here because we use parameters for values, 
        // but cleaner to build parameter list.
        if (bookId) {
            query += ` WHERE h.BookID = @bookId `;
        }

        query += ` ORDER BY LikeCount DESC, h.CreatedAt DESC `;

        const request = pool.request();
        request.input('currentUserId', sql.Int, currentUserId || -1);
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

// @desc    Toggle Like on a Highlight
// @route   POST /api/highlights/:id/like
// @access  Private
const toggleHighlightLike = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const pool = await sql.connect();

        const check = await pool.request()
            .input('highlightId', sql.Int, id)
            .input('userId', sql.Int, userId)
            .query('SELECT LikeID FROM HighlightLikes WHERE HighlightID = @highlightId AND UserID = @userId');

        if (check.recordset.length > 0) {
            // Unlike
            await pool.request()
                .input('highlightId', sql.Int, id)
                .input('userId', sql.Int, userId)
                .query('DELETE FROM HighlightLikes WHERE HighlightID = @highlightId AND UserID = @userId');
            res.json({ msg: 'Like removed', isLiked: false });
        } else {
            // Like
            await pool.request()
                .input('highlightId', sql.Int, id)
                .input('userId', sql.Int, userId)
                .query('INSERT INTO HighlightLikes (HighlightID, UserID) VALUES (@highlightId, @userId)');
            res.json({ msg: 'Liked', isLiked: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getHighlights, addHighlight, toggleHighlightLike };
