import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    const navLinkClasses = ({ isActive }) =>
        `text-sm font-medium transition-colors duration-200 ${isActive
            ? 'text-[var(--color-primary)] font-bold'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'
        }`;

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-[var(--color-border)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo (Right) */}
                    <div className="flex-shrink-0 hidden md:flex items-center">
                        <Link to="/" className="text-3xl font-bold text-[var(--color-primary)] tracking-tight">
                            إقرأ
                        </Link>
                    </div>

                    {/* Desktop Navigation (Center-Left) */}
                    <div className="hidden md:flex items-center gap-8">
                        <NavLink to="/" className={navLinkClasses}>الرئيسية</NavLink>
                        <NavLink to="/books" className={navLinkClasses}>المكتبة</NavLink>
                        <NavLink to="/events" className={navLinkClasses}>فعاليات</NavLink>
                        <NavLink to="/blog" className={navLinkClasses}>مدونة</NavLink>

                        {/* Search Icon (Desktop) */}
                        <button
                            onClick={() => {
                                const searchInput = document.querySelector('input[type="text"]');
                                if (searchInput) {
                                    searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    searchInput.focus();
                                } else {
                                    window.location.href = '/#/books'; // Fallback to library if no search input found (e.g. on other pages)
                                }
                            }}
                            className="p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-background)] transition-all"
                            title="بحث"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                    </div>

                    {/* User Menu (Left) */}
                    <div className="hidden md:flex items-center gap-6">
                        {user ? (
                            <div className="flex items-center gap-4">
                                {user.isAdmin && (
                                    <NavLink to="/admin" className="text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] uppercase tracking-wider">
                                        لوحة التحكم
                                    </NavLink>
                                )}
                                <NavLink to={`/profile/${user.id}`} className="flex items-center gap-3 group">
                                    <div className="text-right hidden lg:block">
                                        <div className="text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">{user.username}</div>
                                        <div className="text-xs text-[var(--color-text-muted)]">قارئ نهم</div>
                                    </div>
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-[var(--color-secondary)] transition-colors" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] flex items-center justify-center font-bold">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </NavLink>
                                <button
                                    onClick={logout}
                                    className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                                    title="خروج"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <NavLink to="/login" className="text-sm font-bold text-[var(--color-text)] hover:text-[var(--color-primary)]">دخول</NavLink>
                                <Link to="/register" className="bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-[var(--color-primary)]/20 transition-all hover:-translate-y-0.5">
                                    حساب جديد
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Icon (Replaced structure in App layout, mostly hidden here as BottomNav takes over, 
                        but we might want a minimal top bar for mobile explicitly in App or here? 
                        The prompt says "Header: Minimalist...". 
                        Usually mobile has a top bar for Logo + Notification/Settings while Nav is bottom.
                        I will keep a minimal logo for mobile here.) */}
                    <div className="flex md:hidden w-full justify-center">
                        <Link to="/" className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">
                            إقرأ
                        </Link>
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;
