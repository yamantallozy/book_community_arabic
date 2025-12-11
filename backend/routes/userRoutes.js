const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, promoteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/:id', getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);
router.put('/promote', protect, async (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ msg: 'Not authorized as admin' });
    }
}, promoteUser);

module.exports = router;
