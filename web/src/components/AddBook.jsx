import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AddBook = () => {
    // Section 1: Essentials
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [coverImageURL, setCoverImageURL] = useState('');

    // Section 2: Details (Optional)
    const [translator, setTranslator] = useState('');
    const [publisher, setPublisher] = useState('');
    const [pageCount, setPageCount] = useState('');
    const [originalLanguage, setOriginalLanguage] = useState('');
    const [publicationYear, setPublicationYear] = useState('');
    const [isbn, setIsbn] = useState('');

    // Section 3: Classification (Optional)
    const [categories, setCategories] = useState([]);
    const [tagsList, setTagsList] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState(''); // ID
    const [availableSubgenres, setAvailableSubgenres] = useState([]);
    const [selectedSubgenres, setSelectedSubgenres] = useState([]); // Array of IDs
    const [selectedTags, setSelectedTags] = useState([]); // Array of IDs

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { user, token } = useAuth();
    const navigate = useNavigate();

    // Fetch Metadata Options
    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [catRes, tagRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/meta/categories'),
                    axios.get('http://localhost:5000/api/meta/tags')
                ]);
                setCategories(catRes.data);
                setTagsList(tagRes.data);
            } catch (err) {
                console.error('Failed to load metadata', err);
            }
        };
        fetchMeta();
    }, []);

    // Update Subgenres when Category changes
    useEffect(() => {
        if (selectedCategory) {
            const cat = categories.find(c => c.CategoryID === parseInt(selectedCategory));
            setAvailableSubgenres(cat ? cat.subgenres : []);
            setSelectedSubgenres([]); // Reset subgenres on category change
        } else {
            setAvailableSubgenres([]);
        }
    }, [selectedCategory, categories]);

    const handleSubgenreChange = (e) => {
        const options = [...e.target.selectedOptions];
        const values = options.map(option => parseInt(option.value));
        setSelectedSubgenres(values);
    };

    const handleTagChange = (e) => {
        const options = [...e.target.selectedOptions];
        const values = options.map(option => parseInt(option.value));
        setSelectedTags(values);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!title || !author) {
            setError('Please fill in title and author.');
            setLoading(false);
            return;
        }

        const payload = {
            title, author, description, coverImageURL,
            translator: translator || null,
            publisher: publisher || null,
            pageCount: pageCount ? parseInt(pageCount) : null,
            originalLanguage: originalLanguage || null,
            publicationYear: publicationYear ? parseInt(publicationYear) : null,
            isbn: isbn || null,
            categoryId: selectedCategory ? parseInt(selectedCategory) : null,
            subgenreIds: selectedSubgenres,
            tagIds: selectedTags
        };

        try {
            await axios.post('http://localhost:5000/api/books', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('تم تقديم الكتاب للمراجعة بنجاح! سيظهر في المكتبة بعد موافقة الإدارة.');
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || 'Error adding book');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div className="text-center py-20 text-red-500">يرجى تسجيل الدخول لإضافة كتاب.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">إضافة كتاب جديد</h2>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center font-medium border border-red-100">{error}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">

                {/* Section 1: Essentials */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-700 mb-6 border-b pb-2 border-slate-100 flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                        المعلومات الأساسية (مطلوب)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-600">العنوان <span className="text-red-500">*</span></label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="input-field" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-600">المؤلف <span className="text-red-500">*</span></label>
                            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required className="input-field" />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-600">الوصف</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" className="input-field resize-none"></textarea>
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-600">رابط صورة الغلاف</label>
                            <input type="url" value={coverImageURL} onChange={(e) => setCoverImageURL(e.target.value)} className="input-field" placeholder="https://example.com/image.jpg" />
                        </div>
                    </div>
                </div>

                {/* Section 2: Details */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-700 mb-6 border-b pb-2 border-slate-100 flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                        تفاصيل إضافية (اختياري)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-600">المترجم</label>
                            <input type="text" value={translator} onChange={(e) => setTranslator(e.target.value)} className="input-field" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-600">الناشر</label>
                            <input type="text" value={publisher} onChange={(e) => setPublisher(e.target.value)} className="input-field" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-600">اللغة الأصلية</label>
                            <input type="text" value={originalLanguage} onChange={(e) => setOriginalLanguage(e.target.value)} className="input-field" placeholder="مثال: الإنجليزية" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-600">عدد الصفحات</label>
                            <input type="number" value={pageCount} onChange={(e) => setPageCount(e.target.value)} className="input-field" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-600">سنة النشر</label>
                            <input type="number" value={publicationYear} onChange={(e) => setPublicationYear(e.target.value)} className="input-field" placeholder="2024" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-600">ISBN</label>
                            <input type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)} className="input-field" />
                        </div>
                    </div>
                </div>

                {/* Section 3: Classification */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-700 mb-6 border-b pb-2 border-slate-100 flex items-center gap-2">
                        <span className="bg-amber-100 text-amber-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                        التصنيف (اختياري)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-600">القسم الرئيسي</label>
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input-field cursor-pointer">
                                <option value="">اختر القسم...</option>
                                {categories.map(cat => (
                                    <option key={cat.CategoryID} value={cat.CategoryID}>{cat.DisplayName_Ar || cat.Name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-600">التصنيفات الفرعية (Ctrl+Click لاختيار متعدد)</label>
                            <select
                                multiple
                                value={selectedSubgenres}
                                onChange={handleSubgenreChange}
                                className="input-field h-32 cursor-pointer"
                                disabled={!selectedCategory}
                            >
                                {availableSubgenres.length === 0 ? (
                                    <option disabled>اختر قسماً أولاً</option>
                                ) : (
                                    availableSubgenres.map(sub => (
                                        <option key={sub.SubgenreID} value={sub.SubgenreID}>{sub.DisplayName_Ar || sub.Name}</option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-600">الوسوم (Tags)</label>
                            <div className="flex flex-wrap gap-2 mb-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[3rem]">
                                {tagsList.map(tag => (
                                    <button
                                        key={tag.TagID}
                                        type="button"
                                        onClick={() => {
                                            if (selectedTags.includes(tag.TagID)) {
                                                setSelectedTags(selectedTags.filter(id => id !== tag.TagID));
                                            } else {
                                                setSelectedTags([...selectedTags, tag.TagID]);
                                            }
                                        }}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${selectedTags.includes(tag.TagID)
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        #{tag.DisplayName_Ar || tag.Name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-200 transition-all mt-4 disabled:opacity-50"
                >
                    {loading ? 'جارِ الإضافة...' : 'حفظ الكتاب'}
                </button>
            </form>

            <style>{`
                .input-field {
                    @apply bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full text-slate-800;
                }
            `}</style>
        </div>
    );
};

export default AddBook;
