import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AddBook from './AddBook';

const AdminDashboard = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { token, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('add-book'); // 'add-book' or 'promote-user'

    if (loading) {
        return <div className="text-center py-20">جارِ التحميل...</div>;
    }

    const handlePromote = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const response = await axios.put('http://localhost:5000/api/users/promote', { email }, config);
            setMessage(response.data.msg);
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.msg || 'فشل ترقية المستخدم');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold text-slate-800 mb-8 text-center">لوحة التحكم</h1>

            <div className="flex gap-4 mb-8 justify-center">
                <button
                    onClick={() => setActiveTab('add-book')}
                    className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === 'add-book' ? 'bg-primary text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                    إضافة كتاب
                </button>
                <button
                    onClick={() => setActiveTab('promote-user')}
                    className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === 'promote-user' ? 'bg-primary text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                    ترقية مستخدم
                </button>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
                {activeTab === 'add-book' && (
                    <AddBook />
                )}

                {activeTab === 'promote-user' && (
                    <div className="max-w-md mx-auto">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">ترقية إلى مسؤول</h2>

                        {message && <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-4 text-sm font-medium">{message}</div>}
                        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm font-medium">{error}</div>}

                        <form onSubmit={handlePromote} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-600">بريد المستخدم</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full"
                                    placeholder="أدخل البريد الإلكتروني للمستخدم"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-primary hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all mt-2"
                            >
                                تعيين كمسؤول
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
