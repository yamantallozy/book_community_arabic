const { sql, connectDB } = require('../config/db');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const setupTestAdmin = async () => {
    try {
        await connectDB();
        const pool = await sql.connect();
        const email = 'testadmin@example.com';
        const password = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if exists
        const check = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE Email = @email');

        if (check.recordset.length > 0) {
            console.log('User already exists, updating to Admin...');
            await pool.request()
                .input('email', sql.NVarChar, email)
                .query('UPDATE Users SET IsAdmin = 1, PasswordHash = @password WHERE Email = @email')
                .input('password', sql.NVarChar, hashedPassword); // Reset password too just in case
        } else {
            console.log('Creating new Admin user...');
            await pool.request()
                .input('username', sql.NVarChar, 'TestAdmin')
                .input('email', sql.NVarChar, email)
                .input('password', sql.NVarChar, hashedPassword)
                .query('INSERT INTO Users (Username, Email, PasswordHash, IsAdmin) VALUES (@username, @email, @password, 1)');
        }

        console.log(`User ${email} is ready as Admin.`);
        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

setupTestAdmin();
