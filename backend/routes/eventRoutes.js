const express = require('express');
const router = express.Router();
const { getEvents, createEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).send('Not authorized as an admin');
    }
};

router.get('/', getEvents);
router.post('/', protect, admin, createEvent);
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;
