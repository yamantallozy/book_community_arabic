import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [term, setTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(term);
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-4 w-full md:w-2/3">
            <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search by title or author..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-700 placeholder-slate-400 shadow-sm"
            />
            <button
                type="submit"
                className="bg-primary hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
            >
                Search
            </button>
        </form>
    );
};

export default SearchBar;
