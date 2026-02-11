import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomSelect from './CustomSelect';

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

    useEffect(() => {
        if (category) {
            const cat = categories.find(c => c.Name === category);
            setAvailableSubgenres(cat ? cat.subgenres : []);
        } else {
            setAvailableSubgenres([]);
        }
    }, [category, categories]);

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        setSubgenre('');
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

    // Prepare Options for CustomSelect
    const categoryOptions = [
        { value: "", label: "كل التصنيفات" },
        ...categories.map(c => ({ value: c.Name, label: c.DisplayName_Ar || c.Name }))
    ];

    const subgenreOptions = [
        { value: "", label: "الكل" },
        ...availableSubgenres.map(s => ({ value: s.Name, label: s.DisplayName_Ar || s.Name }))
    ];

    const sortOptions = [
        { value: "newest", label: "الأحدث وصولاً" },
        { value: "oldest", label: "الأقدم" },
        { value: "rating", label: "الأعلى تقييماً" }
    ];

    const ratingOptions = [
        { value: "", label: "الجميع" },
        { value: "3", label: "⭐️ 3+ نجوم" },
        { value: "4", label: "⭐️ 4+ نجوم" }
    ];

    const lengthOptions = [
        { value: "", label: "أي طول" },
        { value: "short", label: "قصيرة (<200)" },
        { value: "medium", label: "متوسطة (200-400)" },
        { value: "long", label: "طويلة (>400)" }
    ];

    const languageOptions = [
        { value: "", label: "الكل" },
        ...languages.map(l => ({ value: l, label: l }))
    ];

    return (
        <div className={`flex flex-col gap-6 w-full ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[var(--color-text)] text-lg">
                    تصفية النتائج
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={resetFilters}
                        className="text-xs text-[var(--color-primary)] font-bold hover:underline"
                    >
                        إعادة تعيين
                    </button>
                )}
            </div>

            <div className="space-y-5">
                <CustomSelect
                    label="التصنيف"
                    value={category}
                    onChange={handleCategoryChange}
                    options={categoryOptions}
                />

                <CustomSelect
                    label="النوع الفرعي"
                    value={subgenre}
                    onChange={(e) => setSubgenre(e.target.value)}
                    options={subgenreOptions}
                    disabled={!category}
                />

                <CustomSelect
                    label="ترتيب حسب"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    options={sortOptions}
                />

                <div className="pt-4 border-t border-[var(--color-border)] space-y-5">
                    <CustomSelect
                        label="التقييم"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        options={ratingOptions}
                    />

                    <CustomSelect
                        label="طول الكتاب"
                        value={bookLength}
                        onChange={(e) => setBookLength(e.target.value)}
                        options={lengthOptions}
                    />

                    <CustomSelect
                        label="اللغة"
                        value={originalLanguage}
                        onChange={(e) => setOriginalLanguage(e.target.value)}
                        options={languageOptions}
                    />
                </div>
            </div>
        </div>
    );
};

export default FilterBar;

