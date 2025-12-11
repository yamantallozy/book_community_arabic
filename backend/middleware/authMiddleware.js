const jwt = require('jsonwebtoken');
const { sql } = require('../config/db');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from DB to check Admin status
            const pool = await sql.connect();
            const result = await pool.request()
                .input('id', sql.Int, decoded.id)
                .query('SELECT UserID, Username, Email, IsAdmin FROM Users WHERE UserID = @id');

            if (result.recordset.length === 0) {
                return res.status(401).send('User not found');
            }

            req.user = {
                id: result.recordset[0].UserID,
                isAdmin: !!result.recordset[0].IsAdmin
            };

            next();
        } catch (error) {
            console.error(error);
            res.status(401).send('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401).send('Not authorized, no token');
    }
};

module.exports = { protect };
