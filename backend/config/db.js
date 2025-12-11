const sql = require('mssql/msnodesqlv8');
const dotenv = require('dotenv');

dotenv.config();

const config = {
    driver: 'msnodesqlv8',
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER || '.\\SQLEXPRESS'};Database=${process.env.DB_NAME};Trusted_Connection=yes;`
};

const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log('MSSQL Connected...');
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
};

module.exports = { connectDB, sql };
