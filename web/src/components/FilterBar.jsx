import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FilterBar = ({
    sort, setSort,
    rating, setRating,
    category, setCategory,
    subgenre, setSubgenre,
    bookLength, setBookLength,
    originalLanguage, setOriginalLanguage,
    className = ""
}) => {
    const [categories, setCategories] = useState([]);
    const [availableSubgenres, setAvailableSubgenres] = useState([]);
    const [languages, setLanguages] = useState([]);

    // Fetch Categories and Languages on mount
    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [catRes, langRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/meta/categories'),
                    axios.get('http://localhost:5000/api/meta/languages')
                ]);
                setCategories(catRes.data);
                setLanguages(langRes.data);
            } catch (err) {
                console.error('Failed to fetch filter metadata', err);
            }
        };
        fetchMeta();
    }, []);

    // Update available subgenres when category changes
    useEffect(() => {
        if (category) {
            // Find category by NAME (since valid value is name)
            const cat = categories.find(c => c.Name === category);
            setAvailableSubgenres(cat ? cat.subgenres : []);
        } else {
            setAvailableSubgenres([]);
        }
    }, [category, categories]);

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        setSubgenre(''); // Reset subgenre
    };

    const hasActiveFilters = category || rating || subgenre || bookLength || originalLanguage;

    const resetFilters = () => {
        setCategory('');
        setSubgenre('');
        setRating('');
        setBookLength('');
        setOriginalLanguage('');
        setSort('newest');
    };

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6 w-full ${className}`}>
            <h3 className="font-bold text-slate-800 text-lg flex items-center justify-between">
                <span>🔍 تصفية</span>
                {hasActiveFilters && (
                    <button
                        onClick={resetFilters}
                        className="text-xs text-red-500 font-medium hover:underline"
                    >
                        إعادة تعيين
                    </button>
                )}
            </h3>

            {/* Category Filter */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">التصنيف الرئيسي</label>
                <select
                    value={category}
                    onChange={handleCategoryChange}
                    className="input-filter"
                >
                    <option value="">الكل</option>
                    {categories.map(cat => (
                        <option key={cat.CategoryID} value={cat.Name}>{cat.DisplayName_Ar || cat.Name}</option>
                    ))}
                </select>
            </div>

            {/* Subgenre Filter */}
            <div className="flex flex-col gap-2">
                <label className={`text-sm font-bold transition-colors ${!category ? 'text-slate-300' : 'text-slate-700'}`}>النوع الفرعي</label>
                <select
                    value={subgenre}
                    onChange={(e) => setSubgenre(e.target.value)}
                    className={`input-filter ${!category ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
                    disabled={!category}
                >
                    <option value="">الكل {category ? `في ${categories.find(c => c.Name === category)?.DisplayName_Ar || category}` : ''}</option>
                    {availableSubgenres.map(sub => (
                        <option key={sub.SubgenreID} value={sub.Name}>{sub.DisplayName_Ar || sub.Name}</option>
                    ))}
                </select>
            </div>

            <hr className="border-slate-100" />

            {/* Book Length Filter */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">طول الكتاب</label>
                <select
                    value={bookLength}
                    onChange={(e) => setBookLength(e.target.value)}
                    className="input-filter"
                >
                    <option value="">أي طول</option>
                    <option value="short">📘 قصير (أقل من 200 صفحة)</option>
                    <option value="medium">📗 متوسط (200-400 صفحة)</option>
                    <option value="long">📕 طويل (أكثر من 400 صفحة)</option>
                </select>
            </div>

            {/* Original Language Filter */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">اللغة الأصلية</label>
                <select
                    value={originalLanguage}
                    onChange={(e) => setOriginalLanguage(e.target.value)}
                    className="input-filter"
                >
                    <option value="">الكل</option>
                    {languages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))}
                </select>
            </div>

            <hr className="border-slate-100" />

            {/* Rating Filter */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">التقييم</label>
                <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="input-filter"
                >
                    <option value="">أي تقييم</option>
                    <option value="3">⭐️ 3+ نجوم</option>
                    <option value="4">⭐️ 4+ نجوم</option>
                </select>
            </div>

            {/* Sort Filter */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">الترتيب حسب</label>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="input-filter"
                >
                    <option value="newest">الأحدث</option>
                    <option value="oldest">الأقدم</option>
                    <option value="rating">الأعلى تقييماً</option>
                </select>
            </div>

            <style>{`
                .input-filter {
                    @apply bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer transition-all w-full text-sm font-medium;
                }
            `}</style>
        </div>
    );
};

export default FilterBar;
