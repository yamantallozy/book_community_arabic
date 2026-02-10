import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ShelfControl from './ShelfControl';

const LikeButton = ({ isLiked, likeCount, onClick, styleClass = "" }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 group ${styleClass} ${isLiked ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-red-400'}`}
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isLiked ? 'animate-pulse-once' : ''}`}>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
        </svg>
        <span className={`text-sm font-bold ${isLiked ? 'text-red-500' : 'text-slate-500'}`}>{likeCount || 0}</span>
    </button>
);

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
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!reply.trim() || submitting) return;

        setSubmitting(true);
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
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === 'Escape') {
            setShowForm(false);
        }
    };

    if (!showForm) {
        return (
            <button
                onClick={() => setShowForm(true)}
                className="text-primary hover:text-indigo-700 text-xs font-bold transition flex items-center gap-1"
            >
                <span className="text-lg">↩️</span> رد
            </button>
        );
    }

    return (
        <div className="mt-2 mb-4 animate-fade-in relative">
            <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رداً..."
                className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-slate-700 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                autoFocus
                disabled={submitting}
            />
            {submitting && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="animate-spin block">⏳</span>
                </div>
            )}
            {!submitting && (
                <button
                    onClick={() => setShowForm(false)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                    title="إلغاء (Escape)"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

const BookDetails = () => {
    const { id } = useParams();
    const { user, setShowAuthModal } = useContext(AuthContext); // Added setShowAuthModal
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('reviews');

    const [userReview, setUserReview] = useState(null);
    const [ratingLoading, setRatingLoading] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);
    const [shelfRefreshTrigger, setShelfRefreshTrigger] = useState(0);
    const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'popular'
    const [highlightSortBy, setHighlightSortBy] = useState('newest'); // 'newest' | 'popular'

    const [comment, setComment] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [hlText, setHlText] = useState('');
    const [hlImage, setHlImage] = useState(null);

    const [editingReview, setEditingReview] = useState(null);
    const [editComment, setEditComment] = useState('');
    const [editRating, setEditRating] = useState(5);

    // Pending action state for deferred login
    const [pendingAction, setPendingAction] = useState(null);

    // Effect to retry pending action after login
    useEffect(() => {
        if (user && pendingAction) {
            if (pendingAction.type === 'rate') {
                handleRate(pendingAction.data);
            } else if (pendingAction.type === 'highlight') {
                handleAddHighlight();
            }
            setPendingAction(null);
        }
    }, [user, pendingAction]);

    const getAuthHeaders = () => {
        if (user && user.token) {
            return { headers: { Authorization: `Bearer ${user.token}` } };
        }
        return {};
    };

    const fetchReviews = async () => {
        try {
            // Add timestamp to prevent caching
            const reviewRes = await axios.get(`http://localhost:5000/api/reviews/${id}?t=${new Date().getTime()}`, getAuthHeaders());
            // Note: getAuthHeaders() added above to ensure 'isLiked' is computed for current user

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

            // Client-side Sort
            // (Note: Backend default is Popular-ish, but we enforce explicit sort here)
            // Actually backend returns like stats now.

            setReviews(reviewsData); // We'll sort in render or useEffect, but let's do it in render for simplicity with 'sortBy' state

            if (user) {
                const myReview = reviewsData.find(r => r.UserID == user.id);
                setUserReview(myReview || null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Derived state for sorted reviews
    const getSortedReviews = () => {
        let sorted = [...reviews];
        if (sortBy === 'popular') {
            sorted.sort((a, b) => (b.LikeCount || 0) - (a.LikeCount || 0));
        } else {
            // Newest
            sorted.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
        }

        // Always put user's review at top if exists? Or keep sort order?
        // Let's keep sort order strictly for now to avoid confusion with "sorting".
        // HOWEVER, user might want to see their own review easily.
        // If sorting by newest, usually self review is efficient to find if recent.
        return sorted;
    };

    // Derived state for sorted highlights
    const getSortedHighlights = () => {
        let sorted = [...highlights];
        if (highlightSortBy === 'popular') {
            sorted.sort((a, b) => (b.LikeCount || 0) - (a.LikeCount || 0));
        } else {
            // Newest
            sorted.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
        }
        return sorted;
    };

    const fetchHighlights = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/highlights?bookId=${id}`, getAuthHeaders());
            setHighlights(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBookDetails = async () => {
        try {
            // Add timestamp to prevent caching
            const bookRes = await axios.get(`http://localhost:5000/api/books/${id}?t=${new Date().getTime()}`);
            setBook(bookRes.data);
            console.log('Book Details Updated:', bookRes.data); // Debug
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchBookDetails();
                await Promise.all([fetchReviews(), fetchHighlights()]);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleRate = async (newRating) => {
        if (!user) {
            setPendingAction({ type: 'rate', data: newRating });
            setShowAuthModal(true);
            return;
        }

        // Use the comment from state if provided, otherwise keep existing
        const finalComment = comment.trim() !== '' ? comment : (userReview ? userReview.Comment : '');

        // Optimistic UI Update Start
        const oldRating = userReview ? userReview.Rating : 0;
        const isUpdate = !!userReview;

        // Update local User Review state immediately
        const optimisticReview = {
            ...userReview,
            Rating: newRating,
            UserID: user.id
        };
        setUserReview(optimisticReview);

        // Calculate new Average immediately
        setBook(prevBook => {
            if (!prevBook) return prevBook;

            const currentCount = prevBook.ReviewCount || 0;
            const currentAvg = prevBook.AverageRating || 0;
            const currentSum = currentAvg * currentCount;

            let newCount = currentCount;
            let newSum = currentSum;

            if (isUpdate) {
                // Adjust sum: remove old, add new
                newSum = currentSum - oldRating + newRating;
            } else {
                // Add new rating
                newSum = currentSum + newRating;
                newCount = currentCount + 1;
            }

            // Avoid division by zero
            const newAvg = newCount > 0 ? newSum / newCount : 0;

            return {
                ...prevBook,
                AverageRating: newAvg,
                ReviewCount: newCount
            };
        });
        // Optimistic UI Update End

        setRatingLoading(true);
        try {
            if (isUpdate) {
                await axios.put(`http://localhost:5000/api/reviews/${userReview.ReviewID}`, {
                    rating: newRating,
                    comment: finalComment
                }, getAuthHeaders());
            } else {
                await axios.post('http://localhost:5000/api/reviews', {
                    bookId: id,
                    rating: newRating,
                    comment: finalComment
                }, getAuthHeaders());
            }

            try {
                // Auto-shelf
                await axios.post('http://localhost:5000/api/shelves', {
                    bookId: id,
                    status: 'Read'
                }, getAuthHeaders());
                setShelfRefreshTrigger(prev => prev + 1);
            } catch (shelfErr) {
                console.error('Failed to auto-update shelf', shelfErr);
            }

            // Sync in background (no await blocking UI)
            fetchReviews();
            fetchBookDetails();
        } catch (err) {
            console.error(err);
            alert('فشل التقييم');
            // Revert on failure (optional but good practice, keeping simple for now)
        } finally {
            setRatingLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        // ... (kept for completeness if we re-enable standard form, but currently unused in UI)
    };

    const handleAddHighlight = async (e) => {
        if (e) e.preventDefault();

        if (!user) {
            setPendingAction({ type: 'highlight' });
            setShowAuthModal(true);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('bookId', id);
            formData.append('textContent', hlText);
            if (hlImage) {
                formData.append('image', hlImage);
            }

            const config = getAuthHeaders();
            await axios.post('http://localhost:5000/api/highlights', formData, config);

            setHlText('');
            setHlImage(null);
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

    const handleToggleLike = async (itemId, type) => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        const endpoint = type === 'review' ? `reviews/${itemId}/like` : `highlights/${itemId}/like`;

        // Optimistic Update
        const targetList = type === 'review' ? reviews : highlights;
        const setTargetList = type === 'review' ? setReviews : setHighlights;
        const idKey = type === 'review' ? 'ReviewID' : 'HighlightID';

        const originalList = [...targetList];

        setTargetList(prev => prev.map(item => {
            if (item[idKey] === itemId) {
                const isLiked = !!item.IsLiked; // Use double bang to ensure boolean 
                return {
                    ...item,
                    IsLiked: !isLiked,
                    LikeCount: (item.LikeCount || 0) + (isLiked ? -1 : 1)
                };
            }
            return item;
        }));

        try {
            await axios.post(`http://localhost:5000/api/${endpoint}`, {}, getAuthHeaders());
            // No need to re-fetch immediately if optimistic update is correct, 
            // but fetching ensures consistency eventually. 
            // Let's rely on optimistic for snappy feel.
        } catch (err) {
            console.error(err);
            // Revert on error
            setTargetList(originalList);
        }
    };

    const handleDeleteBook = async () => {
        if (!window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) return;
        try {
            await axios.delete(`http://localhost:5000/api/books/${id}`, getAuthHeaders());
            window.location.href = '/';
        } catch (err) {
            console.error('Failed to delete book', err);
            alert('Failed to delete book');
        }
    };

    if (loading) return <div>Loading details...</div>;
    if (!book) return <div>Book not found</div>;

    // Calculate rating stats
    // Calculate rating stats from reviews if available to ensure consistency
    const calculatedAvg = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.Rating, 0) / reviews.length
        : (book.AverageRating || 0);

    const calculatedCount = reviews.length > 0 ? reviews.length : (book.ReviewCount || 0);

    const avgRating = calculatedAvg;
    const reviewCount = calculatedCount;

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">

            {/* HERO CARD */}
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-lg border border-slate-100 p-8 mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-2 bg-primary/10"></div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">

                    {/* LEFT COLUMN (Cover) - Styled Card around Image */}
                    <div className="md:col-span-4 order-last md:order-first relative group">
                        <div className="rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 md:group-hover:-translate-y-2 border border-slate-200 bg-white p-1.5">
                            {book.CoverImageURL ? (
                                <img src={book.CoverImageURL} alt={book.Title} className="w-full h-auto object-cover rounded-xl aspect-[2/3]" />
                            ) : (
                                <div className="w-full aspect-[2/3] bg-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                                    <span className="text-6xl">📚</span>
                                </div>
                            )}
                        </div>

                        {/* Metadata Sidebar */}
                        <div className="mt-6 space-y-4 text-sm bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                                <div>
                                    <span className="block text-slate-400 text-xs mb-1">الصفحات</span>
                                    <span className="font-bold text-slate-700">{book.PageCount || '--'}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-400 text-xs mb-1">سنة النشر</span>
                                    <span className="font-bold text-slate-700">{book.PublicationYear || '--'}</span>
                                </div>
                                {book.OriginalLanguage && (
                                    <div className="col-span-2">
                                        <span className="block text-slate-400 text-xs mb-1">اللغة الأصلية</span>
                                        <span className="font-bold text-slate-700">{book.OriginalLanguage}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 pt-2">
                                {book.Translator && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">المترجم</span>
                                        <span className="font-medium text-slate-800">{book.Translator}</span>
                                    </div>
                                )}
                                {book.Publisher && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">الناشر</span>
                                        <span className="font-medium text-slate-800">{book.Publisher}</span>
                                    </div>
                                )}
                                {book.ISBN && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">ISBN</span>
                                        <span className="font-mono text-xs text-slate-600 block pt-1">{book.ISBN}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (Info) */}
                    <div className="md:col-span-8 flex flex-col items-start gap-4">

                        {/* Title & Metadata */}
                        <div>
                            {/* Genre Chip */}
                            {/* Category & Genre Chips */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {book.CategoryNameAr && (
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                                        {book.CategoryNameAr}
                                    </span>
                                )}
                                {book.Subgenres && book.Subgenres.length > 0 && book.Subgenres.map((sub, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
                                        {sub}
                                    </span>
                                ))}
                                {book.Tags && book.Tags.length > 0 && book.Tags.map((tag, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-5xl font-extrabold text-slate-800 leading-tight mb-2 tracking-tight">{book.Title}</h1>
                            <h2 className="text-2xl text-slate-500 font-medium">بواسطة <span className="text-slate-800 underline decoration-slate-300 decoration-2 underline-offset-4 cursor-pointer hover:text-primary transition-colors">{book.Author}</span></h2>
                        </div>

                        {/* Interactive Area */}
                        <div className="flex flex-wrap items-center gap-6 mt-4 w-full">

                            {/* Shelf Dropdown (Pill) */}
                            <ShelfControl key={shelfRefreshTrigger} bookId={id} />

                            {/* Divider */}
                            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

                            {/* Ratings Block */}
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <div className="text-yellow-400 text-xl font-bold flex gap-1" dir="ltr">
                                        {'★'.repeat(Math.round(avgRating))}
                                        <span className="text-slate-200">{'★'.repeat(5 - Math.round(avgRating))}</span>
                                    </div>
                                    <span className="text-slate-700 font-bold text-lg">{avgRating.toFixed(1)}</span>
                                    <span className="text-slate-400 text-xs font-medium">({reviewCount} مراجعة)</span>
                                </div>
                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                    <span>التقييم العام</span>
                                </div>
                            </div>
                        </div>

                        {/* User Rating Prompt */}
                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 w-full mt-4 flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <span className="text-slate-700 font-bold flex items-center gap-2">
                                    <span className="text-xl">✨</span> قيّم هذا الكتاب:
                                </span>

                                <div className="flex items-center gap-3">
                                    <div className="flex px-2" dir="ltr" onMouseLeave={() => setHoverRating(0)}>
                                        {[1, 2, 3, 4, 5].map(star => {
                                            const currentVal = hoverRating || (userReview ? userReview.Rating : 0);
                                            const isFilled = currentVal >= star;
                                            return (
                                                <button
                                                    key={star}
                                                    onClick={() => handleRate(star)}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    disabled={ratingLoading}
                                                    className={`text-3xl transition-transform duration-200 px-1 transform hover:scale-125 focus:outline-none ${isFilled ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200'}`}
                                                    title={`${star} من 5`}
                                                >
                                                    ★
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {userReview && (
                                        <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                                            تم التقييم: {userReview.Rating}/5
                                        </span>
                                    )}
                                </div>
                            </div>


                        </div>

                        {/* Description */}
                        <div className="mt-8 prose prose-lg prose-slate text-slate-600 leading-8 max-w-none">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">نبذة عن الكتاب</h3>
                            {book.Description}
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT TABS */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">

                {/* Tabs Header */}
                <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 pt-4 gap-8">
                    <button
                        className={`pb-4 px-2 font-bold text-lg transition-all border-b-[3px] flex items-center gap-2 ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        <span>المراجعات</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'reviews' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}>
                            {reviews.filter(r => r.Comment && r.Comment.trim() !== '').length}
                        </span>
                    </button>
                    <button
                        className={`pb-4 px-2 font-bold text-lg transition-all border-b-[3px] flex items-center gap-2 ${activeTab === 'highlights' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('highlights')}
                    >
                        <span>المقتطفات</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'highlights' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}>
                            {highlights.length}
                        </span>
                    </button>
                </div>

                <div className="p-8">
                    {/* Reviews Content */}
                    {activeTab === 'reviews' && (
                        <>
                            <div className="flex justify-end mb-6">
                                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                                    <button
                                        onClick={() => setSortBy('newest')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${sortBy === 'newest' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        الأحدث
                                    </button>
                                    <button
                                        onClick={() => setSortBy('popular')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${sortBy === 'popular' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        الأكثر إعجاباً
                                    </button>
                                </div>
                            </div>
                            {/* Write Review Section - Always visible now */}
                            {(!user || (!userReview || !userReview.Comment || userReview.Comment.trim() === '')) && (
                                <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-200 shadow-sm animate-fade-in">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                                {(userReview && userReview.Comment) ? '🖊️ تحديث مراجعتك' : '✍️ اكتب مراجعة'}
                                            </h3>
                                            <div className="flex items-center gap-1" dir="ltr" onMouseLeave={() => setHoverRating(0)}>
                                                {[1, 2, 3, 4, 5].map(star => {
                                                    const currentVal = hoverRating || (userReview ? userReview.Rating : 0);
                                                    const isFilled = currentVal >= star;
                                                    return (
                                                        <button
                                                            key={star}
                                                            onClick={() => handleRate(star)}
                                                            onMouseEnter={() => setHoverRating(star)}
                                                            disabled={ratingLoading}
                                                            className={`text-2xl transition-transform duration-200 px-0.5 transform hover:scale-110 focus:outline-none ${isFilled ? 'text-amber-400' : 'text-slate-300'}`}
                                                            title={`${star} من 5`}
                                                        >
                                                            ★
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="ما الذي أعجبك أو لم يعجبك؟ صف تجربتك مع هذا الكتاب..."
                                            className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all resize-none min-h-[120px]"
                                        />

                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleRate(userReview ? userReview.Rating : (hoverRating || 0))}
                                                disabled={!comment.trim() || ((!userReview && hoverRating === 0) && !ratingLoading)}
                                                className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                                            >
                                                {ratingLoading ? (
                                                    <span className="animate-spin">⏳</span>
                                                ) : (
                                                    <span>{(userReview && userReview.Comment) ? 'تحديث' : 'نشر'}</span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                {reviews.filter(r => r.Comment && r.Comment.trim() !== '').length === 0 && (
                                    <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <span className="text-4xl block mb-4">💬</span>
                                        <p className="text-slate-500 font-medium">لا توجد مراجعات مكتوبة بعد. كن أول من يكتب رأيه!</p>
                                    </div>
                                )}
                                {getSortedReviews()
                                    .filter(review => review.Comment && review.Comment.trim() !== '')
                                    .map((review) => (
                                        <div key={review.ReviewID} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-slate-200 transition-colors">
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
                                                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                                    />
                                                                    <div>
                                                                        <strong className="block text-slate-800 font-bold text-lg">{review.Username || `مستخدم #${review.UserID}`}</strong>
                                                                        <small className="text-slate-400 text-xs font-medium">{new Date(review.CreatedAt).toLocaleDateString()}</small>
                                                                    </div>
                                                                </div>
                                                                <span className="text-amber-400 tracking-widest text-sm flex gap-0.5">{'★'.repeat(review.Rating)}<span className="text-slate-200">{'★'.repeat(5 - review.Rating)}</span></span>
                                                            </div>

                                                            <div className="mt-4 ms-16">
                                                                <p className="text-slate-700 leading-relaxed text-lg">{review.Comment}</p>

                                                                <div className="flex items-center gap-4">
                                                                    <LikeButton
                                                                        isLiked={review.IsLiked}
                                                                        likeCount={review.LikeCount}
                                                                        onClick={() => handleToggleLike(review.ReviewID, 'review')}
                                                                    />
                                                                    {user && !review.IsDeleted && (
                                                                        <ReviewReplyForm
                                                                            reviewId={review.ReviewID}
                                                                            userId={user.id}
                                                                            userToken={user.token}
                                                                            onReplyAdded={fetchReviews}
                                                                            parentReplyId={null}
                                                                        />
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center gap-3">
                                                                    {user && user.id === review.UserID && (
                                                                        <button onClick={() => handleEditReview(review)} className="text-slate-400 hover:text-primary text-xs font-bold transition flex items-center gap-1">
                                                                            <span>✏️</span> تعديل
                                                                        </button>
                                                                    )}
                                                                    {user && (user.id === review.UserID || user.isAdmin) && (
                                                                        <button onClick={() => handleDeleteReview(review.ReviewID)} className="text-slate-400 hover:text-red-500 text-xs font-bold transition flex items-center gap-1">
                                                                            <span>🗑️</span> حذف
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}

                                                    {review.rootReplies && review.rootReplies.length > 0 && (
                                                        <div className="mt-6 space-y-4 bg-slate-50 p-6 rounded-xl">
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
                                                </>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </>
                    )}

                    {/* Highlights Content */}
                    {activeTab === 'highlights' && (
                        <div className="space-y-8">

                            <div className="flex justify-end mb-6">
                                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                                    <button
                                        onClick={() => setHighlightSortBy('newest')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${highlightSortBy === 'newest' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        الأحدث
                                    </button>
                                    <button
                                        onClick={() => setHighlightSortBy('popular')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${highlightSortBy === 'popular' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        الأكثر إعجاباً
                                    </button>
                                </div>
                            </div>

                            {/* Always show form, prompt login on submit */}
                            <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-200 shadow-sm animate-fade-in">
                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
                                    <span className="text-xl">✨</span> شارك مقتطفاً مميزاً
                                </h3>
                                <form onSubmit={handleAddHighlight} className="relative flex flex-col gap-4">
                                    <div className="relative">
                                        <textarea
                                            value={hlText}
                                            onChange={e => setHlText(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all resize-none min-h-[120px]"
                                            placeholder="اكتب الاقتباس هنا..."
                                        />

                                        {hlImage && (
                                            <div className="absolute bottom-4 left-4 z-10">
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
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <input
                                                type="file"
                                                id="file-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => setHlImage(e.target.files[0])}
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className="flex items-center gap-2 p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg cursor-pointer transition-all text-sm font-medium"
                                                title="أرفق صورة"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                                </svg>
                                                <span className="hidden sm:inline">صورة</span>
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            className={`bg-primary text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2`}
                                            disabled={!hlText.trim() && !hlImage}
                                        >
                                            <span className={!user?.dir || user.dir === 'rtl' ? 'rotate-180' : ''}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                                </svg>
                                            </span>
                                            <span>نشر</span>
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {highlights.length === 0 ? (
                                <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <span className="text-4xl block mb-4">✨</span>
                                    <p className="text-slate-500 font-medium">لا توجد مقتطفات لهذا الكتاب بعد. كن أول من يشارك!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {getSortedHighlights().map(hl => (
                                        <div key={hl.HighlightID} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
                                            <div className="flex-shrink-0">
                                                <img src={hl.Avatar || 'https://via.placeholder.com/40'} alt={hl.Username} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <strong className="text-slate-800 text-sm block">{hl.Username}</strong>
                                                        <span className="text-slate-400 text-xs">{new Date(hl.CreatedAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <LikeButton
                                                        isLiked={hl.IsLiked}
                                                        likeCount={hl.LikeCount}
                                                        onClick={() => handleToggleLike(hl.HighlightID, 'highlight')}
                                                    />
                                                </div>
                                                {hl.TextContent && (
                                                    <p className="text-slate-700 italic text-lg mb-4 font-serif bg-slate-50 p-4 rounded-xl border-r-4 border-indigo-200">"{hl.TextContent}"</p>
                                                )}
                                                {hl.ImageURL && (
                                                    <img src={hl.ImageURL} alt="Highlight" className="rounded-xl max-h-80 object-cover shadow-sm w-full" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default BookDetails;
