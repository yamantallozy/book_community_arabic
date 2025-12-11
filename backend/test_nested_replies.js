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

        const get = async (url) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
        };

        // 1. Get a book to work with
        const books = await get(`${API_URL}/books`);
        if (books.length === 0) {
            console.error('No books found. Skipping test.');
            return;
        }
        const bookId = books[0].BookID;
        console.log(`Testing with BookID: ${bookId}`);

        // 2. Check Ratings logic
        console.log('Book Stats:', {
            Rating: books[0].AverageRating,
            Count: books[0].ReviewCount
        });

        // 3. Register a user for replying
        const username = `Replier_${Date.now()}`;
        const email = `reply_${Date.now()}@example.com`;
        const user = await post(`${API_URL}/users/`, { username, email, password: 'password123' });
        console.log('Registered replier:', user.id);

        // 4. Find a review to reply to (create one if needed, but assuming one exists from previous test)
        let reviews = await get(`${API_URL}/reviews/${bookId}`);
        if (reviews.length === 0) {
            // Create review
            await post(`${API_URL}/reviews`, {
                bookId,
                userId: user.id, // technically not needed if token is used, but keeping for body if controller uses it (it doesn't, it uses req.user.id)
                rating: 4,
                comment: 'Root review for nesting'
            }, user.token);
            reviews = await get(`${API_URL}/reviews/${bookId}`);
        }
        const rootReview = reviews[0];
        console.log('Root Review ID:', rootReview.ReviewID);

        // 5. Create a Reply (Level 1)
        const l1Comment = `Level 1 Reply ${Date.now()}`;
        console.log('Creating Level 1 Reply...');

        await post(`${API_URL}/reviews/${rootReview.ReviewID}/reply`, {
            userId: user.id,
            comment: l1Comment
        }, user.token);
        console.log('Level 1 Reply Created');

        reviews = await get(`${API_URL}/reviews/${bookId}`);
        const replies = reviews.find(r => r.ReviewID === rootReview.ReviewID).Replies;
        const level1Reply = replies.find(r => r.Comment === l1Comment);

        if (!level1Reply) {
            console.error('Failed to find Level 1 Reply');
            return;
        }
        console.log('Level 1 Reply ID:', level1Reply.ReplyID);

        // 6. Create a Nested Reply (Level 2)
        const l2Comment = `Level 2 Reply (Child) ${Date.now()}`;
        console.log('Creating Level 2 Reply (Nested)...');
        await post(`${API_URL}/reviews/${rootReview.ReviewID}/reply`, {
            userId: user.id,
            comment: l2Comment,
            parentReplyId: level1Reply.ReplyID
        }, user.token);
        console.log('Level 2 Reply Created');

        // 7. Verify Hierarchy via fetch
        reviews = await get(`${API_URL}/reviews/${bookId}`);
        const updatedReplies = reviews.find(r => r.ReviewID === rootReview.ReviewID).Replies;
        const level2Reply = updatedReplies.find(r => r.Comment === l2Comment);

        if (level2Reply && level2Reply.ParentReplyID === level1Reply.ReplyID) {
            console.log('SUCCESS: Level 2 Reply has correct ParentReplyID.');
            if (level2Reply.Username) {
                console.log(`SUCCESS: Level 2 Reply has Username: ${level2Reply.Username}`);
            } else {
                console.error('TEST FAILED: Level 2 Reply missing Username.');
                console.log('Level 2 Data:', level2Reply);
            }
        } else {
            console.error('TEST FAILED: Level 2 Reply parent mismatch or missing.');
            console.log('Level 2 Data:', level2Reply);
        }

    } catch (err) {
        console.error('Test Error:', err);
    }
};

runTest();
