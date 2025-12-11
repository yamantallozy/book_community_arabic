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

    if (!user) return <div style={{ padding: '20px' }}>Please login to view your books.</div>;
    if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

    const groupBooks = (status) => books.filter(b => b.Status === status);

    const ShelfSection = ({ title, items }) => (
        <div style={{ marginBottom: '40px' }}>
            <h2 style={{ borderBottom: '1px solid #444', paddingBottom: '10px' }}>{title} ({items.length})</h2>
            {items.length === 0 ? (
                <p style={{ color: '#888' }}>No books in this shelf.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px', marginTop: '15px' }}>
                    {items.map(book => (
                        <Link to={`/books/${book.BookID}`} key={book.BookID} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ background: '#222', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                {book.CoverImageURL && <img src={book.CoverImageURL} alt={book.Title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />}
                                <h4 style={{ margin: '10px 0 5px', fontSize: '1rem' }}>{book.Title}</h4>
                                <p style={{ margin: '0', fontSize: '0.8rem', color: '#aaa' }}>{book.Author}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '30px' }}>My Books</h1>

            <ShelfSection title="Currently Reading" items={groupBooks('CurrentlyReading')} />
            <ShelfSection title="Want to Read" items={groupBooks('WantToRead')} />
            <ShelfSection title="Read" items={groupBooks('Read')} />
        </div>
    );
};

export default MyBooks;
