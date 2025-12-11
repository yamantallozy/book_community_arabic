import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ShelfControl from './ShelfControl';

const BookDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitError, setSubmitError] = useState('');

    // Review editing state
    const [editingReview, setEditingReview] = useState(null);
    const [editComment, setEditComment] = useState('');
    const [editRating, setEditRating] = useState(5);

    const getAuthHeaders = () => {
        if (user && user.token) {
            return { headers: { Authorization: `Bearer ${user.token}` } };
        }
        return {};
    };

    const fetchReviews = async () => {
        try {
            const reviewRes = await axios.get(`http://localhost:5000/api/reviews/${id}`);
            const reviewsData = reviewRes.data.map(review => {
                const replies = review.Replies || [];
                const replyMap = {};
                const rootReplies = [];

                replies.forEach(r => {
                    r.children = [];
                    replyMap[r.ReplyID] = r;
                });

                replies.forEach(r => {
                    if (r.ParentReplyID && replyMap[r.ParentReplyID]) {
                        replyMap[r.ParentReplyID].children.push(r);
                    } else {
                        rootReplies.push(r);
                    }
                });

                review.rootReplies = rootReplies;
                return review;
            });
            setReviews(reviewsData);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bookRes = await axios.get(`http://localhost:5000/api/books/${id}`);
                setBook(bookRes.data);
                await fetchReviews();
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmitError('');
        if (!user) return alert('You must be logged in to review');

        try {
            await axios.post('http://localhost:5000/api/reviews', {
                bookId: id,
                rating,
                comment
            }, getAuthHeaders());

            await fetchReviews();
            setComment('');
        } catch (err) {
            setSubmitError('Failed to submit review');
            console.error(err);
        }
    };

    const handleEditReview = (review) => {
        setEditingReview(review.ReviewID);
        setEditComment(review.Comment);
        setEditRating(review.Rating);
    };

    const handleSaveReview = async (reviewId) => {
        try {
            await axios.put(`http://localhost:5000/api/reviews/${reviewId}`, {
                rating: editRating,
                comment: editComment
            }, getAuthHeaders());
            setEditingReview(null);
            fetchReviews();
        } catch (err) {
            console.error('Failed to update review', err);
            alert('Failed to update review');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, getAuthHeaders());
            fetchReviews();
        } catch (err) {
            console.error('Failed to delete review', err);
            alert('Failed to delete review');
        }
    };

    const handleDeleteBook = async () => {
        if (!window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) return;
        try {
            await axios.delete(`http://localhost:5000/api/books/${id}`, getAuthHeaders());
            // Redirect to home or book list
            window.location.href = '/';
        } catch (err) {
            console.error('Failed to delete book', err);
            alert('Failed to delete book');
        }
    };

    if (loading) return <div>Loading details...</div>;
    if (!book) return <div>Book not found</div>;

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row gap-8 mb-12">
                <div className="w-full md:w-1/3">
                    {book.CoverImageURL ? (
                        <img src={book.CoverImageURL} alt={book.Title} className="w-full rounded-xl shadow-lg object-cover aspect-[2/3]" />
                    ) : (
                        <div className="w-full aspect-[2/3] bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                            <span className="text-6xl">📚</span>
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h1 className="text-4xl font-bold text-slate-800 mb-2 leading-tight">{book.Title}</h1>
                        {user && user.isAdmin && (
                            <button
                                onClick={handleDeleteBook}
                                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold border border-red-100 hover:bg-red-100 transition-colors"
                            >
                                Delete Book
                            </button>
                        )}
                    </div>
                    <h3 className="text-xl text-slate-500 font-medium mb-6">{book.Author}</h3>

                    <ShelfControl bookId={id} />

                    <div className="mt-8 prose prose-slate text-slate-600 leading-relaxed max-w-none">
                        {book.Description}
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-200 pt-10">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Reviews ({reviews.length})</h2>

                <div className="space-y-6 mb-10">
                    {reviews.length === 0 && (
                        <div className="text-center py-10 bg-slate-50 rounded-xl">
                            <p className="text-slate-500">No reviews yet. Be the first to share your thoughts!</p>
                        </div>
                    )}
                    {reviews.map((review) => (
                        <div key={review.ReviewID} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            {review.IsDeleted ? (
                                <p className="italic text-slate-400">[This review has been deleted]</p>
                            ) : (
                                <>
                                    {editingReview === review.ReviewID ? (
                                        <div className="space-y-4">
                                            <select
                                                value={editRating}
                                                onChange={e => setEditRating(Number(e.target.value))}
                                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                            >
                                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                                            </select>
                                            <textarea
                                                value={editComment}
                                                onChange={e => setEditComment(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 focus:ring-2 focus:ring-primary focus:outline-none"
                                                rows="3"
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleSaveReview(review.ReviewID)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Save</button>
                                                <button onClick={() => setEditingReview(null)} className="text-slate-500 px-4 py-2 text-sm font-medium hover:text-slate-700 transition">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={review.Avatar || 'https://via.placeholder.com/40'}
                                                        alt={review.Username}
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                                    />
                                                    <div>
                                                        <strong className="block text-slate-800 font-bold">{review.Username || `User #${review.UserID}`}</strong>
                                                        <small className="text-slate-400 text-xs">{new Date(review.CreatedAt).toLocaleDateString()}</small>
                                                    </div>
                                                </div>
                                                <span className="text-yellow-400 tracking-widest text-sm">{'★'.repeat(review.Rating)}<span className="text-slate-200">{'★'.repeat(5 - review.Rating)}</span></span>
                                            </div>

                                            <div className="mt-4 ms-14">
                                                <p className="text-slate-700 leading-relaxed">{review.Comment}</p>

                                                <div className="mt-3 flex gap-4">
                                                    {user && !review.IsDeleted && (
                                                        <ReviewReplyForm
                                                            reviewId={review.ReviewID}
                                                            userId={user.id}
                                                            userToken={user.token}
                                                            onReplyAdded={fetchReviews}
                                                            parentReplyId={null}
                                                        />
                                                    )}
                                                    {user && user.id === review.UserID && (
                                                        <button onClick={() => handleEditReview(review)} className="text-slate-400 hover:text-primary text-sm font-medium transition">Edit</button>
                                                    )}
                                                    {user && (user.id === review.UserID || user.isAdmin) && (
                                                        <button onClick={() => handleDeleteReview(review.ReviewID)} className="text-red-300 hover:text-red-500 text-sm font-medium transition">Delete</button>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {review.rootReplies && review.rootReplies.length > 0 && (
                                <div className="mt-6 space-y-4">
                                    {review.rootReplies.map(reply => (
                                        <ReplyNode
                                            key={reply.ReplyID}
                                            reply={reply}
                                            reviewId={review.ReviewID}
                                            user={user}
                                            onRefresh={fetchReviews}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {user && reviews.some(r => r.UserID === user.id && !r.IsDeleted) ? (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
                        <p className="text-slate-600 font-medium">You have already reviewed this book.</p>
                        <p className="text-sm text-slate-400 mt-1">You can edit your existing review above.</p>
                    </div>
                ) : (
                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Write a Review</h3>
                        {user ? (
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                {submitError && <p className="text-red-500 bg-red-50 p-3 rounded-lg text-sm">{submitError}</p>}
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => setRating(num)}
                                                className={`w-10 h-10 rounded-lg font-bold text-lg transition-all ${rating >= num ? 'bg-yellow-400 text-white shadow-md scale-110' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Your Thoughts</label>
                                    <textarea
                                        placeholder="What did you think about this book?"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none transition-all shadow-sm"
                                        rows="4"
                                        required
                                    />
                                </div>
                                <button type="submit" className="bg-primary hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">Submit Review</button>
                            </form>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-slate-500 mb-4">Please login to write a review</p>
                                <a href="/login" className="inline-block bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-50 transition">Login</a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const ReplyNode = ({ reply, reviewId, user, onRefresh }) => {
    const [editing, setEditing] = useState(false);
    const [editComment, setEditComment] = useState(reply.Comment);

    const handleSave = async () => {
        try {
            await axios.put(`http://localhost:5000/api/reviews/reply/${reply.ReplyID}`,
                { comment: editComment },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setEditing(false);
            onRefresh();
        } catch (err) {
            console.error('Failed to update reply', err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete reply?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/reviews/reply/${reply.ReplyID}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            onRefresh();
        } catch (err) {
            console.error('Failed to delete reply', err);
        }
    };

    return (
        <div className="mt-4 ms-6 ps-4 border-s-2 border-slate-200">
            <div className="text-sm">
                <div className="flex items-center gap-2 mb-2">
                    <img
                        src={reply.Avatar || 'https://via.placeholder.com/30'}
                        alt={reply.Username}
                        className="w-6 h-6 rounded-full object-cover"
                    />
                    <strong className="text-slate-700">{reply.Username || `User #${reply.UserID}`}</strong>
                    <span className="text-slate-400 text-xs">• {new Date(reply.CreatedAt).toLocaleDateString()}</span>
                </div>

                {reply.IsDeleted ? (
                    <p className="italic text-slate-400 text-xs">[Deleted]</p>
                ) : (
                    <>
                        {editing ? (
                            <div className="space-y-2">
                                <input
                                    value={editComment}
                                    onChange={e => setEditComment(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 text-sm focus:outline-none focus:border-primary"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button onClick={handleSave} className="text-primary text-xs font-bold hover:underline">Save</button>
                                    <button onClick={() => setEditing(false)} className="text-slate-400 text-xs hover:text-slate-600">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-slate-600">{reply.Comment}</p>
                                <div className="flex gap-3 mt-2">
                                    {user && !editing && (
                                        <ReviewReplyForm
                                            reviewId={reviewId}
                                            userId={user.id}
                                            userToken={user.token}
                                            onReplyAdded={onRefresh}
                                            parentReplyId={reply.ReplyID}
                                        />
                                    )}
                                    {user && user.id === reply.UserID && (
                                        <button onClick={() => setEditing(true)} className="text-slate-400 hover:text-primary text-xs font-medium transition">Edit</button>
                                    )}
                                    {user && (user.id === reply.UserID || user.isAdmin) && (
                                        <button onClick={handleDelete} className="text-slate-400 hover:text-red-400 text-xs font-medium transition">Delete</button>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {reply.children && reply.children.length > 0 && (
                <div className="mt-2">
                    {reply.children.map(child => (
                        <ReplyNode key={child.ReplyID} reply={child} reviewId={reviewId} user={user} onRefresh={onRefresh} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ReviewReplyForm = ({ reviewId, userId, userToken, onReplyAdded, parentReplyId }) => {
    const [reply, setReply] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reply.trim()) return;

        try {
            await axios.post(`http://localhost:5000/api/reviews/${reviewId}/reply`, {
                comment: reply,
                parentReplyId
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setReply('');
            setShowForm(false);
            if (onReplyAdded) onReplyAdded();
        } catch (err) {
            console.error(err);
            alert('Failed to reply');
        }
    };

    if (!showForm) {
        return (
            <button
                onClick={() => setShowForm(true)}
                className="text-primary hover:text-indigo-700 text-xs font-bold transition"
            >
                Reply
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '5px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
                <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write a reply..."
                    style={{ flex: 1, padding: '5px', borderRadius: '4px', border: '1px solid #555', background: '#222', color: '#fff', fontSize: '0.9em' }}
                    autoFocus
                />
                <button type="submit" style={{ padding: '5px 10px', background: '#646cff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}>
                    Post
                </button>
                <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    style={{ background: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer', fontSize: '0.9em' }}
                >
                    ✕
                </button>
            </div>
        </form>
    );
};

export default BookDetails;
