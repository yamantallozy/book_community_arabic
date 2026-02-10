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
    const [category, setCategory] = useState('');
    const [subgenre, setSubgenre] = useState('');
    const [bookLength, setBookLength] = useState('');
    const [originalLanguage, setOriginalLanguage] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const params = {};
                if (search) params.q = search;
                if (sort) params.sort = sort;
                if (rating) params.rating = rating;
                if (category) params.category = category; // Pass Category Name or ID? Backend expects Name from previous check, but let's see. 
                // In bookController.js: if (category) whereClauses.push(`c.Name = @category`); 
                // So backend expects Category Name. But FilterBar usually works with IDs. 
                // I should check what FilterBar will send.
                // If I change FilterBar to send Name, it matches backend. 
                // Or I update backend to accept ID. 
                // Let's stick to Name for "Human Readable URLs" logic if we ever add routing, but ID is safer.
                // Re-reading bookController.js: request.input('category', sql.NVarChar, category);
                // It expects text. 
                // So FilterBar should pass the Name.

                if (subgenre) params.subgenre = subgenre;
                if (bookLength) params.bookLength = bookLength;
                if (originalLanguage) params.originalLanguage = originalLanguage;

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
    }, [search, sort, rating, category, subgenre, bookLength, originalLanguage]);

    const handleSearch = (term) => {
        setSearch(term);
    };

    if (loading) return <div className="text-center py-20">جارِ تحميل الكتب...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            {/* Mobile Filter Button */}
            <div className="md:hidden mb-4 flex justify-end">
                <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span>تصفية</span>
                </button>
            </div>

            {/* Mobile Filter Drawer (Overlay) */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm"
                        onClick={() => setIsFilterOpen(false)}
                    ></div>

                    {/* Drawer Content */}
                    <div className="relative bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-fade-in-down max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
                            <h3 className="font-bold text-lg text-slate-800">خيارات التصفية</h3>
                            <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <FilterBar
                                sort={sort}
                                setSort={setSort}
                                rating={rating}
                                setRating={setRating}
                                category={category}
                                setCategory={setCategory}
                                subgenre={subgenre}
                                setSubgenre={setSubgenre}
                                bookLength={bookLength}
                                setBookLength={setBookLength}
                                originalLanguage={originalLanguage}
                                setOriginalLanguage={setOriginalLanguage}
                                className="!p-0 !shadow-none !border-none"
                            />
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="w-full mt-6 bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 active:scale-95 transition-all"
                            >
                                إظهار النتائج
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* Desktop Sidebar */}
                <aside className="hidden md:block w-72 flex-shrink-0 sticky top-24">
                    <FilterBar
                        sort={sort} setSort={setSort}
                        rating={rating} setRating={setRating}
                        category={category} setCategory={setCategory}
                        subgenre={subgenre} setSubgenre={setSubgenre}
                        bookLength={bookLength} setBookLength={setBookLength}
                        originalLanguage={originalLanguage} setOriginalLanguage={setOriginalLanguage}
                    />
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
                            <span className="text-6xl block mb-4">🔍</span>
                            <p className="text-slate-500 text-lg font-medium">لا توجد كتب تطابق بحثك.</p>
                            <button
                                onClick={() => { setSearch(''); setCategory(''); setSubgenre(''); setRating(''); setBookLength(''); setOriginalLanguage(''); }}
                                className="mt-4 text-primary font-bold hover:underline"
                            >
                                إعادة تعيين الفلاتر
                            </button>
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

                                            {/* Rating Badge */}
                                            <div className="absolute top-2 left-2 rtl:right-auto rtl:left-2 ltr:right-2">
                                                <span className="bg-white/90 backdrop-blur-sm text-amber-500 text-xs font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                                                    <span>★</span> {book.AverageRating ? book.AverageRating.toFixed(1) : '0.0'}
                                                </span>
                                            </div>

                                            {/* Category Badge overlay */}
                                            {book.CategoryNameAr && (
                                                <div className="absolute bottom-2 right-2 rtl:left-auto rtl:right-2">
                                                    <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                                                        {book.CategoryNameAr}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight group-hover:text-primary transition-colors line-clamp-2">{book.Title}</h3>
                                            <p className="text-sm text-slate-500 mb-3 font-medium">{book.Author}</p>

                                            <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">{book.Description}</p>

                                            <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                                                <span>{book.ReviewCount} تقييم</span>
                                                <span className="group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1 text-primary font-bold">تفاصيل &larr;</span>
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
