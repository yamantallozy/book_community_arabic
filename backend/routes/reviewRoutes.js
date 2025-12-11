const express = require('express');
const router = express.Router();
const {
    getReviews,
    addReview,
    updateReview,
    deleteReview,
    addReply,
    updateReply,
    deleteReply
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:bookId', getReviews);
router.post('/', protect, addReview);
router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);

router.post('/:reviewId/reply', protect, addReply);
router.put('/reply/:replyId', protect, updateReply);
router.delete('/reply/:replyId', protect, deleteReply);

module.exports = router;
