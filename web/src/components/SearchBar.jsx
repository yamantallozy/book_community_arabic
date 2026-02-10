import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ onSearch }) => {
    const [term, setTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (term.trim().length >= 2) {
                setIsLoading(true);
                try {
                    const response = await axios.get(`http://localhost:5000/api/books/autocomplete?q=${encodeURIComponent(term)}`);
                    setSuggestions(response.data);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [term]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        onSearch(term);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && suggestions[activeIndex]) {
                e.preventDefault();
                handleSuggestionClick(suggestions[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (book) => {
        setTerm(book.Title);
        setShowSuggestions(false);
        navigate(`/books/${book.BookID}`);
    };

    // Highlight matching text
    const HighlightMatch = ({ text, highlight }) => {
        if (!highlight.trim()) return <span>{text}</span>;

        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span key={i} className="text-primary font-bold">{part}</span>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </span>
        );
    };

    return (
        <div ref={wrapperRef} className="w-full relative z-50">
            <form onSubmit={handleSubmit} className="w-full relative">
                <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => term.length >= 2 && setSuggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="ابحث عن الكتاب أو المؤلف..."
                    className="w-full bg-white border border-slate-200 rounded-xl pr-12 pl-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-700 placeholder-slate-400 shadow-sm"
                    dir="rtl"
                />

                <button
                    type="submit"
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden max-h-96 overflow-y-auto">
                    <ul>
                        {suggestions.map((book, index) => (
                            <li key={book.BookID}>
                                <button
                                    onClick={() => handleSuggestionClick(book)}
                                    className={`w-full text-right px-4 py-3 flex items-center gap-3 transition-colors ${index === activeIndex ? 'bg-slate-50' : 'hover:bg-slate-50'
                                        }`}
                                >
                                    {/* Small Cover Preview */}
                                    <div className="h-10 w-8 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                                        {book.CoverImageURL ? (
                                            <img src={book.CoverImageURL} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">📚</div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800 truncate">
                                            <HighlightMatch text={book.Title} highlight={term} />
                                        </h4>
                                        <p className="text-xs text-slate-500 truncate">
                                            {book.Author}
                                        </p>
                                    </div>

                                    <div className="text-slate-300">
                                        <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
