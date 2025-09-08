const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPublicBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner
} = require('../controllers/banners');

// Public routes
router.get('/', getPublicBanners);

// Admin routes (protected)
router.use(protect);
router.use(authorize('admin'));

router.get('/admin', getAdminBanners);
router.post('/', createBanner);
router.put('/:id', updateBanner);
router.delete('/:id', deleteBanner);

module.exports = router;
