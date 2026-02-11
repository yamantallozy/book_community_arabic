import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import BookCard from './BookCard';

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
                if (category) params.category = category;
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

    if (loading) return <div className="text-center py-20">جارِ تحميل الكتب...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

            {/* Hero Section (Only show on Home Page / No Search) */}
            {!search && !category && (
                <div className="flex flex-col-reverse md:flex-row items-center justify-between py-8 md:py-16 mb-8 md:mb-12 border-b border-[var(--color-border)]">
                    <div className="md:w-1/2 text-right">
                        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 text-[var(--color-text)]">
                            <span className="text-[var(--color-primary)]">إقرأ</span>، ارتقِ، وشارك.<br />
                            مجتمعك المعرفي الجديد.
                        </h1>
                        <p className="text-lg text-[var(--color-text-muted)] mb-8 max-w-lg">
                            اكتشف آلاف الكتب، وانضم إلى نقاشات ملهمة مع قراء يشاركونك الشغف.
                        </p>
                        <button onClick={() => document.getElementById('books-grid').scrollIntoView({ behavior: 'smooth' })} className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:scale-105 transition-transform">
                            تصفح المكتبة
                        </button>
                    </div>
                    <div className="md:w-1/2 flex justify-center mb-8 md:mb-0">
                        {/* Abstract 3D Helper */}
                        <div className="relative w-64 h-64 md:w-80 md:h-80">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-secondary)]/20 to-[var(--color-primary)]/10 rounded-full blur-3xl animate-pulse"></div>
                            <div className="relative z-10 w-full h-full flex items-center justify-center">
                                <span className="text-[8rem] filter drop-shadow-xl animate-fade-in-up">📚</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div id="books-grid" className="flex flex-col md:flex-row gap-8 items-start">

                {/* Desktop Sidebar */}
                <aside className="hidden md:block w-64 flex-shrink-0 sticky top-24">
                    <FilterBar
                        sort={sort} setSort={setSort}
                        rating={rating} setRating={setRating}
                        category={category} setCategory={setCategory}
                        subgenre={subgenre} setSubgenre={setSubgenre}
                        bookLength={bookLength} setBookLength={setBookLength}
                        originalLanguage={originalLanguage} setOriginalLanguage={setOriginalLanguage}
                    />
                </aside>

                {/* Mobile Filter Toggle */}
                <div className="md:hidden w-full flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg">الكتب المتاحة</h2>
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-4 py-2 rounded-full"
                    >
                        <span>تصفية & ترتيب</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    </button>
                </div>

                {/* Mobile Filter Drawer */}
                {isFilterOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center md:hidden">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}></div>
                        <div className="relative bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold">تصفية النتائج</h3>
                                <button onClick={() => setIsFilterOpen(false)} className="text-slate-400">✕</button>
                            </div>
                            <div className="p-4 overflow-y-auto flex-1">
                                <FilterBar
                                    sort={sort} setSort={setSort}
                                    rating={rating} setRating={setRating}
                                    category={category} setCategory={setCategory}
                                    subgenre={subgenre} setSubgenre={setSubgenre}
                                    bookLength={bookLength} setBookLength={setBookLength}
                                    originalLanguage={originalLanguage} setOriginalLanguage={setOriginalLanguage}
                                />
                            </div>
                            <div className="p-4 border-t">
                                <button onClick={() => setIsFilterOpen(false)} className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-xl">
                                    عرض النتائج
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 w-full">
                    <div className="mb-6">
                        <SearchBar onSearch={setSearch} />
                    </div>

                    {books.length === 0 ? (
                        <div className="text-center py-20">
                            <span className="text-6xl block mb-4">🔍</span>
                            <p className="text-[var(--color-text-muted)] font-medium">لا توجد كتب تطابق بحثك.</p>
                            <button
                                onClick={() => { setSearch(''); setCategory(''); }} // Reset all
                                className="mt-4 text-[var(--color-primary)] font-bold hover:underline"
                            >
                                عرض كل الكتب
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {books.map((book) => (
                                <BookCard key={book.BookID} book={book} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default BookList;
