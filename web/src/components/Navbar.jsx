import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm sticky top-0 z-50">
            <div className="logo">
                <Link to="/" className="text-2xl font-bold text-primary hover:text-secondary transition-colors">
                    📖 مجتمع القراء
                </Link>
            </div>
            <div className="flex items-center gap-6">
                <Link to="/" className="text-slate-600 hover:text-primary font-medium transition-colors">الرئيسية</Link>
                <Link to="/events" className="text-slate-600 hover:text-primary font-medium transition-colors">فعاليات</Link>
                <Link to="/my-books" className="text-slate-600 hover:text-primary font-medium transition-colors">كتبي</Link>

                {user ? (
                    <div className="flex items-center gap-4">
                        {user.isAdmin && (
                            <Link to="/admin" className="text-sm font-bold text-primary bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">
                                لوحة التحكم
                            </Link>
                        )}
                        <Link to={`/profile/${user.id}`} className="flex items-center gap-2 text-slate-700 hover:text-primary font-medium transition-colors">
                            {user.avatar && <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-slate-200" />}
                            <span>{user.username}</span>
                        </Link>
                        <button
                            onClick={logout}
                            className="bg-transparent border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-red-500 px-4 py-1.5 rounded-lg text-sm transition-all"
                        >
                            خروج
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="text-slate-600 hover:text-primary font-medium transition-colors">دخول</Link>
                        <Link to="/register" className="bg-primary hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all">حساب جديد</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
