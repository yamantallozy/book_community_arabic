const { sql, connectDB } = require('./config/db');
const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    let bookIds = [];
    try {
        console.log('Connecting to DB...');
        await connectDB();

        // Get valid ID
        const catRes = await sql.query('SELECT TOP 1 CategoryID FROM Categories');
        let categoryId;
        if (catRes.recordset.length > 0) {
            categoryId = catRes.recordset[0].CategoryID;
        } else {
            // Create dummy category if needed (unlikely)
            console.log('Creating temp category...');
            const newCat = await sql.query("INSERT INTO Categories (Name, DisplayName_Ar) OUTPUT inserted.CategoryID VALUES ('TempTest', 'تجربة')");
            categoryId = newCat.recordset[0].CategoryID;
        }

        // 1. Insert Test Book
        console.log('Inserting test book...');
        // Use global sql query
        const req = new sql.Request();
        const result = await req
            .input('catId', sql.Int, categoryId)
            .query(`
            INSERT INTO Books (Title, Author, CategoryID) 
            OUTPUT inserted.BookID 
            VALUES (N'Harry Potter Test', N'J.K. Rowling', @catId)
        `);

        const bookId = result.recordset[0].BookID;
        bookIds.push(bookId);
        console.log(`Inserted test book with ID: ${bookId}`);

        // 2. Test Autocomplete "Har"
        console.log('Testing Autocomplete "Har"...');
        const res = await fetch(`${API_URL}/books/autocomplete?q=Har`);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const suggestions = await res.json();

        const match = suggestions.find(b => b.BookID === bookId);
        if (match) {
            console.log('SUCCESS: Found "Harry Potter Test" in suggestions.');
        } else {
            console.error('FAILED: Did not find test book in suggestions.');
            console.log('Got:', suggestions);
        }

        // 3. Arabic Test
        console.log('Inserting Arabic test book...');
        const req2 = new sql.Request();
        const result2 = await req2
            .input('catId', sql.Int, categoryId)
            .query(`
            INSERT INTO Books (Title, Author, CategoryID) 
            OUTPUT inserted.BookID 
            VALUES (N'ألف ليلة وليلة', N'Unknown', @catId)
        `);

        const bookIdBr = result2.recordset[0].BookID;
        bookIds.push(bookIdBr);
        console.log(`Inserted Arabic test book with ID: ${bookIdBr}`);

        // Search without Hamza "الف"
        console.log('Testing Arabic Normalization "الف"...');
        const resAr = await fetch(`${API_URL}/books/autocomplete?q=الف`);
        const suggestionsAr = await resAr.json();

        const matchAr = suggestionsAr.find(b => b.BookID === bookIdBr);
        if (matchAr) {
            console.log('SUCCESS: Found "ألف ليلة وليلة" using "الف".');
        } else {
            console.error('FAILED: Did not find Arabic test book.');
            console.log('Got:', suggestionsAr);
        }

    } catch (err) {
        console.error('Test Error:', err);
    } finally {
        if (bookIds.length > 0) {
            console.log('Cleaning up...');
            try {
                for (const bid of bookIds) {
                    await sql.query(`DELETE FROM Books WHERE BookID = ${bid}`);
                }
            } catch (e) { console.error('Cleanup failed:', e); }
        }
        await sql.close();
    }
};

runTest();
