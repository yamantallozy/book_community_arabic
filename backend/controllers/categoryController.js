const { sql } = require('../config/db');

// @desc    Get all categories with subgenres
// @route   GET /api/meta/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const pool = await sql.connect();

        // Fetch Categories
        const categoriesResult = await pool.request().query('SELECT * FROM Categories ORDER BY Name');
        const categories = categoriesResult.recordset;

        // Fetch Subgenres
        const subgenresResult = await pool.request().query('SELECT * FROM Subgenres ORDER BY Name');
        const subgenres = subgenresResult.recordset;

        // Map subgenres to categories
        const data = categories.map(cat => ({
            ...cat,
            subgenres: subgenres.filter(sub => sub.CategoryID === cat.CategoryID)
        }));

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all tags
// @route   GET /api/meta/tags
// @access  Public
const getTags = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT * FROM Tags ORDER BY Name');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all distinct languages from books
// @route   GET /api/meta/languages
// @access  Public
const getLanguages = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query(`
            SELECT DISTINCT OriginalLanguage 
            FROM Books 
            WHERE OriginalLanguage IS NOT NULL AND OriginalLanguage != ''
            ORDER BY OriginalLanguage
        `);

        // Return array of language strings
        const languages = result.recordset.map(row => row.OriginalLanguage);
        res.json(languages);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getCategories, getTags, getLanguages };
