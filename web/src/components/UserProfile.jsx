import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const UserProfile = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Editing state
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/users/${id}`);
                setProfile(res.data);
                setBio(res.data.bio || '');
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('bio', bio);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            await axios.put('http://localhost:5000/api/users/profile', formData, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setIsEditing(false);
            // Refresh to show new avatar immediately
            const res = await axios.get(`http://localhost:5000/api/users/${id}`);
            setProfile(res.data);
            alert('تم تحديث الملف الشخصي!');
        } catch (err) {
            console.error(err);
            alert('فشل تحديث الملف الشخصي');
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>جارِ تحميل الملف الشخصي...</div>;
    if (!profile) return <div style={{ padding: '20px' }}>المستخدم غير موجود</div>;

    const isOwnProfile = user && Number(user.id) === Number(profile.id);

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header / Avatar Section */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 h-32 relative"></div>
                <div className="px-8 pb-8 text-center relative">
                    <div className="relative -mt-16 inline-block">
                        <img
                            src={profile.avatar || 'https://via.placeholder.com/150'}
                            alt="Avatar"
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-white"
                        />
                        {isEditing && (
                            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-white text-slate-700 p-2 rounded-full shadow-md cursor-pointer hover:bg-slate-50 border border-slate-200 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.5l-3 9 9-3a2 2 0 0 0 .5-.5Z" /><path d="m15 5 4 4" /></svg>
                            </label>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="mt-6 text-right max-w-lg mx-auto">
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={e => setAvatarFile(e.target.files[0])}
                                className="hidden"
                            />

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2">اسم المستخدم</label>
                                <div className="text-xl font-bold text-slate-400 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                                    {profile.username}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2">نبذة عني</label>
                                <textarea
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                    className="w-full h-32 p-4 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none transition-all resize-none shadow-sm"
                                    placeholder="اكتب شيئاً عن نفسك..."
                                />
                            </div>

                            <div className="flex gap-3 justify-end mt-8 border-t border-slate-100 pt-6">
                                <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">إلغاء</button>
                                <button onClick={handleSave} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all">حفظ التغييرات</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="mt-4 text-3xl font-bold text-slate-800">{profile.username}</h2>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                {profile.isAdmin && <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold border border-rose-200">مسؤول</span>}
                                <span className="text-slate-500 text-sm bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                    انضم في {new Date(profile.createdAt).toLocaleDateString('ar-EG')}
                                </span>
                            </div>

                            <div className="mt-8 mx-auto max-w-lg">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-right">
                                    <h4 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-3 border-b border-slate-200 pb-2">نبذة شخصية</h4>
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                        {profile.bio || 'لا توجد نبذة شخصية حتى الآن.'}
                                    </p>
                                </div>
                            </div>

                            {isOwnProfile && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="mt-8 px-8 py-3 bg-white text-primary border-2 border-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
                                >
                                    تعديل الملف الشخصي
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
