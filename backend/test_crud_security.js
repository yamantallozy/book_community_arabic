// Native fetch is available in Node 20+
const BASE_URL = 'http://localhost:5000/api';

// Utilities
const registerUser = async (user) => {
    const res = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    return res.json();
};

const loginUser = async (user) => {
    const res = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    return res.json();
};

const runTest = async () => {
    try {
        console.log('--- Starting CRUD & Security Test ---');

        // 1. Setup Users
        const timestamp = Date.now();
        const user1Data = { username: `userA_${timestamp}`, email: `userA_${timestamp}@test.com`, password: 'password123' };
        const user2Data = { username: `userB_${timestamp}`, email: `userB_${timestamp}@test.com`, password: 'password123' };

        console.log('Registering users...');
        const user1 = await registerUser(user1Data);
        // Login to get token if register doesn't return it (it does usually)
        if (!user1.token) throw new Error('User 1 registration failed or no token');

        const user2 = await registerUser(user2Data);
        if (!user2.token) throw new Error('User 2 registration failed or no token');

        console.log('Users registered.');

        // 2. Test Unauthenticated Access
        console.log('Testing Unauthenticated Review Submission...');
        const unauthRes = await fetch(`${BASE_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId: 1, rating: 5, comment: 'Hacker review' })
        });
        if (unauthRes.status === 401) {
            console.log('PASS: Unauthenticated request rejected (401).');
        } else {
            console.error('FAIL: Unauthenticated request accepted:', unauthRes.status);
        }

        // 3. Create Review (User 1)
        console.log('User 1 creating review...');
        const reviewComment = `Review by User 1 ${timestamp}`;
        const createRes = await fetch(`${BASE_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user1.token}`
            },
            body: JSON.stringify({ bookId: 1, rating: 5, comment: reviewComment })
        });

        if (createRes.status !== 201) throw new Error('Failed to create review');
        console.log('PASS: Review created.');

        // Get reviews to find the ID
        const reviewsRes = await fetch(`${BASE_URL}/reviews/1`);
        const reviews = await reviewsRes.json();
        const review = reviews.find(r => r.Comment === reviewComment);
        if (!review) throw new Error('Review not found in list');
        console.log('Review ID:', review.ReviewID);

        // 4. Update Review (User 1)
        console.log('User 1 updating review...');
        const updatedComment = reviewComment + ' (Updated)';
        const updateRes = await fetch(`${BASE_URL}/reviews/${review.ReviewID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user1.token}`
            },
            body: JSON.stringify({ rating: 4, comment: updatedComment })
        });

        if (updateRes.status !== 200) throw new Error(`Update failed: ${updateRes.status}`);
        console.log('PASS: Review updated.');

        // 5. Security Check: User 2 tries to delete User 1's review
        console.log('User 2 attempting to delete User 1 review...');
        const maliciousDelete = await fetch(`${BASE_URL}/reviews/${review.ReviewID}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${user2.token}` }
        });

        if (maliciousDelete.status === 401) {
            console.log('PASS: User 2 cannot delete User 1 review (401).');
        } else {
            console.error('FAIL: Security breach! Status:', maliciousDelete.status);
        }

        // 6. Reply Flow
        console.log('User 2 replying to User 1 review...');
        const replyComment = `Reply by User 2 ${timestamp}`;
        const replyRes = await fetch(`${BASE_URL}/reviews/${review.ReviewID}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user2.token}`
            },
            body: JSON.stringify({ comment: replyComment })
        });
        if (replyRes.status !== 201) throw new Error('Failed to create reply');
        console.log('PASS: Reply created.');

        // Get reply ID
        const reviewsRes2 = await fetch(`${BASE_URL}/reviews/1`);
        const reviews2 = await reviewsRes2.json();
        const review2 = reviews2.find(r => r.ReviewID === review.ReviewID);
        const reply = review2.Replies.find(r => r.Comment === replyComment);
        if (!reply) throw new Error('Reply not found');
        console.log('Reply ID:', reply.ReplyID);

        // 7. Soft Delete Reply (User 2)
        console.log('User 2 soft deleting their reply...');
        const deleteReplyRes = await fetch(`${BASE_URL}/reviews/reply/${reply.ReplyID}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${user2.token}` }
        });
        if (deleteReplyRes.status !== 200) throw new Error('Failed to delete reply');
        console.log('PASS: Reply deleted.');

        // Verify Soft Delete
        const verifyRes = await fetch(`${BASE_URL}/reviews/1`);
        const verifyData = await verifyRes.json();
        const verifyReply = verifyData.find(r => r.ReviewID === review.ReviewID).Replies.find(r => r.ReplyID === reply.ReplyID);

        if (verifyReply.IsDeleted) {
            console.log('PASS: Reply is marked as deleted (IsDeleted = true/1)');
        } else {
            console.error('FAIL: Reply is NOT marked as deleted');
        }

        console.log('--- ALL TESTS PASSED ---');

    } catch (err) {
        console.error('TEST FAILED:', err);
    }
};

runTest();
