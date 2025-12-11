import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [rating, setRating] = useState('');

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const params = {};
                if (search) params.q = search;
                if (sort) params.sort = sort;
                if (rating) params.rating = rating;

                const response = await axios.get('http://localhost:5000/api/books', { params });
                setBooks(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching books:', err);
                setError('Failed to load books');
                setLoading(false);
            }
        };

        fetchBooks();
    }, [search, sort, rating]);

    const handleSearch = (term) => {
        setSearch(term);
    };

    if (loading) return <div>Loading books...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* Sidebar */}
                <aside className="w-full md:w-64 flex-shrink-0 sticky top-24">
                    <FilterBar sort={sort} setSort={setSort} rating={rating} setRating={setRating} />
                </aside>

                {/* Main Content */}
                <main className="flex-1 w-full">
                    {/* Search Section */}
                    <div className="mb-8">
                        <SearchBar onSearch={handleSearch} />
                    </div>

                    {/* Books Grid */}
                    {books.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <p className="text-slate-500 text-lg">No books available matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {books.map((book) => (
                                <Link
                                    to={`/books/${book.BookID}`}
                                    key={book.BookID}
                                    className="group block h-full"
                                >
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 h-full flex flex-col">
                                        <div className="relative h-64 overflow-hidden bg-slate-100">
                                            {book.CoverImageURL ? (
                                                <img src={book.CoverImageURL} alt={book.Title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <span className="text-4xl px-4 text-center">📚</span>
                                                </div>
                                            )}
                                            <div className="absolute top-0 right-0 p-2">
                                                <span className="bg-white/90 backdrop-blur-sm text-yellow-500 text-xs font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                                                    <span>★</span> {book.AverageRating ? book.AverageRating.toFixed(1) : '0.0'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight group-hover:text-primary transition-colors line-clamp-2">{book.Title}</h3>
                                            <p className="text-sm text-slate-500 mb-3 font-medium">{book.Author}</p>

                                            <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">{book.Description}</p>

                                            <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                                                <span>{book.ReviewCount} Reviews</span>
                                                <span className="group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1 text-primary font-bold">Details &rarr;</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default BookList;
