const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const favoritesController = require('../controllers/favorites');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');

// Validation middleware
const validateProductId = [
  param('productId')
    .isMongoId()
    .withMessage('Неверный ID товара')
];

const validateFavoriteUpdate = [
  body('tags')
    .optional()
    .isArray()
    .withMessage('Теги должны быть массивом'),
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Каждый тег должен быть строкой от 1 до 50 символов'),
  body('priority')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Приоритет должен быть от 1 до 5'),
  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Примечания не должны превышать 500 символов'),
  body('notifications.priceDropEnabled')
    .optional()
    .isBoolean()
    .withMessage('Неверное значение для уведомлений о снижении цены'),
  body('notifications.backInStockEnabled')
    .optional()
    .isBoolean()
    .withMessage('Неверное значение для уведомлений о появлении в наличии')
];

const validateBulkUpdate = [
  body('action')
    .isIn(['remove', 'update'])
    .withMessage('Неверное действие'),
  body('productIds')
    .isArray({ min: 1 })
    .withMessage('Необходимо указать минимум один товар'),
  body('productIds.*')
    .isMongoId()
    .withMessage('Неверный ID товара')
];

const validateGetFavorites = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Номер страницы должен быть положительным числом'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Количество элементов на странице должно быть от 1 до 100'),
  query('sortBy')
    .optional()
    .isIn(['addedAt', 'priority', 'priceWhenAdded', 'product.name', 'product.price'])
    .withMessage('Неверное поле для сортировки'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Неверное направление сортировки'),
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Неверный ID категории'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Минимальная цена должна быть положительным числом'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Максимальная цена должна быть положительным числом'),
  query('priority')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Приоритет должен быть от 1 до 5'),
  query('inStock')
    .optional()
    .isBoolean()
    .withMessage('Неверное значение для наличия'),
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Поисковый запрос должен быть от 2 до 100 символов')
];

// Routes

// @route   GET /api/favorites
// @desc    Get user's favorites with filtering and pagination
// @access  Private
router.get('/', 
  auth, 
  validateGetFavorites, 
  validate, 
  favoritesController.getFavorites
);

// @route   POST /api/favorites/:productId
// @desc    Add product to favorites
// @access  Private
router.post('/:productId', 
  auth, 
  validateProductId, 
  validateFavoriteUpdate, 
  validate, 
  favoritesController.addToFavorites
);

// @route   DELETE /api/favorites/:productId
// @desc    Remove product from favorites
// @access  Private
router.delete('/:productId', 
  auth, 
  validateProductId, 
  validate, 
  favoritesController.removeFromFavorites
);

// @route   GET /api/favorites/check/:productId
// @desc    Check if product is in user's favorites
// @access  Private
router.get('/check/:productId', 
  auth, 
  validateProductId, 
  validate, 
  favoritesController.checkFavorite
);

// @route   PUT /api/favorites/:productId
// @desc    Update favorite metadata (tags, priority, notes, notifications)
// @access  Private
router.put('/:productId', 
  auth, 
  validateProductId, 
  validateFavoriteUpdate, 
  validate, 
  favoritesController.updateFavorite
);

// @route   GET /api/favorites/stats
// @desc    Get user's favorite statistics
// @access  Private
router.get('/stats', 
  auth, 
  favoritesController.getFavoriteStats
);

// @route   POST /api/favorites/bulk
// @desc    Bulk operations on favorites (remove/update multiple)
// @access  Private
router.post('/bulk', 
  auth, 
  validateBulkUpdate, 
  validate, 
  favoritesController.bulkUpdateFavorites
);

// @route   GET /api/favorites/price-drops
// @desc    Get products with price drops from user's favorites
// @access  Private
router.get('/price-drops', 
  auth, 
  favoritesController.getPriceDrops
);

// @route   GET /api/favorites/back-in-stock
// @desc    Get back in stock items from user's favorites
// @access  Private
router.get('/back-in-stock', 
  auth, 
  favoritesController.getBackInStock
);

module.exports = router;