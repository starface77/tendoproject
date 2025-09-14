const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAdminOverview,
  getSellerOverview,
  exportData
} = require('../controllers/analytics');

/**
 * 📊 МАРШРУТЫ АНАЛИТИКИ
 */

// @desc    Общая статистика для админа
// @route   GET /api/v1/analytics/admin/overview
// @access  Private (Admin)
router.get('/admin/overview', protect, authorize('admin'), getAdminOverview);

// @desc    Статистика для продавца
// @route   GET /api/v1/analytics/seller/overview  
// @access  Private (Seller)
router.get('/seller/overview', protect, authorize('seller', 'admin'), getSellerOverview);

// @desc    Экспорт данных
// @route   GET /api/v1/analytics/export
// @access  Private (Admin/Seller)
router.get('/export', protect, exportData);

module.exports = router;









