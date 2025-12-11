const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        // Helper for fetch
        const post = async (url, body) => {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                const text = await res.text();
                // Attach status to error for check
                const err = new Error(text || res.statusText);
                err.status = res.status;
                throw err;
            }
            return res.json();
        };

        const get = async (url) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(res.statusText + ' ' + await res.text());
            return res.json();
        };

        // 1. Register User
        const username = `TestUser_${Date.now()}`;
        const email = `test_${Date.now()}@example.com`;
        const password = 'password123';

        console.log('Registering user...');
        const user = await post(`${API_URL}/users/`, { username, email, password });
        console.log('User registered:', user.id);

        // 2. Get a book
        let bookId = 1;
        try {
            const books = await get(`${API_URL}/books`);
            if (books.length > 0) {
                bookId = books[0].BookID;
            } else {
                console.log('No books found. Test might fail.');
                // Try to create a book if route exists? Assuming no create book route in this context easily avail without auth token or such.
                // Just relying on existing data.
            }
        } catch (e) {
            console.log('Error fetching books', e.message);
        }

        console.log(`Using BookID: ${bookId}`);

        // 3. Add Review 1
        console.log('Adding first review...');
        await post(`${API_URL}/reviews`, {
            bookId,
            userId: user.id,
            rating: 5,
            comment: 'Great book!'
        });
        console.log('Review 1 added.');

        // 4. Try Add Review 2 (Should Fail)
        console.log('Attempting second review (expect failure)...');
        try {
            await post(`${API_URL}/reviews`, {
                bookId,
                userId: user.id,
                rating: 1,
                comment: 'Changed my mind'
            });
            console.error('TEST FAILED: Second review should have been rejected.');
        } catch (err) {
            if (err.status === 400) {
                console.log('SUCCESS: Second review rejected with 400.');
            } else {
                console.error('TEST FAILED: Unexpected error on second review:', err.message);
            }
        }

        // 5. Add Reply
        // Need ReviewID first. fetch reviews.
        const reviews = await get(`${API_URL}/reviews/${bookId}`);
        const review = reviews.find(r => r.UserID === user.id);

        if (!review) {
            console.error('TEST FAILED: Could not find the review we just added.');
            return;
        }

        console.log('Adding reply to review:', review.ReviewID);
        await post(`${API_URL}/reviews/${review.ReviewID}/reply`, {
            userId: user.id, // Replying to self for test
            comment: 'Thanks myself!'
        });
        console.log('Reply added.');

        // 6. Verify Reply
        const reviews2 = await get(`${API_URL}/reviews/${bookId}`);
        const reviewWithReply = reviews2.find(r => r.ReviewID === review.ReviewID);

        if (reviewWithReply.Replies && reviewWithReply.Replies.length > 0 && reviewWithReply.Replies[0].Comment === 'Thanks myself!') {
            console.log('SUCCESS: Reply verified in response.');
        } else {
            console.error('TEST FAILED: Reply not found in response.', reviewWithReply.Replies);
        }

    } catch (err) {
        console.error('Test script error:', err.message);
    }
};

runTest();
