
import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';

const AuthModal = () => {
    const { showAuthModal, setShowAuthModal, login, register } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // For register
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (showAuthModal) {
            setError('');
            setLoading(false);
        }
    }, [showAuthModal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(username, email, password);
            }
            // Close modal on success
            setShowAuthModal(false);
        } catch (err) {
            const msg = err.response?.data?.msg || 'فشل العملية';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!showAuthModal) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setShowAuthModal(false)}
            ></div>

            {/* Modal Card */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-fade-in-down border border-slate-100">
                {/* Close Button */}
                <button
                    onClick={() => setShowAuthModal(false)}
                    className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            {isLogin ? 'مرحباً بـعـودتـك' : 'انضم إلينا'}
                        </h2>
                        <p className="text-slate-500 text-sm">
                            {isLogin
                                ? 'سجل الدخول للمتابعة والمشاركة'
                                : 'أنشئ حساباً جديداً للمشاركة في المجتمع'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">اسم المستخدم</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                                    placeholder="Username"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">البريد الإلكتروني</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">كلمة المرور</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    جاري المعالجة...
                                </span>
                            ) : (
                                isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center pt-6 border-t border-slate-100">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-slate-500 hover:text-primary transition-colors font-medium"
                        >
                            {isLogin
                                ? 'ليس لديك حساب؟ أنشئ حساباً جديداً'
                                : 'لديك حساب بالفعل؟ تسجيل الدخول'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
