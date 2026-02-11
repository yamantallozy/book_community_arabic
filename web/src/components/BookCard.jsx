import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
    return (
        <Link
            to={`/books/${book.BookID}`}
            className="group block w-full card-flat overflow-hidden flex flex-row md:flex-col h-32 md:h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
        >
            {/* Cover Image */}
            <div className="relative overflow-hidden bg-[var(--color-background)] w-24 md:w-full md:h-64 shrink-0">
                {book.CoverImageURL ? (
                    <img
                        src={book.CoverImageURL}
                        alt={book.Title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-secondary)]/30">
                        <span className="text-4xl px-4 text-center">📚</span>
                    </div>
                )}

                {/* Rating Badge (Desktop Only) */}
                <div className="hidden md:absolute top-2 left-2 rtl:right-auto rtl:left-2 bg-white/90 backdrop-blur-sm text-amber-500 text-xs font-bold px-2 py-1 rounded-lg shadow-sm md:flex items-center gap-1">
                    <span>★</span> {book.AverageRating ? book.AverageRating.toFixed(1) : '0.0'}
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col p-3 md:p-5 flex-1 justify-between">
                <div>
                    {/* Category (Mobile) */}
                    {book.CategoryNameAr && (
                        <span className="md:hidden text-[10px] text-[var(--color-primary)] font-bold mb-1 block">
                            {book.CategoryNameAr}
                        </span>
                    )}

                    <h3 className="font-bold text-[var(--color-text)] mb-1 leading-tight group-hover:text-[var(--color-primary)] transition-colors text-sm md:text-lg line-clamp-2">
                        {book.Title}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] font-medium mb-2">{book.Author}</p>

                    {/* Description (Desktop Only) */}
                    <p className="hidden md:block text-sm text-[var(--color-text-muted)] line-clamp-3 mb-4 flex-1">
                        {book.Description}
                    </p>

                    {/* Rating (Mobile) */}
                    <div className="md:hidden flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                        <span>★</span> {book.AverageRating ? book.AverageRating.toFixed(1) : '0.0'}
                    </div>
                </div>

                {/* Footer */}
                <div className="md:pt-4 md:border-t md:border-[var(--color-border)] flex justify-between items-center text-xs text-[var(--color-text-muted)] mt-auto md:mt-0">
                    <span>{book.ReviewCount} تقييم</span>
                    <span className="hidden md:block group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1 text-[var(--color-primary)] font-bold">
                        تفاصيل &larr;
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default BookCard;
