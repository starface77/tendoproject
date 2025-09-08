const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const {
  getPromotions,
  getPublicPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  validatePromoCode,
  applyPromoCode,
  getPromotionAnalytics,
  autoApplyBestPromo
} = require('../controllers/promotions');

/**
 * 🎁 МАРШРУТЫ ДЛЯ ПРОМОАКЦИЙ И ПРОМОКОДОВ
 */

// Валидация для создания промоакции
const createPromotionValidation = [
  body('name.ru').notEmpty().withMessage('Название на русском обязательно'),
  body('name.uz').notEmpty().withMessage('Название на узбекском обязательно'),
  body('name.en').notEmpty().withMessage('Название на английском обязательно'),
  body('code').isLength({ min: 3, max: 20 }).withMessage('Код должен быть от 3 до 20 символов'),
  body('type').isIn(['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y', 'cashback', 'loyalty_points'])
    .withMessage('Недопустимый тип промоакции'),
  body('discount.value').isNumeric().withMessage('Значение скидки должно быть числом'),
  body('validFrom').isISO8601().withMessage('Некорректная дата начала'),
  body('validUntil').isISO8601().withMessage('Некорректная дата окончания')
];

// Валидация для проверки промокода
const validatePromoValidation = [
  body('code').notEmpty().withMessage('Код промоакции обязателен'),
  body('orderData').optional().isObject().withMessage('Данные заказа должны быть объектом')
];

// @desc    Получить все промоакции (админ)
// @route   GET /api/v1/promotions
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), getPromotions);

// @desc    Получить публичные промоакции
// @route   GET /api/v1/promotions/public
// @access  Public
router.get('/public', getPublicPromotions);

// @desc    Автоматическое применение лучших промоакций
// @route   POST /api/v1/promotions/auto-apply
// @access  Public
router.post('/auto-apply', autoApplyBestPromo);

// @desc    Проверить промокод
// @route   POST /api/v1/promotions/validate
// @access  Public
router.post('/validate', validatePromoValidation, validatePromoCode);

// @desc    Применить промокод к заказу
// @route   POST /api/v1/promotions/apply
// @access  Private
router.post('/apply', protect, [
  body('code').notEmpty().withMessage('Код промоакции обязателен'),
  body('orderId').isMongoId().withMessage('Некорректный ID заказа')
], applyPromoCode);

// @desc    Создать промоакцию
// @route   POST /api/v1/promotions
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), createPromotionValidation, createPromotion);

// @desc    Получить аналитику промоакции
// @route   GET /api/v1/promotions/:id/analytics
// @access  Private (Admin)
router.get('/:id/analytics', protect, authorize('admin'), getPromotionAnalytics);

// @desc    Обновить промоакцию
// @route   PUT /api/v1/promotions/:id
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), updatePromotion);

// @desc    Удалить промоакцию
// @route   DELETE /api/v1/promotions/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), deletePromotion);

module.exports = router;