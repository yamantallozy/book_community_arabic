const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        const post = async (url, body, token = null) => {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                const text = await res.text();
                const err = new Error(text || res.statusText);
                err.status = res.status;
                throw err;
            }
            return res.json();
        };

        const get = async (url, token = null) => {
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(url, { headers });
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
        };

        // 1. Get a book
        const books = await get(`${API_URL}/books`);
        if (books.length === 0) return console.error('No books found');
        const bookId = books[0].BookID;

        // 2. Register user
        const username = `ShelfUser_${Date.now()}`;
        const email = `shelf_${Date.now()}@example.com`;
        const user = await post(`${API_URL}/users/`, { username, email, password: 'password123' });
        console.log('Registered user:', user.id);

        // 3. Add to "Want to Read"
        console.log('Adding to Want To Read...');
        await post(`${API_URL}/shelves`, { bookId, status: 'WantToRead' }, user.token);

        // 4. Verify
        let shelf = await get(`${API_URL}/shelves/user/${user.id}`);
        let item = shelf.find(i => i.BookID === bookId);
        if (item && item.Status === 'WantToRead') {
            console.log('SUCCESS: Book is in WantToRead');
        } else {
            console.error('FAILED: Book not found in shelf or wrong status', item);
        }

        // 5. Move to "Read"
        console.log('Moving to Read...');
        await post(`${API_URL}/shelves`, { bookId, status: 'Read' }, user.token);

        // 6. Verify update
        shelf = await get(`${API_URL}/shelves/user/${user.id}`);
        item = shelf.find(i => i.BookID === bookId);
        if (item && item.Status === 'Read') {
            console.log('SUCCESS: Book moved to Read');
        } else {
            console.error('FAILED: Book not moved to Read', item);
        }

        // 7. Remove from shelf
        console.log('Removing from shelf...');
        await post(`${API_URL}/shelves`, { bookId, status: 'None' }, user.token);

        // 8. Verify removal
        shelf = await get(`${API_URL}/shelves/user/${user.id}`);
        item = shelf.find(i => i.BookID === bookId);
        if (!item) {
            console.log('SUCCESS: Book removed from shelf');
        } else {
            console.error('FAILED: Book still in shelf', item);
        }

    } catch (err) {
        console.error('Test Error:', err);
    }
};

runTest();
