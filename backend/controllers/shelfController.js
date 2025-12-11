const { sql } = require('../config/db');

// @desc    Update shelf status for a book
// @route   POST /api/shelves
// @access  Private
const updateShelf = async (req, res) => {
    try {
        const { bookId, status } = req.body;
        const userId = req.user.id;

        const validStatuses = ['WantToRead', 'CurrentlyReading', 'Read', 'None'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const pool = await sql.connect();

        if (status === 'None') {
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('bookId', sql.Int, bookId)
                .query('DELETE FROM UserShelves WHERE UserID = @userId AND BookID = @bookId');
            return res.json({ msg: 'Removed from shelf', status: '' });
        }

        // Check if exists
        const check = await pool.request()
            .input('userId', sql.Int, userId)
            .input('bookId', sql.Int, bookId)
            .query('SELECT * FROM UserShelves WHERE UserID = @userId AND BookID = @bookId');

        if (check.recordset.length > 0) {
            // Update
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('bookId', sql.Int, bookId)
                .input('status', sql.NVarChar, status)
                .query('UPDATE UserShelves SET Status = @status, UpdatedAt = GETDATE() WHERE UserID = @userId AND BookID = @bookId');
        } else {
            // Insert
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('bookId', sql.Int, bookId)
                .input('status', sql.NVarChar, status)
                .query('INSERT INTO UserShelves (UserID, BookID, Status) VALUES (@userId, @bookId, @status)');
        }

        res.json({ msg: 'Shelf updated', status });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Get user's shelf
// @route   GET /api/shelves/user/:userId
// @access  Public (or Private? Let's make it Public so people can see others' shelves)
const getUserShelf = async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = await sql.connect();

        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT S.*, B.Title, B.Author, B.CoverImageURL 
                FROM UserShelves S
                JOIN Books B ON S.BookID = B.BookID
                WHERE S.UserID = @userId
                ORDER BY S.UpdatedAt DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Get status of specific book for logged in user
// @route   GET /api/shelves/book/:bookId
// @access  Private
const getBookShelfStatus = async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.user.id;

        const pool = await sql.connect();
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('bookId', sql.Int, bookId)
            .query('SELECT Status FROM UserShelves WHERE UserID = @userId AND BookID = @bookId');

        if (result.recordset.length > 0) {
            res.json({ status: result.recordset[0].Status });
        } else {
            res.json({ status: null });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { updateShelf, getUserShelf, getBookShelfStatus };
