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
            .query('SELECT UserID, Username, Email, Bio, Location, FavoriteGenres, SocialLinks, Avatar, CreatedAt, IsAdmin FROM Users WHERE UserID = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const user = result.recordset[0];

        // Fetch follower/following counts
        const followersCount = await pool.request()
            .input('id', sql.Int, userId)
            .query('SELECT COUNT(*) AS Count FROM Follows WHERE FollowingID = @id');

        const followingCount = await pool.request()
            .input('id', sql.Int, userId)
            .query('SELECT COUNT(*) AS Count FROM Follows WHERE FollowerID = @id');

        // Check if logged-in user follows this profile (if req.user exists)
        let isFollowing = false;
        if (req.user) {
            const followCheck = await pool.request()
                .input('followerId', sql.Int, req.user.id)
                .input('followingId', sql.Int, userId)
                .query('SELECT * FROM Follows WHERE FollowerID = @followerId AND FollowingID = @followingId');
            isFollowing = followCheck.recordset.length > 0;
        }

        // Calculate Average Rating given by user
        const avgRatingResult = await pool.request()
            .input('id', sql.Int, userId)
            .query('SELECT AVG(CAST(Rating AS FLOAT)) as AvgRating FROM Reviews WHERE UserID = @id AND IsDeleted = 0');
        const averageRating = avgRatingResult.recordset[0].AvgRating || 0;

        // Don't send password hash
        res.json({
            id: user.UserID,
            username: user.Username,
            email: user.Email, // Maybe hide email if public? For now keep it.
            bio: user.Bio,
            location: user.Location,
            favoriteGenres: user.FavoriteGenres ? JSON.parse(user.FavoriteGenres) : [],
            socialLinks: user.SocialLinks ? JSON.parse(user.SocialLinks) : {},
            avatar: user.Avatar,
            isAdmin: !!user.IsAdmin,
            createdAt: user.CreatedAt,
            stats: {
                followers: followersCount.recordset[0].Count,
                following: followingCount.recordset[0].Count,
                averageRating: Number(averageRating).toFixed(2)
            },
            isFollowing
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
        const { bio, location, favoriteGenres, socialLinks } = req.body;
        let avatarPath = req.body.avatar;

        if (req.file) {
            // If file uploaded, use the file path
            // Assuming server runs on localhost:5000, we store relative path or full URL
            // Storing relative path '/uploads/filename' is usually best
            avatarPath = `http://localhost:5000/uploads/${req.file.filename}`;
        }

        const pool = await sql.connect();

        // If avatarPath is undefined/null (not sent), we shouldn't overwrite it with null if we want to keep existing.
        // But usually frontend sends existing if not changed, or we can fetch first. 
        // For simplicity, let's assume if it's not provided, we don't update it, OR we handle it in SQL.
        // Let's do a dynamic update or just fetch current first.

        // Easier: Dynamic build query or just always update all fields (frontend must send all current values)
        // Let's assume frontend sends all values.

        await pool.request()
            .input('id', sql.Int, userId)
            .input('bio', sql.NVarChar, bio)
            .input('location', sql.NVarChar, location)
            .input('favoriteGenres', sql.NVarChar, JSON.stringify(favoriteGenres || []))
            .input('socialLinks', sql.NVarChar, JSON.stringify(socialLinks || {}))
            .input('avatar', sql.NVarChar, avatarPath)
            .query(`
                UPDATE Users 
                SET Bio = @bio, 
                    Location = @location, 
                    FavoriteGenres = @favoriteGenres, 
                    SocialLinks = @socialLinks,
                    Avatar = ISNULL(@avatar, Avatar) 
                WHERE UserID = @id
            `);

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

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = async (req, res) => {
    try {
        const followerId = req.user.id;
        const followingId = req.params.id;

        if (Number(followerId) === Number(followingId)) {
            return res.status(400).json({ msg: 'Cannot follow yourself' });
        }

        const pool = await sql.connect();

        // Check existence
        const check = await pool.request()
            .input('followerId', sql.Int, followerId)
            .input('followingId', sql.Int, followingId)
            .query('SELECT * FROM Follows WHERE FollowerID = @followerId AND FollowingID = @followingId');

        if (check.recordset.length > 0) {
            return res.status(400).json({ msg: 'Already following' });
        }

        await pool.request()
            .input('followerId', sql.Int, followerId)
            .input('followingId', sql.Int, followingId)
            .query('INSERT INTO Follows (FollowerID, FollowingID) VALUES (@followerId, @followingId)');

        res.json({ msg: 'User followed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Private
const unfollowUser = async (req, res) => {
    try {
        const followerId = req.user.id;
        const followingId = req.params.id;

        const pool = await sql.connect();

        await pool.request()
            .input('followerId', sql.Int, followerId)
            .input('followingId', sql.Int, followingId)
            .query('DELETE FROM Follows WHERE FollowerID = @followerId AND FollowingID = @followingId');

        res.json({ msg: 'User unfollowed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Get followers
// @route   GET /api/users/:id/followers
// @access  Public
const getFollowers = async (req, res) => {
    try {
        const userId = req.params.id;
        const pool = await sql.connect();

        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT U.UserID, U.Username, U.Avatar
                FROM Follows F
                JOIN Users U ON F.FollowerID = U.UserID
                WHERE F.FollowingID = @userId
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Get following
// @route   GET /api/users/:id/following
// @access  Public
const getFollowing = async (req, res) => {
    try {
        const userId = req.params.id;
        const pool = await sql.connect();

        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT U.UserID, U.Username, U.Avatar
                FROM Follows F
                JOIN Users U ON F.FollowingID = U.UserID
                WHERE F.FollowerID = @userId
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    promoteUser,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
};
