const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPublicSections,
  getAdminSections,
  createSection,
  updateSection,
  deleteSection
} = require('../controllers/homeSections');

// Public
router.get('/', getPublicSections);

// Admin
router.use(protect);
router.use(authorize('admin'));
router.get('/admin', getAdminSections);
router.post('/', createSection);
router.put('/:id', updateSection);
router.delete('/:id', deleteSection);

module.exports = router;


