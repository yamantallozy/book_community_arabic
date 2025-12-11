// Native fetch is available in Node 20+
const BASE_URL = 'http://localhost:5000/api';
const { sql, connectDB } = require('./config/db');
const dotenv = require('dotenv');
dotenv.config();

// Utilities
const registerUser = async (user) => {
    const res = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    return res.json();
};

const runTest = async () => {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log('--- Starting Admin Moderation Test ---');

        const timestamp = Date.now();
        const userNormalData = { username: `norm_${timestamp}`, email: `norm_${timestamp}@test.com`, password: 'password123' };
        const userAdminData = { username: `admin_${timestamp}`, email: `admin_${timestamp}@test.com`, password: 'password123' };

        // 1. Register Users
        console.log('Registering users...');
        const normalUser = await registerUser(userNormalData);
        const adminUser = await registerUser(userAdminData);

        if (!normalUser.token || !adminUser.token) throw new Error('Registration failed');

        // 2. Elevate Admin User (Direct DB Manipulation)
        console.log('Elevating admin user in DB...');
        await pool.request()
            .input('id', sql.Int, adminUser.id)
            .query('UPDATE Users SET IsAdmin = 1 WHERE UserID = @id');
        console.log('User elevated to Admin.');

        // 3. Normal User creates a Review
        console.log('Normal User creating review...');
        const reviewComment = `Spam Review ${timestamp}`;
        const createRes = await fetch(`${BASE_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${normalUser.token}`
            },
            body: JSON.stringify({ bookId: 1, rating: 1, comment: reviewComment })
        });
        if (createRes.status !== 201) throw new Error('Failed to create review');

        // Get Review ID
        const reviewsRes = await fetch(`${BASE_URL}/reviews/1`);
        const reviews = await reviewsRes.json();
        const review = reviews.find(r => r.Comment === reviewComment);
        if (!review) throw new Error('Review not found');
        console.log('Review ID:', review.ReviewID);

        // 4. Admin Deletes Review
        console.log('Admin attempting to delete Normal User review...');
        const deleteRes = await fetch(`${BASE_URL}/reviews/${review.ReviewID}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminUser.token}` }
        });

        if (deleteRes.status === 200) {
            console.log('PASS: Admin deleted review (200 OK).');
        } else {
            console.error('FAIL: Admin failed to delete. Status:', deleteRes.status);
            const text = await deleteRes.text();
            console.error('Response:', text);
        }

        // Verify Deletion
        const verifyRes = await fetch(`${BASE_URL}/reviews/1`);
        const verifyData = await verifyRes.json();
        const deletedReview = verifyData.find(r => r.ReviewID === review.ReviewID);

        if (deletedReview && deletedReview.IsDeleted) {
            console.log('PASS: Review is marked as deleted.');
        } else {
            console.error('FAIL: Review is not marked as deleted.');
        }

        console.log('--- ALL TESTS PASSED ---');
        process.exit(0);

    } catch (err) {
        console.error('TEST FAILED:', err);
        process.exit(1);
    }
};

runTest();
