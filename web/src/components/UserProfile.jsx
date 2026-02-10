import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ShelfControl from './ShelfControl';
import BookShelfCarousel from './BookShelfCarousel';
import LocationPicker from './LocationPicker';

const UserProfile = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ followers: 0, following: 0 });
    const [isFollowing, setIsFollowing] = useState(false);
    const [shelves, setShelves] = useState([]);
    const [recentReviews, setRecentReviews] = useState([]);

    // Editing state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        bio: '',
        location: '',
        locationData: null, // Structured location from LocationPicker
        favoriteGenres: [],
        socialLinks: {}
    });
    const [avatarFile, setAvatarFile] = useState(null);

    // Initial Data Fetch
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1. Profile Data
                const profileRes = await axios.get(`http://localhost:5000/api/users/${id}`);
                setProfile(profileRes.data);
                setStats(profileRes.data.stats || { followers: 0, following: 0 });
                setIsFollowing(profileRes.data.isFollowing);

                // Ensure favoriteGenres is an array
                const safeGenres = Array.isArray(profileRes.data.favoriteGenres)
                    ? profileRes.data.favoriteGenres
                    : [];

                setEditForm({
                    bio: profileRes.data.bio || '',
                    location: profileRes.data.location || '',
                    locationData: profileRes.data.locationData || null,
                    favoriteGenres: safeGenres,
                    socialLinks: profileRes.data.socialLinks || {}
                });

                // 2. Shelves Data
                const shelvesRes = await axios.get(`http://localhost:5000/api/shelves/user/${id}`);
                setShelves(shelvesRes.data);

                // 3. Recent Reviews
                const reviewsRes = await axios.get(`http://localhost:5000/api/reviews/user/${id}`);
                setRecentReviews(reviewsRes.data);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchAllData();
    }, [id]);

    const handleFollowToggle = async () => {
        if (!user) return alert('يرجى تسجيل الدخول للمتابعة');
        try {
            if (isFollowing) {
                await axios.delete(`http://localhost:5000/api/users/${id}/follow`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
            } else {
                await axios.post(`http://localhost:5000/api/users/${id}/follow`, {}, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
            }
            setIsFollowing(!isFollowing);
        } catch (err) {
            console.error(err);
            alert('حدث خطأ في المتابعة');
        }
    };

    const handleSaveProfile = async () => {
        try {
            const formData = new FormData();
            formData.append('bio', editForm.bio);
            formData.append('location', editForm.location);
            formData.append('favoriteGenres', JSON.stringify(editForm.favoriteGenres));
            formData.append('socialLinks', JSON.stringify(editForm.socialLinks));

            // Add structured location data if available
            if (editForm.locationData) {
                formData.append('locationData', JSON.stringify(editForm.locationData));
            }

            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const res = await axios.put('http://localhost:5000/api/users/profile', formData, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setProfile(prev => ({ ...prev, ...editForm, avatar: res.data.avatar }));
            setIsEditing(false);
            alert('تم تحديث الملف الشخصي!');
        } catch (err) {
            console.error(err);
            alert('فشل تحديث الملف الشخصي');
        }
    };

    if (loading) return <div className="p-10 text-center">جارِ تحميل الملف الشخصي...</div>;
    if (!profile) return <div className="p-10 text-center">المستخدم غير موجود</div>;

    const isOwnProfile = user && Number(user.id) === Number(profile.id);

    // Filter Shelves
    const currentlyReading = shelves.filter(s => s.Status === 'CurrentlyReading');
    const read = shelves.filter(s => s.Status === 'Read');
    const wantToRead = shelves.filter(s => s.Status === 'WantToRead');

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column (Info) */}
            <div className="md:col-span-4 lg:col-span-3 space-y-6">
                <div className="text-center md:text-right">
                    <div className="relative inline-block mb-4">
                        <img
                            src={profile.avatar || 'https://via.placeholder.com/150'}
                            alt="Avatar"
                            className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg mx-auto md:mx-0"
                        />
                        {isEditing && (
                            <label htmlFor="avatar-upload" className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer text-slate-600 hover:text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.5l-3 9 9-3a2 2 0 0 0 .5-.5Z" /><path d="m15 5 4 4" /></svg>
                                <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={e => setAvatarFile(e.target.files[0])} />
                            </label>
                        )}
                    </div>

                    {!isEditing ? (
                        <>
                            <h1 className="text-2xl font-bold text-slate-900 mb-1">{profile.username}</h1>
                            {profile.location && <p className="text-slate-500 text-sm mb-4">📍 {profile.location}</p>}

                            {/* Bio Section */}
                            <div className="mb-6">
                                <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">نبذة عني</h3>
                                {profile.bio ? (
                                    <p className="text-slate-600 text-sm leading-relaxed">{profile.bio}</p>
                                ) : (
                                    <p className="text-slate-400 text-sm italic">لم يتم إضافة نبذة بعد</p>
                                )}
                            </div>

                            <div className="flex justify-center md:justify-start gap-6 text-sm text-slate-600 mb-6 font-medium">
                                <div className="text-center md:text-right">
                                    <span className="block text-lg font-bold text-slate-900">{stats.followers}</span>
                                    متابع
                                </div>
                                <div className="text-center md:text-right">
                                    <span className="block text-lg font-bold text-slate-900">{stats.following}</span>
                                    يتابع
                                </div>
                                <div className="text-center md:text-right">
                                    <span className="block text-lg font-bold text-slate-900">{stats.averageRating ? stats.averageRating : '0'}</span>
                                    متوسط التقييم
                                </div>
                                <div className="text-center md:text-right">
                                    <span className="block text-lg font-bold text-slate-900">{reviewsCount(recentReviews)}</span>
                                    مراجعة
                                </div>
                            </div>

                            {!isOwnProfile && (
                                <button
                                    onClick={handleFollowToggle}
                                    className={`w-full py-2 px-4 rounded-full font-bold transition-all ${isFollowing ? 'bg-slate-100 text-slate-600 border border-slate-300' : 'bg-primary text-white shadow-md hover:bg-indigo-700'}`}
                                >
                                    {isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
                                </button>
                            )}

                            {isOwnProfile && (
                                <button onClick={() => setIsEditing(true)} className="text-sm text-primary font-bold hover:underline">تعديل الملف الشخصي</button>
                            )}

                            <div className="border-t border-slate-200 mt-6 pt-6">
                                <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">أنواع الكتب المفضلة</h3>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(profile.favoriteGenres) && profile.favoriteGenres.length > 0 ? (
                                        profile.favoriteGenres.map((g, i) => (
                                            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">{g}</span>
                                        ))
                                    ) : (
                                        <span className="text-slate-400 text-xs italic">لم يحدد بعد</span>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3 text-right">
                            <div>
                                <label className="text-xs font-bold text-slate-500">الاسم</label>
                                <div className="text-slate-700 font-bold">{profile.username}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500">الموقع</label>
                                <LocationPicker
                                    value={editForm.locationData || editForm.location}
                                    onChange={(loc) => setEditForm({
                                        ...editForm,
                                        locationData: loc,
                                        location: loc?.fullLabelAr || ''
                                    })}
                                    placeholder="ابحث عن مدينتك..."
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500">نبذة عني</label>
                                <textarea
                                    className="w-full text-sm border p-2 rounded h-24"
                                    value={editForm.bio}
                                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500">التصنيفات المفضلة (افصل بفاصلة)</label>
                                <input
                                    className="w-full text-sm border p-2 rounded"
                                    value={editForm.favoriteGenres.join(', ')}
                                    onChange={e => setEditForm({ ...editForm, favoriteGenres: e.target.value.split(',').map(s => s.trim()) })}
                                    placeholder="روايات، خيال علمي..."
                                />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button onClick={handleSaveProfile} className="flex-1 bg-primary text-white text-sm py-2 rounded font-bold">حفظ</button>
                                <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-100 text-slate-600 text-sm py-2 rounded font-bold">إلغاء</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column (Content) */}
            <div className="md:col-span-8 lg:col-span-9 space-y-8">

                {/* Book Shelves with Carousel */}
                <BookShelfCarousel title="أقرأ حالياً" books={currentlyReading} />
                <BookShelfCarousel title="كتب قرأتها" books={read} />
                <BookShelfCarousel title="أريد قراءتها" books={wantToRead} />

                {/* Bookshelves Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">أرفف الكتب</h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <div className="text-2xl font-bold text-emerald-600 mb-1">{read.length}</div>
                            <div className="text-sm font-medium text-emerald-800">قرأته</div>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-xl border-amber-100">
                            <div className="text-2xl font-bold text-amber-600 mb-1">{currentlyReading.length}</div>
                            <div className="text-sm font-medium text-amber-800">يقرأ حالياً</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border-blue-100">
                            <div className="text-2xl font-bold text-blue-600 mb-1">{wantToRead.length}</div>
                            <div className="text-sm font-medium text-blue-800">أنوي قراءته</div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">أحدث الأنشطة</h2>
                    {recentReviews.length > 0 ? (
                        <div className="space-y-6">
                            {recentReviews.map(review => (
                                <div key={review.ReviewID} className="flex gap-4">
                                    <Link to={`/books/${review.BookID}`} className="shrink-0">
                                        <img src={review.CoverImageURL} alt={review.BookTitle} className="w-12 h-16 object-cover rounded shadow-sm" />
                                    </Link>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-slate-700">قام بتقييم كتاب</span>
                                            <Link to={`/books/${review.BookID}`} className="text-sm font-bold text-primary hover:underline">{review.BookTitle}</Link>
                                        </div>
                                        <div className="flex items-center gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-4 h-4 ${i < review.Rating ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                            <span className="text-xs text-slate-400 mr-2">{new Date(review.CreatedAt).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                        {review.Comment && (
                                            <p className="text-slate-600 text-sm italic">"{review.Comment}"</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 italic">لا توجد أنشطة مؤخراً.</p>
                    )}
                </div>

            </div>
        </div>
    );
};

// Helper for count
const reviewsCount = (reviews) => reviews ? reviews.length : 0;

export default UserProfile;
