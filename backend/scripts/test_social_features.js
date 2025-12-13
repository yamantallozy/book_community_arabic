const { connectDB, sql } = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const runTest = async () => {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log('--- Testing Social Features ---');

        // Note: This script assumes UserID 1 and 2 exist. If not, it might fail or we should create them.
        // For simplicity, let's verify existing users first.
        const users = await pool.request().query('SELECT TOP 2 UserID FROM Users');
        if (users.recordset.length < 2) {
            console.log('Need at least 2 users to test social features.');
            process.exit(1);
        }

        const user1 = users.recordset[0].UserID;
        const user2 = users.recordset[1].UserID;

        console.log(`Testing with User1 (${user1}) and User2 (${user2})`);

        // 1. Follow
        console.log(`User ${user1} following User ${user2}...`);
        try {
            await pool.request()
                .input('follower', sql.Int, user1)
                .input('following', sql.Int, user2)
                .query('INSERT INTO Follows (FollowerID, FollowingID) VALUES (@follower, @following)');
            console.log('Follow successful (DB Insert)');
        } catch (e) {
            if (e.message.includes('UNIQUE')) console.log('Already following');
            else throw e;
        }

        // 2. Check Counts
        const followerCheck = await pool.request()
            .input('id', sql.Int, user2)
            .query('SELECT COUNT(*) as Count FROM Follows WHERE FollowingID = @id');
        console.log(`User ${user2} Followers Count:`, followerCheck.recordset[0].Count);

        // 3. Unfollow
        console.log(`User ${user1} unfollowing User ${user2}...`);
        await pool.request()
            .input('follower', sql.Int, user1)
            .input('following', sql.Int, user2)
            .query('DELETE FROM Follows WHERE FollowerID = @follower AND FollowingID = @following');
        console.log('Unfollow successful');

        // 4. Update Profile
        console.log(`Updating User ${user1} profile fields...`);
        const loc = 'Test City';
        const genres = JSON.stringify(['Fiction', 'Sci-Fi']);
        await pool.request()
            .input('id', sql.Int, user1)
            .input('loc', sql.NVarChar, loc)
            .input('genres', sql.NVarChar, genres)
            .query('UPDATE Users SET Location = @loc, FavoriteGenres = @genres WHERE UserID = @id');

        const profileCheck = await pool.request()
            .input('id', sql.Int, user1)
            .query('SELECT Location, FavoriteGenres FROM Users WHERE UserID = @id');

        console.log('Profile Updated:', profileCheck.recordset[0]);

        console.log('--- Test Complete ---');
        process.exit(0);

    } catch (err) {
        console.error('Test Failed:', err);
        process.exit(1);
    }
};

runTest();
