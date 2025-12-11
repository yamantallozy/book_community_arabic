const sql = require('mssql/msnodesqlv8');

const config = {
    server: '.\\SQLEXPRESS',
    database: 'master',
    options: {
        trustedConnection: true
    }
};

async function test() {
    try {
        console.log('Testing native driver connection...');
        await sql.connect(config);
        console.log('Connected successfully with native driver!');
        await sql.close();
    } catch (err) {
        console.error('Native driver failure:', err);
    }
}

test();
