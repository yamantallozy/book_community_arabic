import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const ShelfControl = ({ bookId }) => {
    const { user } = useContext(AuthContext);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const STATUS_OPTIONS = [
        { value: 'WantToRead', label: 'أريد قراءته', color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100', icon: '🔖' },
        { value: 'CurrentlyReading', label: 'أقرأه حالياً', color: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100', icon: '📖' },
        { value: 'Read', label: 'قرأته', color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100', icon: '✅' }
    ];

    const STATUS_LABELS = {
        'None': 'أضف إلى المكتبة',
        'WantToRead': 'أريد قراءته',
        'CurrentlyReading': 'أقرأه حالياً',
        'Read': 'قرأته'
    };

    useEffect(() => {
        // Click outside to close
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchStatus = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/shelves/book/${bookId}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setStatus(res.data.status || 'None');
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch shelf status', err);
                setLoading(false);
            }
        };

        fetchStatus();
    }, [bookId, user]);

    const handleSelect = async (newStatus) => {
        if (!user) return alert('يرجى تسجيل الدخول لإضافة الكتب');

        // Optimistic update
        const prevStatus = status;
        setStatus(newStatus);
        setIsOpen(false);

        try {
            await axios.post('http://localhost:5000/api/shelves', {
                bookId,
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
        } catch (err) {
            console.error('Failed to update shelf', err);
            setStatus(prevStatus); // Revert on error
            alert('فشل تحديث الرف');
        }
    };

    if (loading) return <div className="h-10 w-32 bg-slate-100 rounded-xl animate-pulse"></div>;
    if (!user) return null;

    const currentOption = STATUS_OPTIONS.find(opt => opt.value === status);

    // Base style for the main button
    const getButtonStyles = () => {
        if (status === 'None' || !status) return 'bg-slate-800 text-white border-transparent hover:bg-slate-700 shadow-md transform hover:-translate-y-0.5';
        return `${currentOption?.color || 'bg-white text-slate-700 border-slate-200'}`;
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold border transition-all duration-200 ${getButtonStyles()}`}
            >
                <span className="text-lg">{currentOption?.icon || '📚'}</span>
                <span>{STATUS_LABELS[status] || STATUS_LABELS['None']}</span>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Mobile Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-[1px]"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown / Bottom Sheet */}
                    <div className="
                        fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl rounded-t-3xl border-t border-slate-100 p-2 pb-safe animate-slide-up-mobile
                        md:absolute md:top-full md:bottom-auto md:w-64 md:rounded-2xl md:shadow-xl md:border md:ltr:left-0 md:rtl:right-0 md:mt-3 md:animate-none
                    ">

                        {/* Mobile Handle */}
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-2 md:hidden" />

                        <div className="flex flex-col md:block p-2 md:p-0">
                            {STATUS_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`
                                        group flex w-full items-center gap-4 px-4 py-3.5 mb-1 text-sm font-bold rounded-xl transition-all
                                        ${status === option.value
                                            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }
                                    `}
                                >
                                    <span className="text-xl">{option.icon}</span>
                                    <span>{option.label}</span>
                                    {status === option.value && (
                                        <div className="mr-auto bg-[var(--color-primary)] text-white rounded-full p-0.5">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                        </div>
                                    )}
                                </button>
                            ))}

                            {status !== 'None' && (
                                <>
                                    <div className="h-px bg-slate-100 my-1"></div>
                                    <button
                                        onClick={() => handleSelect('None')}
                                        className="w-full text-start px-4 py-3.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-4"
                                    >
                                        <span className="text-xl">🗑️</span>
                                        <span>إزالة من المكتبة</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ShelfControl;
