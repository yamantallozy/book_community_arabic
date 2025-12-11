const { sql } = require('../config/db');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
    try {
        const { q, sort, rating } = req.query;
        const pool = await sql.connect();

        let query = `
            SELECT b.*, 
                   COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) AS AverageRating, 
                   COUNT(r.ReviewID) AS ReviewCount 
            FROM Books b 
            LEFT JOIN Reviews r ON b.BookID = r.BookID AND r.IsDeleted = 0
        `;

        const request = pool.request();

        // Search Filter (WHERE)
        if (q) {
            query += ` WHERE (b.Title LIKE @search OR b.Author LIKE @search) `;
            request.input('search', sql.NVarChar, `%${q}%`);
        }

        query += ` GROUP BY b.BookID, b.Title, b.Author, b.Description, b.CoverImageURL, b.CreatedAt `;

        // Rating Filter (HAVING)
        if (rating) {
            query += ` HAVING COALESCE(AVG(CAST(r.Rating AS FLOAT)), 0) >= @rating `;
            request.input('rating', sql.Float, Number(rating));
        }

        // Sorting (ORDER BY)
        if (sort === 'rating') {
            query += ` ORDER BY AverageRating DESC `;
        } else if (sort === 'oldest') {
            query += ` ORDER BY b.CreatedAt ASC `;
        } else {
            query += ` ORDER BY b.CreatedAt DESC `;
        }

        console.log('Query Params:', { q, sort, rating });
        console.log('Generated SQL:', query);

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Books WHERE BookID = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ msg: 'Book not found' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new book
// @route   POST /api/books
// @access  Private/Admin
const createBook = async (req, res) => {
    try {
        const { title, author, description, coverImageURL } = req.body;

        if (!title || !author) {
            return res.status(400).json({ msg: 'Please provide title and author' });
        }

        const pool = await sql.connect();

        // Insert book
        const result = await pool.request()
            .input('title', sql.NVarChar, title)
            .input('author', sql.NVarChar, author)
            .input('description', sql.NVarChar, description || '')
            .input('coverImageURL', sql.NVarChar, coverImageURL || '')
            .query(`
                INSERT INTO Books (Title, Author, Description, CoverImageURL)
                OUTPUT inserted.BookID
                VALUES (@title, @author, @description, @coverImageURL)
            `);

        const newBook = result.recordset[0];
        res.status(201).json(newBook);

    } catch (err) {
        console.error('Create Book Error:', err);
        res.status(500).send('Server Error');
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

        // Delete reviews first (manually cascading just in case)
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Reviews WHERE BookID = @id');

        // Delete book
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Books WHERE BookID = @id');

        res.json({ msg: 'Book removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getBooks, getBookById, createBook, deleteBook };
