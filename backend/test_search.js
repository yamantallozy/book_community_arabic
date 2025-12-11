const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        const get = async (url) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
        };

        // 1. Default (Newest)
        console.log('Testing Default (Newest)...');
        const all = await get(`${API_URL}/books`);
        console.log(`Fetched ${all.length} books.`);

        // 2. Search
        console.log('Testing Search "Book"...');
        const searchResults = await get(`${API_URL}/books?q=Book`); // Assuming some books have "Book" in title
        console.log(`Found ${searchResults.length} books matching "Book".`);

        // 3. Sort by Rating
        console.log('Testing Sort by Rating...');
        const rated = await get(`${API_URL}/books?sort=rating`);
        if (rated.length > 1 && rated[0].AverageRating < rated[1].AverageRating) {
            console.error('FAILED: Sort by Rating (first is lower than second)');
        } else {
            console.log('SUCCESS: Sort by Rating seems correct (descending).');
        }

        // 4. Min Rating
        console.log('Testing Min Rating 4...');
        const highRated = await get(`${API_URL}/books?rating=4`);
        const invalid = highRated.find(b => b.AverageRating < 4);
        if (invalid) {
            console.error('FAILED: Found book with rating < 4', invalid);
        } else {
            console.log(`SUCCESS: All ${highRated.length} books have 4+ stars.`);
        }

    } catch (err) {
        console.error('Test Error:', err);
    }
};

runTest();
