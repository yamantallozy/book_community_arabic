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

            // Get user from DB
            const pool = await sql.connect();
            const result = await pool.request()
                .input('id', sql.Int, decoded.id)
                .query('SELECT UserID, Username, Email, Role FROM Users WHERE UserID = @id');

            if (result.recordset.length === 0) {
                return res.status(401).send('User not found');
            }

            const user = result.recordset[0];

            // Normalize role just in case
            req.user = {
                id: user.UserID,
                email: user.Email,
                role: user.Role || 'user', // Default to user if null
                isAdmin: user.Role === 'admin' || user.Role === 'super_admin' // Backward compatibility helper
            };

            next();
        } catch (error) {
            console.error(error);
            res.status(401).send('Not authorized, token failed');
        }
    } else {
        res.status(401).send('Not authorized, no token');
    }
};

// Middleware to restrict access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Super Admin has access to everything
        if (req.user.role === 'super_admin') {
            return next();
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                msg: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
