const { sql } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    console.log('Register request received:', req.body);
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            console.log('Missing fields');
            return res.status(400).json({ msg: 'Please add all fields' });
        }

        console.log('Connecting to SQL...');
        const pool = await sql.connect();

        // Check if user exists
        console.log('Checking for existing user...');
        const userCheck = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE Email = @email');

        if (userCheck.recordset.length > 0) {
            console.log('User already exists');
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        console.log('Creating new user...');
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedPassword)
            .query(`
                INSERT INTO Users (Username, Email, PasswordHash) 
                OUTPUT inserted.UserID, inserted.Username, inserted.Email
                VALUES (@username, @email, @password)
            `);

        const user = result.recordset[0];
        console.log('User created:', user);

        res.status(201).json({
            id: user.UserID,
            username: user.Username,
            email: user.Email,
            isAdmin: !!user.IsAdmin,
            token: generateToken(user.UserID),
        });

    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).send('Server Error: ' + err.message);
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    console.log('Login request received:', req.body);
    try {
        const { email, password } = req.body;

        const pool = await sql.connect();

        // Check for user email
        const userResult = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE Email = @email');

        const user = userResult.recordset[0];

        if (user && (await bcrypt.compare(password, user.PasswordHash))) {
            console.log('Login successful for:', email);
            res.json({
                id: user.UserID,
                username: user.Username,
                email: user.Email,
                isAdmin: !!user.IsAdmin,
                token: generateToken(user.UserID),
            });
        } else {
            console.log('Invalid credentials or user not found');
            res.status(400).json({ msg: 'Invalid credentials' });
        }

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).send('Server Error: ' + err.message);
    }
};

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const pool = await sql.connect();

        const result = await pool.request()
            .input('id', sql.Int, userId)
            .query('SELECT UserID, Username, Email, Bio, Avatar, CreatedAt, IsAdmin FROM Users WHERE UserID = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const user = result.recordset[0];
        // Don't send password hash
        res.json({
            id: user.UserID,
            username: user.Username,
            email: user.Email, // Maybe hide email if public? For now keep it.
            bio: user.Bio,
            avatar: user.Avatar,
            isAdmin: !!user.IsAdmin,
            createdAt: user.CreatedAt
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio } = req.body;
        let avatarPath = req.body.avatar;

        if (req.file) {
            // If file uploaded, use the file path
            // Assuming server runs on localhost:5000, we store relative path or full URL
            // Storing relative path '/uploads/filename' is usually best
            avatarPath = `http://localhost:5000/uploads/${req.file.filename}`;
        }

        const pool = await sql.connect();

        await pool.request()
            .input('id', sql.Int, userId)
            .input('bio', sql.NVarChar, bio)
            .input('avatar', sql.NVarChar, avatarPath)
            .query('UPDATE Users SET Bio = @bio, Avatar = @avatar WHERE UserID = @id');

        res.json({ msg: 'Profile updated', avatar: avatarPath });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error: ' + err.message);
    }
};

// @desc    Promote a user to admin
// @route   PUT /api/users/promote
// @access  Private/Admin
const promoteUser = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ msg: 'Please provide an email' });
        }

        const pool = await sql.connect();

        // Check if user exists
        const userCheck = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT UserID FROM Users WHERE Email = @email');

        if (userCheck.recordset.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        await pool.request()
            .input('email', sql.NVarChar, email)
            .query('UPDATE Users SET IsAdmin = 1 WHERE Email = @email');

        res.json({ msg: `User with email ${email} is now an Admin` });

    } catch (err) {
        console.error('Promote User Error:', err);
        res.status(500).send('Server Error: ' + err.message);
    }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, promoteUser };
