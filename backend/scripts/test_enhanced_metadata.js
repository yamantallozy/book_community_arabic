const { sql, connectDB } = require('../config/db');

// Config
const API_URL = 'http://localhost:5000/api';
let token = '';

const loginAdmin = async () => {
    try {
        const res = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password123' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Login failed');
        token = data.token;
        console.log('✅ Admin Logged In');
    } catch (err) {
        console.error('❌ Login Failed:', err.message);
        process.exit(1);
    }
};

const createTestBook = async () => {
    try {
        // Fetch Categories
        const catRes = await fetch(`${API_URL}/meta/categories`);
        const catData = await catRes.json();
        const novelCat = catData.find(c => c.Name === 'Novel');
        const catId = novelCat ? novelCat.CategoryID : null;

        const payload = {
            title: 'Test Translation Book',
            author: 'Foreign Author',
            description: 'A test book with full metadata.',
            translator: 'Ahmed Translator',
            publisher: 'Dar Al-Test',
            pageCount: 450,
            originalLanguage: 'English',
            publicationYear: 2023,
            isbn: '978-3-16-148410-0',
            categoryId: catId,
            subgenreIds: [],
            tagIds: []
        };

        const res = await fetch(`${API_URL}/books`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.msg || 'Create failed');

        console.log('✅ Book Created Resp:', data);
        return data.bookId;
    } catch (err) {
        console.error('❌ Create Book Failed:', err.message);
    }
};

const verifyMetadata = async (bookId) => {
    try {
        const res = await fetch(`${API_URL}/books/${bookId}`);
        const book = await res.json();

        let passed = true;
        if (book.Translator !== 'Ahmed Translator') { console.error('❌ Translator Mismatch:', book.Translator); passed = false; }
        if (book.Publisher !== 'Dar Al-Test') { console.error('❌ Publisher Mismatch'); passed = false; }
        if (book.OriginalLanguage !== 'English') { console.error('❌ Language Mismatch'); passed = false; }

        if (passed) console.log('✅ Metadata Verification Passed');
        else console.log('❌ Metadata Verification Failed');
    } catch (err) {
        console.error('❌ Verify Failed:', err.message);
    }
};

const run = async () => {
    await loginAdmin();
    const bookId = await createTestBook();
    if (bookId) await verifyMetadata(bookId);
};

run();
