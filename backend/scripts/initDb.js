const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the parent directory's .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Helper to build connection string
const buildConnString = (dbName) =>
    `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER || '.\\SQLEXPRESS'};Database=${dbName};Trusted_Connection=yes;`;

async function initDb() {
    try {
        console.log('--- Database Initialization Script ---');

        // 1. Connect to Master to Create DB
        const masterConnString = buildConnString('master');
        console.log(`Connecting to server with string: ${masterConnString}`);

        const pool = await sql.connect({
            driver: 'msnodesqlv8',
            connectionString: masterConnString
        });

        const dbName = process.env.DB_NAME || 'BookCommunityDB';

        console.log(`Checking if database '${dbName}' exists...`);
        // Note: With raw connection string, we might need to be careful with query parameterized
        // But for this setup script, string interpolation is acceptable for local dev.
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${dbName}')
            BEGIN
                CREATE DATABASE [${dbName}];
            END
        `);
        console.log(`Database '${dbName}' check/creation complete.`);
        await pool.close();

        // 2. Connect to the New Database and Run Schema
        const appConnString = buildConnString(dbName);
        console.log(`\nConnecting to database '${dbName}'...`);

        const appPool = await sql.connect({
            driver: 'msnodesqlv8',
            connectionString: appConnString
        });

        const schemaPath = path.join(__dirname, '../database/schema.sql');
        console.log(`Reading schema from: ${schemaPath}`);
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema SQL...');
        await appPool.request().query(schemaSql);

        console.log('\n✅ Success! Database and tables have been set up.');
        await appPool.close();

    } catch (err) {
        console.error('\n❌ Error initializing database:', err);
        console.log('\nTroubleshooting Tips:');
        console.log('1. Ensure MSSQL Service is running (SQLEXPRESS).');
        console.log('2. Ensure "ODBC Driver 17 for SQL Server" is installed (common on Windows).');
    }
}

initDb();
