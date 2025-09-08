const express = require('express');
const { body, query, param } = require('express-validator');
const {
  getReviews,
  getReview,
  approveReview,
  rejectReview,
  deleteReview,
  respondToReview,
  getReviewStats,
  bulkReviewOperations
} = require('../controllers/reviews');

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation middleware
const validateReviewResponse = [
  body('content')
    .notEmpty()
    .withMessage('Содержание ответа обязательно')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Ответ должен содержать от 10 до 1000 символов')
];

const validateReviewRejection = [
  body('reason')
    .notEmpty()
    .withMessage('Причина отклонения обязательна')
    .isLength({ min: 5, max: 500 })
    .withMessage('Причина должна содержать от 5 до 500 символов')
];

const validateBulkOperations = [
  body('action')
    .isIn(['approve', 'reject', 'delete'])
    .withMessage('Неверное действие'),
  body('reviewIds')
    .isArray({ min: 1 })
    .withMessage('Необходимо указать минимум один отзыв'),
  body('reviewIds.*')
    .isMongoId()
    .withMessage('Неверный ID отзыва'),
  body('reason')
    .if(body('action').equals('reject'))
    .notEmpty()
    .withMessage('Причина отклонения обязательна для отклонения отзывов')
];

const validateGetReviews = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Номер страницы должен быть положительным числом'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Количество элементов на странице должно быть от 1 до 100'),
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Рейтинг должен быть от 1 до 5'),
  query('isApproved')
    .optional()
    .isBoolean()
    .withMessage('Неверное значение для статуса одобрения'),
  query('product')
    .optional()
    .isMongoId()
    .withMessage('Неверный ID товара'),
  query('user')
    .optional()
    .isMongoId()
    .withMessage('Неверный ID пользователя')
];

const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Неверный ID отзыва')
];

// 📊 МАРШРУТЫ ДЛЯ АДМИНОВ И МОДЕРАТОРОВ

// @route   GET /api/v1/reviews/stats
// @desc    Get review statistics
// @access  Private (Admin)
router.get('/stats', 
  protect, 
  authorize('admin', 'super_admin'), 
  getReviewStats
);

// @route   GET /api/v1/reviews
// @desc    Get all reviews with filtering and pagination
// @access  Private (Admin/Moderator)
router.get('/', 
  protect, 
  authorize('admin', 'super_admin', 'moderator'), 
  validateGetReviews, 
  validate, 
  getReviews
);

// @route   POST /api/v1/reviews/bulk
// @desc    Bulk operations on reviews (approve/reject/delete multiple)
// @access  Private (Admin)
router.post('/bulk', 
  protect, 
  authorize('admin', 'super_admin'), 
  validateBulkOperations, 
  validate, 
  bulkReviewOperations
);

// @route   GET /api/v1/reviews/:id
// @desc    Get single review by ID
// @access  Private (Admin/Moderator)
router.get('/:id', 
  protect, 
  authorize('admin', 'super_admin', 'moderator'), 
  validateMongoId, 
  validate, 
  getReview
);

// @route   PATCH /api/v1/reviews/:id/approve
// @desc    Approve a review
// @access  Private (Admin/Moderator)
router.patch('/:id/approve', 
  protect, 
  authorize('admin', 'super_admin', 'moderator'), 
  validateMongoId, 
  validate, 
  approveReview
);

// @route   PATCH /api/v1/reviews/:id/reject
// @desc    Reject a review
// @access  Private (Admin/Moderator)
router.patch('/:id/reject', 
  protect, 
  authorize('admin', 'super_admin', 'moderator'), 
  validateMongoId, 
  validateReviewRejection, 
  validate, 
  rejectReview
);

// @route   POST /api/v1/reviews/:id/respond
// @desc    Respond to a review
// @access  Private (Admin/Moderator/Seller)
router.post('/:id/respond', 
  protect, 
  authorize('admin', 'super_admin', 'moderator', 'seller'), 
  validateMongoId, 
  validateReviewResponse, 
  validate, 
  respondToReview
);

// @route   DELETE /api/v1/reviews/:id
// @desc    Delete a review
// @access  Private (Admin/Super Admin)
router.delete('/:id', 
  protect, 
  authorize('admin', 'super_admin'), 
  validateMongoId, 
  validate, 
  deleteReview
);

module.exports = router;