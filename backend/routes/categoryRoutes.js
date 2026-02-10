const express = require('express');
const router = express.Router();
const { getCategories, getTags, getLanguages } = require('../controllers/categoryController');

router.get('/categories', getCategories);
router.get('/tags', getTags);
router.get('/languages', getLanguages);

module.exports = router;

