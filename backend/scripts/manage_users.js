const { connectDB, sql } = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const run = async () => {
    try {
        await connectDB();
        const pool = await sql.connect();

        const command = process.argv[2]; // 'list' or 'promote'
        const targetUsername = process.argv[3];

        if (command === 'promote') {
            if (!targetUsername) {
                console.log('Usage: node scripts/manage_users.js promote <username>');
                process.exit(1);
            }
            const res = await pool.request()
                .input('username', sql.NVarChar, targetUsername)
                .query('UPDATE Users SET IsAdmin = 1 WHERE Username = @username');

            if (res.rowsAffected[0] > 0) {
                console.log(`✅ User '${targetUsername}' is now an Admin.`);
            } else {
                console.log(`❌ User '${targetUsername}' not found.`);
            }
        } else if (command === 'demote') {
            if (!targetUsername) {
                console.log('Usage: node scripts/manage_users.js demote <username>');
                process.exit(1);
            }
            const res = await pool.request()
                .input('username', sql.NVarChar, targetUsername)
                .query('UPDATE Users SET IsAdmin = 0 WHERE Username = @username');

            if (res.rowsAffected[0] > 0) {
                console.log(`✅ User '${targetUsername}' is no longer an Admin.`);
            } else {
                console.log(`❌ User '${targetUsername}' not found.`);
            }
        }

        // Always list users at the end
        console.log('\n--- Current Users ---');
        const result = await pool.request().query('SELECT UserID, Username, Email, IsAdmin FROM Users');
        console.table(result.recordset);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

run();
