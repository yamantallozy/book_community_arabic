const express = require('express');
const router = express.Router();
const { getHighlights, addHighlight, toggleHighlightLike } = require('../controllers/highlightController');
const { protect } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.get('/', getHighlights);
router.post('/', protect, upload.single('image'), addHighlight);
router.post('/:id/like', protect, toggleHighlightLike);

module.exports = router;
