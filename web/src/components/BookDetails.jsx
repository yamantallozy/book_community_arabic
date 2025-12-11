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
    const [highlights, setHighlights] = useState([]); // Highlights state
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('reviews'); // Tab state

    // Review Form
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitError, setSubmitError] = useState('');

    // Highlight Form
    const [hlText, setHlText] = useState('');
    const [hlImage, setHlImage] = useState(null);

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
            const reviewsData = reviewRes.data
                .filter(r => !r.IsDeleted)
                .map(review => {
                    const replies = (review.Replies || []).filter(r => !r.IsDeleted);
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

    const fetchHighlights = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/highlights?bookId=${id}`);
            setHighlights(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bookRes = await axios.get(`http://localhost:5000/api/books/${id}`);
                setBook(bookRes.data);
                await Promise.all([fetchReviews(), fetchHighlights()]);
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

    const handleAddHighlight = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            const formData = new FormData();
            formData.append('bookId', id);
            formData.append('textContent', hlText);
            if (hlImage) {
                formData.append('image', hlImage);
            }

            // Custom header not needed for FormData, axios handles it, 
            // but we need auth header. getAuthHeaders returns an object { headers: { Authorization: ... } }
            // We need to merge that or pass it correctly.
            const config = getAuthHeaders();
            // Do NOT manually set Content-Type for FormData, axios will set it with boundary

            await axios.post('http://localhost:5000/api/highlights', formData, config);

            setHlText('');
            setHlImage(null); // Reset to null for file
            fetchHighlights();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.msg || 'فشل إضافة المقتطف';
            alert(msg);
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
                                حذف الكتاب
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

                {/* Tabs */}
                <div className="flex border-b border-slate-200 mb-6">
                    <button
                        className={`pb-4 px-6 font-bold text-lg transition-colors border-b-2 ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        التقييمات ({reviews.length})
                    </button>
                    <button
                        className={`pb-4 px-6 font-bold text-lg transition-colors border-b-2 ${activeTab === 'highlights' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('highlights')}
                    >
                        مقتطفات ({highlights.length})
                    </button>
                </div>

                {/* Reviews Content */}
                {activeTab === 'reviews' && (
                    <>
                        <div className="space-y-6 mb-10">
                            {reviews.length === 0 && (
                                <div className="text-center py-10 bg-slate-50 rounded-xl">
                                    <p className="text-slate-500">لا توجد تقييمات بعد. كن أول من يشارك رأيه!</p>
                                </div>
                            )}
                            {reviews.map((review) => (
                                <div key={review.ReviewID} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    {review.IsDeleted ? (
                                        <p className="italic text-slate-400">[تم حذف هذا التقييم]</p>
                                    ) : (
                                        <>
                                            {editingReview === review.ReviewID ? (
                                                <div className="space-y-4">
                                                    <select
                                                        value={editRating}
                                                        onChange={e => setEditRating(Number(e.target.value))}
                                                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                                    >
                                                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} نجوم</option>)}
                                                    </select>
                                                    <textarea
                                                        value={editComment}
                                                        onChange={e => setEditComment(e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 focus:ring-2 focus:ring-primary focus:outline-none"
                                                        rows="3"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleSaveReview(review.ReviewID)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">حفظ</button>
                                                        <button onClick={() => setEditingReview(null)} className="text-slate-500 px-4 py-2 text-sm font-medium hover:text-slate-700 transition">إلغاء</button>
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
                                                                <strong className="block text-slate-800 font-bold">{review.Username || `مستخدم #${review.UserID}`}</strong>
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
                                                                <button onClick={() => handleEditReview(review)} className="text-slate-400 hover:text-primary text-sm font-medium transition">تعديل</button>
                                                            )}
                                                            {user && (user.id === review.UserID || user.isAdmin) && (
                                                                <button onClick={() => handleDeleteReview(review.ReviewID)} className="text-red-300 hover:text-red-500 text-sm font-medium transition">حذف</button>
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
                                <p className="text-slate-600 font-medium">لقد قمت بتقييم هذا الكتاب مسبقاً.</p>
                                <p className="text-sm text-slate-400 mt-1">يمكنك تعديل تقييمك أعلاه.</p>
                            </div>
                        ) : (
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
                                <h3 className="text-xl font-bold text-slate-800 mb-6">أضف تقييمك</h3>
                                {user ? (
                                    <form onSubmit={handleSubmitReview} className="space-y-4">
                                        {submitError && <p className="text-red-500 bg-red-50 p-3 rounded-lg text-sm">{submitError}</p>}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-2">التقييم</label>
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
                                            <label className="block text-sm font-medium text-slate-600 mb-2">رأيك</label>
                                            <textarea
                                                placeholder="ما هو رأيك في هذا الكتاب؟"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none transition-all shadow-sm"
                                                rows="4"
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="bg-primary hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">نشر التقييم</button>
                                    </form>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-slate-500 mb-4">يرجى تسجيل الدخول لكتابة تقييم</p>
                                        <a href="/login" className="inline-block bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-50 transition">تسجيل الدخول</a>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Highlights Content */}
                {activeTab === 'highlights' && (
                    <div className="space-y-8">
                        {user ? (
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 mb-10 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span className="text-2xl">✨</span> شارك مقتطفاً مميزاً
                                </h3>
                                <form onSubmit={handleAddHighlight} className="relative">
                                    <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-purple-500 transition-all overflow-hidden">
                                        <textarea
                                            value={hlText}
                                            onChange={e => setHlText(e.target.value)}
                                            className="w-full p-4 pb-14 border-none resize-none focus:ring-0 text-lg text-slate-700 min-h-[120px] bg-transparent"
                                            placeholder="اكتب الاقتباس هنا..."
                                        />

                                        {/* Image Preview */}
                                        {hlImage && (
                                            <div className="absolute bottom-16 right-4 z-10">
                                                <div className="relative group">
                                                    <img
                                                        src={URL.createObjectURL(hlImage)}
                                                        alt="Preview"
                                                        className="h-16 w-16 object-cover rounded-lg border border-slate-200 shadow-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setHlImage(null)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-slate-50/80 p-1.5 rounded-xl backdrop-blur-sm">
                                            <input
                                                type="file"
                                                id="file-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => setHlImage(e.target.files[0])}
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg cursor-pointer transition-all"
                                                title="أرفق صورة"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                                </svg>
                                            </label>
                                            <button
                                                type="submit"
                                                className={`p-2 rounded-lg transition-all ${hlText.trim() || hlImage ? 'bg-primary text-white shadow-md hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                                disabled={!hlText.trim() && !hlImage}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={!user?.dir || user.dir === 'rtl' ? 'rotate-180' : ''}>
                                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 mb-10">
                                <h3 className="text-xl font-bold text-slate-800 mb-6">شارك مقتطفاً</h3>
                                <div className="text-center py-6">
                                    <p className="text-slate-500 mb-4">هل لديك اقتباس مفضل من هذا الكتاب؟</p>
                                    <a href="/login" className="inline-block bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-50 transition">سجل دخولك للمشاركة</a>
                                </div>
                            </div>
                        )}

                        {highlights.length === 0 ? (
                            <p className="text-center text-slate-500 py-10">لا توجد مقتطفات لهذا الكتاب بعد.</p>
                        ) : (
                            highlights.map(hl => (
                                <div key={hl.HighlightID} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img src={hl.Avatar || 'https://via.placeholder.com/40'} alt={hl.Username} className="w-10 h-10 rounded-full border border-slate-200" />
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">{hl.Username}</h4>
                                            <p className="text-xs text-slate-400">{new Date(hl.CreatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <blockquote className="text-xl font-serif text-slate-700 leading-relaxed border-s-4 border-purple-300 ps-4 italic bg-slate-50 py-2 rounded-e-lg mb-4">
                                        "{hl.TextContent}"
                                    </blockquote>

                                    {hl.ImageURL && (
                                        <img src={hl.ImageURL} alt="Highlight visual" className="w-full h-64 object-cover rounded-lg" />
                                    )}
                                </div>
                            ))
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
        if (!window.confirm('حذف الرد؟')) return;
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
                    <strong className="text-slate-700">{reply.Username || `مستخدم #${reply.UserID}`}</strong>
                    <span className="text-slate-400 text-xs">• {new Date(reply.CreatedAt).toLocaleDateString()}</span>
                </div>

                {reply.IsDeleted ? (
                    <p className="italic text-slate-400 text-xs">[محذوف]</p>
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
                                    <button onClick={handleSave} className="text-primary text-xs font-bold hover:underline">حفظ</button>
                                    <button onClick={() => setEditing(false)} className="text-slate-400 text-xs hover:text-slate-600">إلغاء</button>
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
                                        <button onClick={() => setEditing(true)} className="text-slate-400 hover:text-primary text-xs font-medium transition">تعديل</button>
                                    )}
                                    {user && (user.id === reply.UserID || user.isAdmin) && (
                                        <button onClick={handleDelete} className="text-slate-400 hover:text-red-400 text-xs font-medium transition">حذف</button>
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
            alert('فشل إضافة الرد');
        }
    };

    if (!showForm) {
        return (
            <button
                onClick={() => setShowForm(true)}
                className="text-primary hover:text-indigo-700 text-xs font-bold transition"
            >
                رد
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
