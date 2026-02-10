const { sql } = require('../config/db');

// Arabic Text Normalization
// Removes diacritics and unifies similar characters
const normalizeArabic = (text) => {
    if (!text) return '';

    // Remove diacritics (Tashkeel)
    let normalized = text.replace(/[\u064B-\u065F]/g, '');

    // Unify Alefs
    normalized = normalized.replace(/[\u0622\u0623\u0625]/g, '\u0627');

    // Unify Teh Marbuta and Ha
    normalized = normalized.replace(/\u0629/g, '\u0647');

    // Unify Yaa and Alef Maqsura
    normalized = normalized.replace(/\u0649/g, '\u064A');

    return normalized;
};

// @desc    Get autocomplete suggestions for books
// @route   GET /api/books/autocomplete?q=...
// @access  Public
const getAutocomplete = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.json([]);
        }

        const searchTerm = q.trim();
        const normalizedTerm = normalizeArabic(searchTerm);

        const pool = await sql.connect();

        // We'll search in Title and Author
        // We use a simplified scoring system:
        // 1. Exact/Start match is prioritized (implied by typical SQL ordering or we can add a scoring column)
        // 2. Contains match

        // Note: For true fuzzy matching in SQL without Full-Text Search, we are limited.
        // We will implement a "Smart LIKE" approach where we try to match the normalized forms.
        // Since we can't easily normalize the DB side efficiently without a COMPUTED COLUMN, 
        // we will match standard LIKE first, and if we want better Arabic support, 
        // we would ideally need a normalized column in the DB.
        // For now, we'll try to match standard LIKE patterns.

        const request = pool.request();
        request.input('term', sql.NVarChar, `%${searchTerm}%`);
        request.input('normalized', sql.NVarChar, `%${normalizedTerm}%`);

        // SQL Query designed to prioritize:
        // 1. Matches starting with the term
        // 2. Matches containing the term
        // We limit to 8 results for the dropdown

        // Note: REPLACE is used here effectively to normalize DB content on the fly for comparison.
        // This acts as a poor-man's fuzzy search for Arabic common variations.

        const query = `
            SELECT TOP 8 
                BookID, Title, Author, CoverImageURL,
                CASE 
                    WHEN Title LIKE @term THEN 1 -- Exact/standard match priority
                    ELSE 2 
                END as MatchScore
            FROM Books
            WHERE 
                Title LIKE @term 
                OR Author LIKE @term
                OR (
                    -- Normalize DB Title on the fly for better Arabic matching (simplified)
                    REPLACE(REPLACE(REPLACE(Title, N'أ', N'ا'), N'إ', N'ا'), N'آ', N'ا') LIKE @normalized
                )
                OR (
                    REPLACE(REPLACE(REPLACE(Author, N'أ', N'ا'), N'إ', N'ا'), N'آ', N'ا') LIKE @normalized
                )
            ORDER BY MatchScore ASC, Title ASC
        `;

        const result = await request.query(query);

        res.json(result.recordset);

    } catch (err) {
        console.error('Autocomplete Error:', err);
        res.status(500).json({ msg: 'Server error during search' });
    }
};

module.exports = {
    getAutocomplete
};
