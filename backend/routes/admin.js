const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  // Dashboard
  getDashboardStats,
  getAnalytics,
  getSystemHealth,

  // User management
  getUsers,
  updateUser,
  deleteUser,

  // Product management
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,

  // Order management
  getAdminOrders,
  updateOrderStatus,

  // Chat management
  getAdminChats,

  // Category management
  getAdminCategories,
  createAdminCategory,

  // Review management
  getAdminReviews,
  updateReviewStatus,

  // Settings
  getSystemSettings,
  updateSystemSettings
} = require('../controllers/admin');

// Seller Applications Controller
const {
  getApplications,
  getApplication,
  approveApplication,
  rejectApplication,
  requestDocuments,
  getApplicationStats
} = require('../controllers/sellerApplications');

// Sellers Controller
const {
  getSellers,
  getSeller,
  suspendSeller,
  unsuspendSeller,
  updateCommission,
  getSellerAnalytics
} = require('../controllers/admin');

// Settings controller
const {
  getAllSettings,
  getSettingsByCategory,
  updateSetting,
  updateMultipleSettings,
  createSetting,
  deleteSetting,
  resetSettings,
  initializeSettings
} = require('../controllers/settings');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, authorize('admin', 'super_admin'));

// ==================== DASHBOARD ====================

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
router.get('/stats', getDashboardStats);

// @desc    Get analytics data
// @route   GET /api/v1/admin/analytics
// @access  Private (Admin)
router.get('/analytics', getAnalytics);

// @desc    Get system health
// @route   GET /api/v1/admin/health
// @access  Private (Admin)
router.get('/health', getSystemHealth);

// ==================== USER MANAGEMENT ====================

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
router.get('/users', getUsers);

// @desc    Update user
// @route   PUT /api/v1/admin/users/:id
// @access  Private (Admin)
router.put('/users/:id', updateUser);

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin)
router.delete('/users/:id', deleteUser);

// ==================== PRODUCT MANAGEMENT ====================

// @desc    Get all products for admin
// @route   GET /api/v1/admin/products
// @access  Private (Admin)
router.get('/products', getAdminProducts);

// @desc    Create product (admin)
// @route   POST /api/v1/admin/products
// @access  Private (Admin)
router.post('/products', createAdminProduct);

// @desc    Update product (admin)
// @route   PUT /api/v1/admin/products/:id
// @access  Private (Admin)
router.put('/products/:id', updateAdminProduct);

// ==================== ORDER MANAGEMENT ====================

// @desc    Get all orders for admin
// @route   GET /api/v1/admin/orders
// @access  Private (Admin)
router.get('/orders', getAdminOrders);

// @desc    Update order status (admin)
// @route   PUT /api/v1/admin/orders/:id/status
// @access  Private (Admin)
router.put('/orders/:id/status', updateOrderStatus);

// ==================== CHAT MANAGEMENT ====================

// @desc    Get all chats for admin
// @route   GET /api/v1/admin/chats
// @access  Private (Admin)
router.get('/chats', getAdminChats);

// ==================== CATEGORY MANAGEMENT ====================

// @desc    Get all categories for admin
// @route   GET /api/v1/admin/categories
// @access  Private (Admin)
router.get('/categories', getAdminCategories);

// @desc    Create category (admin)
// @route   POST /api/v1/admin/categories
// @access  Private (Admin)
router.post('/categories', createAdminCategory);

// ==================== REVIEW MANAGEMENT ====================

// @desc    Get all reviews for admin
// @route   GET /api/v1/admin/reviews
// @access  Private (Admin)
router.get('/reviews', getAdminReviews);

// @desc    Approve/Reject review
// @route   PUT /api/v1/admin/reviews/:id/status
// @access  Private (Admin)
router.put('/reviews/:id/status', updateReviewStatus);

// ==================== SETTINGS MANAGEMENT ====================

// @desc    Get system settings
// @route   GET /api/v1/admin/settings
// @access  Private (Admin)
router.get('/settings', getSystemSettings);

