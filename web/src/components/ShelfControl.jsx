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
                <div className="absolute ltr:left-0 rtl:right-0 mt-2 w-56 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden text-right border border-slate-100">
                    <div className="py-1">
                        {STATUS_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`group flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${status === option.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
                            >
                                <span className="text-lg">{option.icon}</span>
                                {option.label}
                                {status === option.value && (
                                    <span className="mr-auto text-indigo-600">✓</span>
                                )}
                            </button>
                        ))}
                        {status !== 'None' && (
                            <button
                                onClick={() => handleSelect('None')}
                                className="w-full text-start px-4 py-3 text-sm text-red-500 hover:bg-red-50 border-t border-slate-50 transition-colors flex items-center gap-3 font-medium"
                            >
                                <span>🗑️</span> إزالة من المكتبة
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShelfControl;
