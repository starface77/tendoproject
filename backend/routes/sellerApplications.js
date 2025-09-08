const express = require('express');
const { body } = require('express-validator');
const {
  createApplication,
  getApplications,
  getApplication,
  approveApplication,
  rejectApplication,
  requestDocuments,
  getApplicationStats,
  getMyApplicationStatus
} = require('../controllers/sellerApplications');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ПУБЛИЧНЫЕ РОУТЫ
// @desc    Create seller application
// @route   POST /api/v1/seller-applications
// @access  Public (но лучше если авторизован)
router.post('/', createApplication);

// Статус заявки текущего пользователя
router.get('/status', protect, getMyApplicationStatus);

// Валидация для действий с заявкой
const applicationActionValidation = [
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Комментарий не может быть длиннее 1000 символов')
];

// ЗАЩИЩЕННЫЕ МАРШРУТЫ (ТОЛЬКО ДЛЯ АДМИНОВ)
router.get('/', protect, authorize('admin', 'moderator'), getApplications);
router.get('/stats', protect, authorize('admin', 'moderator'), getApplicationStats);
router.get('/:id', protect, authorize('admin', 'moderator'), getApplication);

// Действия с заявками
router.put('/:id/approve', protect, authorize('admin', 'moderator'), applicationActionValidation, approveApplication);
router.put('/:id/reject', protect, authorize('admin', 'moderator'), applicationActionValidation, rejectApplication);
router.put('/:id/request-documents', protect, authorize('admin', 'moderator'), applicationActionValidation, requestDocuments);

module.exports = router;
