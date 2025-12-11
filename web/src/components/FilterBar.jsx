import React from 'react';

const FilterBar = ({ sort, setSort, rating, setRating }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6 w-full">
            <h3 className="font-bold text-slate-800 text-lg">Filters</h3>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-600">Sort By</label>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer transition-all w-full"
                >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="rating">Highest Rated</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-600">Min Rating</label>
                <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer transition-all w-full"
                >
                    <option value="">All Ratings</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                </select>
            </div>
        </div>
    );
};

export default FilterBar;
