import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [term, setTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(term);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="relative">
                <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="ابحث باسم الكتاب أو المؤلف..."
                    className="w-full bg-white border border-slate-200 rounded-xl pr-12 pl-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-700 placeholder-slate-400 shadow-sm"
                />
                <button
                    type="submit"
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>
        </form>
    );
};

export default SearchBar;
