const express = require('express');
const router = express.Router();
const { updateShelf, getUserShelf, getBookShelfStatus } = require('../controllers/shelfController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, updateShelf);
router.get('/user/:userId', getUserShelf);
router.get('/book/:bookId', protect, getBookShelfStatus);

module.exports = router;