// @desc    Update system settings
// @route   PUT /api/v1/admin/settings
// @access  Private (Admin)
router.put('/settings', updateSystemSettings);

// ==================== ADVANCED SETTINGS MANAGEMENT ====================

// @desc    Get all settings grouped by category
// @route   GET /api/v1/admin/settings/all
// @access  Private (Admin)
router.get('/settings/all', getAllSettings);

// @desc    Initialize default settings
// @route   POST /api/v1/admin/settings/initialize
// @access  Private (Admin)
router.post('/settings/initialize', initializeSettings);

// @desc    Reset settings to defaults
// @route   POST /api/v1/admin/settings/reset
// @access  Private (Admin)
router.post('/settings/reset', resetSettings);

// @desc    Update multiple settings
// @route   PUT /api/v1/admin/settings/bulk
// @access  Private (Admin)
router.put('/settings/bulk', updateMultipleSettings);

// @desc    Get settings by category
// @route   GET /api/v1/admin/settings/category/:category
// @access  Private (Admin)
router.get('/settings/category/:category', getSettingsByCategory);

// @desc    Create new setting
// @route   POST /api/v1/admin/settings/create
// @access  Private (Admin)
router.post('/settings/create', createSetting);

// @desc    Update specific setting
// @route   PUT /api/v1/admin/settings/key/:key
// @access  Private (Admin)
router.put('/settings/key/:key', updateSetting);

// @desc    Delete setting
// @route   DELETE /api/v1/admin/settings/key/:key
// @access  Private (Admin)
router.delete('/settings/key/:key', deleteSetting);

// ==================== SELLER APPLICATIONS MANAGEMENT ====================

// @desc    Get all seller applications
// @route   GET /api/v1/admin/seller-applications
// @access  Private (Admin)
router.get('/seller-applications', getApplications);

// @desc    Get seller applications stats
// @route   GET /api/v1/admin/seller-applications/stats
// @access  Private (Admin)
router.get('/seller-applications/stats', getApplicationStats);

// @desc    Get seller application by ID
// @route   GET /api/v1/admin/seller-applications/:id
// @access  Private (Admin)
router.get('/seller-applications/:id', getApplication);

// @desc    Approve seller application
// @route   PUT /api/v1/admin/seller-applications/:id/approve
// @access  Private (Admin)
router.put('/seller-applications/:id/approve', approveApplication);

// @desc    Reject seller application
// @route   PUT /api/v1/admin/seller-applications/:id/reject
// @access  Private (Admin)
router.put('/seller-applications/:id/reject', rejectApplication);

// @desc    Request additional documents
// @route   PUT /api/v1/admin/seller-applications/:id/request-documents
// @access  Private (Admin)
router.put('/seller-applications/:id/request-documents', requestDocuments);

// ==================== SELLERS MANAGEMENT ====================

// @desc    Get all sellers
// @route   GET /api/v1/admin/sellers
// @access  Private (Admin)
// router.get('/sellers', getSellers);

// @desc    Get single seller
// @route   GET /api/v1/admin/sellers/:id
// @access  Private (Admin)
// // router.get('/sellers/:id', getSeller);

// @desc    Suspend seller
// @route   PATCH /api/v1/admin/sellers/:id/suspend
// @access  Private (Admin)
// router.patch('/sellers/:id/suspend', suspendSeller);

// @desc    Unsuspend seller
// @route   PATCH /api/v1/admin/sellers/:id/unsuspend
// @access  Private (Admin)
// router.patch('/sellers/:id/unsuspend', unsuspendSeller);

// @desc    Update seller commission
// @route   PATCH /api/v1/admin/sellers/:id/commission
// @access  Private (Admin)
// router.patch('/sellers/:id/commission', updateCommission);

// @desc    Get seller analytics
// @route   GET /api/v1/admin/sellers/:id/analytics
// @access  Private (Admin)
// router.get('/sellers/:id/analytics', getSellerAnalytics);

module.exports = router;