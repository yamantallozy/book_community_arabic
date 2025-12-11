const sql = require('msnodesqlv8');

const connStr17 = 'Driver={ODBC Driver 17 for SQL Server};Server=.\\SQLEXPRESS;Database=master;Trusted_Connection=yes;';
const connStrLegacy = 'Driver={SQL Server};Server=.\\SQLEXPRESS;Database=master;Trusted_Connection=yes;';

console.log('Testing ODBC Driver 17...');
sql.open(connStr17, (err, conn) => {
    if (err) {
        console.error('Failed 17:', err);
        console.log('Testing Legacy SQL Server Driver...');
        sql.open(connStrLegacy, (err2, conn2) => {
            if (err2) {
                console.error('Failed Legacy:', err2);
            } else {
                console.log('Success with Legacy Driver!');
                conn2.close();
            }
        });
    } else {
        console.log('Success with ODBC Driver 17!');
        conn.close();
    }
});
