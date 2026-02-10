import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BookShelfCarousel = ({ title, books, emptyMessage = "لا توجد كتب في هذا الرف" }) => {
    const scrollContainerRef = useRef(null);
    const [canScrollStart, setCanScrollStart] = useState(false);
    const [canScrollEnd, setCanScrollEnd] = useState(false);

    const checkScrollButtons = () => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const { scrollLeft, scrollWidth, clientWidth } = container;

        // Check if there's content to scroll
        const hasOverflow = scrollWidth > clientWidth;

        if (!hasOverflow) {
            setCanScrollStart(false);
            setCanScrollEnd(false);
            return;
        }

        // In RTL, scrollLeft starts at 0 and goes negative when scrolling to the left (visually)
        // scrollLeft = 0 means we're at the START (right side in RTL)
        // scrollLeft = -(scrollWidth - clientWidth) means we're at the END (left side in RTL)
        const maxScroll = scrollWidth - clientWidth;
        const currentScroll = Math.abs(scrollLeft);

        // Can scroll towards the start (right in RTL) = we're not at position 0
        setCanScrollStart(currentScroll > 5);
        // Can scroll towards the end (left in RTL) = we haven't reached max scroll
        setCanScrollEnd(currentScroll < maxScroll - 5);
    };

    useEffect(() => {
        // Initial check after render
        const timer = setTimeout(checkScrollButtons, 100);
        window.addEventListener('resize', checkScrollButtons);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', checkScrollButtons);
        };
    }, [books]);

    // Scroll towards the start (right side in RTL view)
    const scrollToStart = () => {
        if (!scrollContainerRef.current) return;
        scrollContainerRef.current.scrollBy({
            left: 300, // Positive = towards start in RTL
            behavior: 'smooth'
        });
    };

    // Scroll towards the end (left side in RTL view)
    const scrollToEnd = () => {
        if (!scrollContainerRef.current) return;
        scrollContainerRef.current.scrollBy({
            left: -300, // Negative = towards end in RTL
            behavior: 'smooth'
        });
    };

    if (!books || books.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <h2 className="text-lg font-bold text-slate-800">{title} ({books.length})</h2>
            </div>

            {/* Carousel Container */}
            <div className="relative group">
                {/* Right Arrow (scroll to start/right in RTL) - appears on the right side */}
                {canScrollStart && (
                    <button
                        onClick={scrollToStart}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary hover:shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 -mr-3"
                        aria-label="السابق"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}

                {/* Left Arrow (scroll to end/left in RTL) - appears on the left side */}
                {canScrollEnd && (
                    <button
                        onClick={scrollToEnd}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary hover:shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 -ml-3"
                        aria-label="التالي"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                {/* Scrollable Books Container */}
                <div
                    ref={scrollContainerRef}
                    onScroll={checkScrollButtons}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {books.map(shelf => (
                        <div key={shelf.BookID} className="flex-shrink-0 w-28 group/book">
                            <Link to={`/books/${shelf.BookID}`} className="block">
                                <div className="relative overflow-hidden rounded-lg shadow-sm group-hover/book:shadow-md transition-all duration-200">
                                    <img
                                        src={shelf.CoverImageURL}
                                        alt={shelf.Title}
                                        className="w-28 h-40 object-cover transform group-hover/book:scale-105 transition-transform duration-300"
                                    />
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/book:opacity-100 transition-opacity duration-200" />
                                </div>
                                <div className="mt-2 text-xs font-bold text-slate-800 truncate text-center">
                                    {shelf.Title}
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Fade edges for better UX */}
                {canScrollStart && (
                    <div className="absolute right-0 top-0 bottom-6 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                )}
                {canScrollEnd && (
                    <div className="absolute left-0 top-0 bottom-6 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                )}
            </div>
        </div>
    );
};

export default BookShelfCarousel;
