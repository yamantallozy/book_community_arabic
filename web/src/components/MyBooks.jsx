import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const MyBooks = () => {
    const { user } = useContext(AuthContext);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShelf = async () => {
            if (!user) return;
            try {
                const res = await axios.get(`http://localhost:5000/api/shelves/user/${user.id}`);
                setBooks(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchShelf();
    }, [user]);

    if (!user) return <div style={{ padding: '20px' }}>يرجى تسجيل الدخول لعرض كتبك.</div>;
    if (loading) return <div style={{ padding: '20px' }}>جارِ التحميل...</div>;

    const groupBooks = (status) => books.filter(b => b.Status === status);

    const ShelfSection = ({ title, items }) => (
        <div className="mb-10">
            <h2 className="border-b border-[#444] pb-2 text-xl font-bold mb-4">{title} ({items.length})</h2>
            {items.length === 0 ? (
                <p className="text-gray-500">لا توجد كتب في هذا الرف.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {items.map(book => (
                        <Link to={`/books/${book.BookID}`} key={book.BookID} className="no-underline text-inherit block">
                            <div className="bg-[#222] p-3 rounded-lg text-center hover:bg-[#2a2a2a] transition-colors h-full">
                                {book.CoverImageURL ? (
                                    <img src={book.CoverImageURL} alt={book.Title} className="w-full h-48 object-cover rounded mb-2" />
                                ) : (
                                    <div className="w-full h-48 bg-slate-700 rounded mb-2 flex items-center justify-center text-slate-400 text-xs">No Image</div>
                                )}
                                <h4 className="text-base font-bold text-white line-clamp-2">{book.Title}</h4>
                                <p className="text-sm text-gray-400 mt-1 line-clamp-1">{book.Author}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8 text-slate-800">كتبي</h1>

            <ShelfSection title="أقرأه حالياً" items={groupBooks('CurrentlyReading')} />
            <ShelfSection title="أريد قراءته" items={groupBooks('WantToRead')} />
            <ShelfSection title="قرأته" items={groupBooks('Read')} />
        </div>
    );
};

export default MyBooks;
