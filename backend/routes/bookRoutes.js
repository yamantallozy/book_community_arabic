const express = require('express');
const router = express.Router();
const { getBooks, getBookById, createBook, deleteBook, getBookDebug } = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getBooks);
router.get('/:id', getBookById);
router.get('/:id/debug', getBookDebug);
router.post('/', protect, async (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ msg: 'Not authorized as admin' });
    }
}, createBook);

router.delete('/:id', protect, async (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ msg: 'Not authorized as admin' });
    }
}, deleteBook);

module.exports = router;
