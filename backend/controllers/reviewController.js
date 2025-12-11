const { sql } = require('../config/db');

// @desc    Get reviews for a book (including replies)
// @route   GET /api/reviews/:bookId
// @access  Public
const getReviews = async (req, res) => {
    try {
        const { bookId } = req.params;
        const pool = await sql.connect();

        // Fetch Reviews with User Details
        const reviewResult = await pool.request()
            .input('bookId', sql.Int, bookId)
            .query(`
                SELECT R.*, U.Username, U.Avatar 
                FROM Reviews R 
                JOIN Users U ON R.UserID = U.UserID 
                WHERE R.BookID = @bookId 
                ORDER BY R.CreatedAt DESC
            `);

        const reviews = reviewResult.recordset;

        if (reviews.length > 0) {
            const reviewsIds = reviews.map(r => r.ReviewID);

            // Fetch Replies with User Details
            const repliesResult = await pool.request()
                .query(`
                    SELECT RR.*, U.Username, U.Avatar 
                    FROM ReviewReplies RR
                    JOIN Users U ON RR.UserID = U.UserID
                    WHERE RR.ReviewID IN (${reviewsIds.join(',')}) 
                    ORDER BY RR.CreatedAt ASC
                `);

            const replies = repliesResult.recordset;

            reviews.forEach(review => {
                review.Replies = replies.filter(reply => reply.ReviewID === review.ReviewID);
            });
        }

        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res) => {
    try {
        const { bookId, rating, comment } = req.body;
        const userId = req.user.id; // From Auth Middleware

        const pool = await sql.connect();

        const existing = await pool.request()
            .input('bookId', sql.Int, bookId)
            .input('userId', sql.Int, userId)
            .query('SELECT * FROM Reviews WHERE BookID = @bookId AND UserID = @userId AND IsDeleted = 0');

        if (existing.recordset.length > 0) {
            return res.status(400).json({ msg: 'You have already reviewed this book' });
        }

        await pool.request()
            .input('bookId', sql.Int, bookId)
            .input('userId', sql.Int, userId)
            .input('rating', sql.Int, rating)
            .input('comment', sql.NVarChar, comment)
            .query('INSERT INTO Reviews (BookID, UserID, Rating, Comment, IsDeleted) VALUES (@bookId, @userId, @rating, @comment, 0)');

        res.status(201).json({ msg: 'Review added' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        const pool = await sql.connect();

        // Verify ownership
        const check = await pool.request()
            .input('reviewId', sql.Int, reviewId)
            .query('SELECT UserID FROM Reviews WHERE ReviewID = @reviewId');

        if (check.recordset.length === 0) return res.status(404).json({ msg: 'Review not found' });
        if (check.recordset[0].UserID !== userId) return res.status(401).json({ msg: 'Not authorized' });

        await pool.request()
            .input('reviewId', sql.Int, reviewId)
            .input('rating', sql.Int, rating)
            .input('comment', sql.NVarChar, comment)
            .query('UPDATE Reviews SET Rating = @rating, Comment = @comment WHERE ReviewID = @reviewId');

        res.json({ msg: 'Review updated' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Soft Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const pool = await sql.connect();

        const check = await pool.request()
            .input('reviewId', sql.Int, reviewId)
            .query('SELECT UserID FROM Reviews WHERE ReviewID = @reviewId');

        if (check.recordset.length === 0) return res.status(404).json({ msg: 'Review not found' });
        if (check.recordset.length === 0) return res.status(404).json({ msg: 'Review not found' });

        // Ownership check with Admin override
        if (check.recordset[0].UserID !== userId && !req.user.isAdmin) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Soft delete
        await pool.request()
            .input('reviewId', sql.Int, reviewId)
            .query('UPDATE Reviews SET IsDeleted = 1 WHERE ReviewID = @reviewId');

        res.json({ msg: 'Review deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Add a reply
// @route   POST /api/reviews/:reviewId/reply
// @access  Private
const addReply = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { comment, parentReplyId } = req.body;
        const userId = req.user.id; // From Auth Middleware

        const pool = await sql.connect();

        await pool.request()
            .input('reviewId', sql.Int, reviewId)
            .input('userId', sql.Int, userId)
            .input('comment', sql.NVarChar, comment)
            .input('parentReplyId', sql.Int, parentReplyId || null)
            .query('INSERT INTO ReviewReplies (ReviewID, UserID, Comment, ParentReplyID, IsDeleted) VALUES (@reviewId, @userId, @comment, @parentReplyId, 0)');

        res.status(201).json({ msg: 'Reply added' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};


// @desc    Update a reply
// @route   PUT /api/reviews/reply/:replyId
// @access  Private
const updateReply = async (req, res) => {
    try {
        const { replyId } = req.params;
        const { comment } = req.body;
        const userId = req.user.id;

        const pool = await sql.connect();

        const check = await pool.request()
            .input('replyId', sql.Int, replyId)
            .query('SELECT UserID FROM ReviewReplies WHERE ReplyID = @replyId');

        if (check.recordset.length === 0) return res.status(404).json({ msg: 'Reply not found' });
        if (check.recordset[0].UserID !== userId) return res.status(401).json({ msg: 'Not authorized' });

        await pool.request()
            .input('replyId', sql.Int, replyId)
            .input('comment', sql.NVarChar, comment)
            .query('UPDATE ReviewReplies SET Comment = @comment WHERE ReplyID = @replyId');

        res.json({ msg: 'Reply updated' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Soft Delete a reply
// @route   DELETE /api/reviews/reply/:replyId
// @access  Private
const deleteReply = async (req, res) => {
    try {
        const { replyId } = req.params;
        const userId = req.user.id;

        const pool = await sql.connect();

        const check = await pool.request()
            .input('replyId', sql.Int, replyId)
            .query('SELECT UserID FROM ReviewReplies WHERE ReplyID = @replyId');

        if (check.recordset.length === 0) return res.status(404).json({ msg: 'Reply not found' });
        if (check.recordset.length === 0) return res.status(404).json({ msg: 'Reply not found' });

        // Ownership check with Admin override
        if (check.recordset[0].UserID !== userId && !req.user.isAdmin) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await pool.request()
            .input('replyId', sql.Int, replyId)
            .query('UPDATE ReviewReplies SET IsDeleted = 1 WHERE ReplyID = @replyId');

        res.json({ msg: 'Reply deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getReviews,
    addReview,
    updateReview,
    deleteReview,
    addReply,
    updateReply,
    deleteReply
};
