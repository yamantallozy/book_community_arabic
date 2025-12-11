const { sql, connectDB } = require('../config/db');

const makeAdmin = async () => {
    try {
        await connectDB();
        const pool = await sql.connect();

        // Promote yaman.tallozi@gmail.com
        const result = await pool.request()
            .input('email', sql.NVarChar, 'yaman.tallozi@gmail.com')
            .query(`
                UPDATE Users 
                SET IsAdmin = 1 
                WHERE Email = @email;
                
                SELECT * FROM Users WHERE Email = @email;
            `);

        console.log('User promoted to Admin:', result.recordset);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

makeAdmin();
