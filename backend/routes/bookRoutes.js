const express = require('express');
const router = express.Router();
const { getBooks, getBookById, createBook, deleteBook, getBookDebug } = require('../controllers/bookController');
const { getPendingBooks, reviewBook, getAdminBookDetails, updatePendingBook } = require('../controllers/adminController');
const { getAutocomplete } = require('../controllers/searchController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Autocomplete route
router.get('/autocomplete', getAutocomplete);

// --- Public Routes ---
router.get('/', getBooks);

// --- Admin Routes (Must be before /:id) ---
router.get('/pending', protect, authorize('admin', 'super_admin'), getPendingBooks);
router.get('/admin/:id', protect, authorize('admin', 'super_admin'), getAdminBookDetails); // Use specific path to avoid conflict/logic issues
router.put('/:id/review', protect, authorize('admin', 'super_admin'), reviewBook);
router.put('/:id/admin-update', protect, authorize('admin', 'super_admin'), updatePendingBook);

// --- Dynamic ID Routes ---
router.get('/:id', getBookById);
router.get('/:id/debug', getBookDebug);

// --- Protected User Routes ---
// Any logged in user can submit a book (Status=PENDING)
router.post('/', protect, createBook);

// --- Admin Only Routes ---
router.delete('/:id', protect, authorize('admin', 'super_admin'), deleteBook);

module.exports = router;
