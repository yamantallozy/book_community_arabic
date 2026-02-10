const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        console.log('Testing Autocomplete...');

        // 1. Search for a common term (assuming "Book" or existing data)
        // Adjust "Harry" to something likely in your DB or "Book"
        const term = 'Harry';
        console.log(`Searching for "${term}"...`);

        const res = await fetch(`${API_URL}/books/autocomplete?q=${term}`);
        if (!res.ok) throw new Error(`Status: ${res.status} ${res.statusText}`);

        const suggestions = await res.json();
        console.log(`Found ${suggestions.length} suggestions:`);
        suggestions.forEach(s => console.log(` - ${s.Title} (${s.Author})`));

        // 2. Test Arabic Normalization (if you have Arabic books)
        // searching for 'كتاب' with variations
        const arabicTerm = 'كتاب';
        console.log(`\nSearching for Arabic "${arabicTerm}"...`);
        const resAr = await fetch(`${API_URL}/books/autocomplete?q=${arabicTerm}`);
        const suggestionsAr = await resAr.json();
        console.log(`Found ${suggestionsAr.length} suggestions.`);
        suggestionsAr.forEach(s => console.log(` - ${s.Title}`));

    } catch (err) {
        console.error('Test Failed:', err);
    }
};

runTest();
