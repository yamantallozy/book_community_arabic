import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AddBook = () => {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        coverImageURL: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { user, token } = useAuth();

    // Redirect if not admin
    React.useEffect(() => {
        if (user && !user.isAdmin) {
            navigate('/');
        }
    }, [user, navigate]);

    const { title, author, description, coverImageURL } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const response = await axios.post('http://localhost:5000/api/books', formData, config);

            // Redirect to the new book page or home
            navigate(`/books/${response.data.BookID}`);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || 'Failed to add book');
        } finally {
            setLoading(false);
        }
    };

    if (!user || !user.isAdmin) {
        return <div className="text-center py-20">Loading or Unauthorized...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Add New Book</h2>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-600">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={title}
                            onChange={onChange}
                            required
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full"
                            placeholder="Enter book title"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-600">Author</label>
                        <input
                            type="text"
                            name="author"
                            value={author}
                            onChange={onChange}
                            required
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full"
                            placeholder="Enter author name"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-600">Cover Image URL</label>
                        <input
                            type="url"
                            name="coverImageURL"
                            value={coverImageURL}
                            onChange={onChange}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-600">Description</label>
                        <textarea
                            name="description"
                            value={description}
                            onChange={onChange}
                            rows="4"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full resize-none"
                            placeholder="Enter book description"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Adding...' : 'Add Book'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default AddBook;
