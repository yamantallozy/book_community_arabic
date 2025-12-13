const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const API_URL = 'http://localhost:5000/api';

async function testLike() {
    try {
        console.log('1. Registering test user...');
        const email = 'test_' + Math.floor(Math.random() * 100000) + '@test.com';
        const password = 'password123';
        const username = 'LikeTester_' + Math.floor(Math.random() * 100000);

        let token, userId;

        console.log('Attempting register with', email);
        const registerRes = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (registerRes.ok) {
            const data = await registerRes.json();
            token = data.token;
            userId = data.UserID;
            console.log('Registered new user:', userId);
        } else {
            const errText = await registerRes.text();
            console.log('Registration failed:', registerRes.status, errText);
            throw new Error('Registration failed');
        }

        // 2. Get Reviews for Book 5
        console.log('Fetching reviews for Book 5...');
        const reviewsRes = await fetch(`${API_URL}/reviews/5`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const reviews = await reviewsRes.json();

        if (reviews.length === 0) {
            console.log('No reviews found for Book 5. Adding one...');
            const addRes = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ bookId: 5, rating: 5, comment: 'Test Review for Likes' })
            });
            if (!addRes.ok) throw new Error('Failed to add review ' + await addRes.text());
            console.log('Added test review.');

            // Fetch again
            const reviewsRes2 = await fetch(`${API_URL}/reviews/5`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const reviews2 = await reviewsRes2.json();
            reviews.push(...reviews2);
        }

        // Use the first review
        const review = reviews[0];
        const reviewId = review.ReviewID;
        // Check if DB returns LikeCount and IsLiked now
        const initialLikeCount = review.LikeCount !== undefined ? review.LikeCount : 'undefined';
        const initialIsLiked = review.IsLiked !== undefined ? review.IsLiked : 'undefined';

        console.log(`Testing Review ${reviewId}. Initial Likes: ${initialLikeCount}, IsLiked: ${initialIsLiked}`);

        // 3. Toggle Like
        console.log('Toggling Like...');
        const toggleRes = await fetch(`${API_URL}/reviews/${reviewId}/like`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!toggleRes.ok) {
            throw new Error(`Toggle Like Failed: ${toggleRes.status} ${await toggleRes.text()}`);
        }

        const toggleData = await toggleRes.json();
        console.log('Toggle Response:', toggleData);

        // 4. Verify Update
        console.log('Fetching reviews again to verify...');
        const verifyRes = await fetch(`${API_URL}/reviews/5`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const verifyReviews = await verifyRes.json();
        const updatedReview = verifyReviews.find(r => r.ReviewID === reviewId);
        console.log(`Updated Review ${reviewId}. New Likes: ${updatedReview.LikeCount}, IsLiked: ${updatedReview.IsLiked}`);

        if (updatedReview.IsLiked !== initialIsLiked) {
            console.log('SUCCESS: IsLiked status changed.');
        } else {
            console.log('FAILURE: IsLiked status could not change.');
        }

    } catch (err) {
        console.error('Test Failed:', err);
    }
}

testLike();
