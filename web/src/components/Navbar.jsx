import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const navLinkClasses = ({ isActive }) =>
        `px-3 py-2 rounded-lg transition-all duration-200 font-medium ${isActive
            ? 'text-primary bg-indigo-50 font-bold shadow-sm ring-1 ring-indigo-100'
            : 'text-slate-600 hover:text-primary hover:bg-slate-50'
        }`;

    const mobileNavLinkClasses = ({ isActive }) =>
        `block px-3 py-2.5 rounded-lg text-base font-medium transition-colors border-b border-slate-50 ${isActive
            ? 'text-primary bg-indigo-50 font-bold shadow-sm'
            : 'text-slate-700 hover:text-primary hover:bg-slate-50'
        }`;

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Mobile Menu Button (Placed first for RTL) */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-primary hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-bold text-primary hover:text-secondary transition-colors">
                            📖 مجتمع القراء
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-4 lg:gap-6">
                        <NavLink to="/" className={navLinkClasses}>الرئيسية</NavLink>
                        <NavLink to="/events" className={navLinkClasses}>فعاليات</NavLink>
                        <NavLink to="/blog" className={navLinkClasses}>مدونة</NavLink>

                        {user ? (
                            <div className="flex items-center gap-4">
                                {user.isAdmin && (
                                    <NavLink to="/admin" className={navLinkClasses}>
                                        لوحة التحكم
                                    </NavLink>
                                )}
                                <NavLink to={`/profile/${user.id}`} className={({ isActive }) =>
                                    `flex items-center gap-2 font-medium transition-colors ${isActive ? 'text-primary font-bold' : 'text-slate-700 hover:text-primary'
                                    }`
                                }>
                                    {user.avatar && <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-slate-200" />}
                                    <span>{user.username}</span>
                                </NavLink>
                                <button
                                    onClick={logout}
                                    className="bg-transparent border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-red-500 px-4 py-1.5 rounded-lg text-sm transition-all"
                                >
                                    خروج
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <NavLink to="/login" className={navLinkClasses}>دخول</NavLink>
                                <Link to="/register" className="bg-primary hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all">حساب جديد</Link>
                            </div>
                        )}
                    </div>

                    {/* Spacer for Flex Balance (optional) */}
                    <div className="md:hidden w-6"></div>
                </div>
            </div>

            {/* Mobile Menu (Side Drawer) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex justify-end md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>

                    {/* Drawer */}
                    <div className="relative w-64 h-full bg-white shadow-xl animate-slide-in-right overflow-y-auto">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <span className="font-bold text-lg text-primary">القائمة</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 -mr-2 text-slate-500 hover:text-red-500 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="px-4 py-6 space-y-2">
                            {user && (
                                <div className="flex items-center gap-3 px-3 py-3 mb-4 bg-slate-50 rounded-xl">
                                    {user.avatar && <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-slate-200" />}
                                    <div>
                                        <div className="font-medium text-slate-800 text-sm">{user.username}</div>
                                        <div className="text-xs text-slate-500">{user.email}</div>
                                    </div>
                                </div>
                            )}

                            <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavLinkClasses}>
                                الرئيسية
                            </NavLink>
                            <NavLink to="/events" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavLinkClasses}>
                                فعاليات
                            </NavLink>
                            <NavLink to="/blog" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavLinkClasses}>
                                مدونة
                            </NavLink>

                            {user ? (
                                <>
                                    {user.isAdmin && (
                                        <NavLink to="/admin" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) =>
                                            `block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-primary bg-indigo-50 hover:bg-indigo-100'
                                            }`
                                        }>
                                            لوحة التحكم
                                        </NavLink>
                                    )}
                                    <NavLink to={`/profile/${user.id}`} onClick={() => setIsMobileMenuOpen(false)} className={mobileNavLinkClasses}>
                                        الملف الشخصي
                                    </NavLink>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full text-right block px-3 py-2.5 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        خروج
                                    </button>
                                </>
                            ) : (
                                <div className="pt-4 mt-2 space-y-3">
                                    <NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) =>
                                        `block w-full text-center px-4 py-2 border border-slate-300 rounded-lg transition-colors font-medium ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                                        }`
                                    }>
                                        دخول
                                    </NavLink>
                                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium">
                                        حساب جديد
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
