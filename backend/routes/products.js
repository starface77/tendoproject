const express = require('express');
const { body, query } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
  getProductReviews,
  addProductReview
} = require('../controllers/products');

const { protect, authorize, requirePermission, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 🛍️ ПУБЛИЧНЫЕ МАРШРУТЫ

// Получить все товары с фильтрацией и сортировкой
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Номер страницы должен быть положительным числом'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Лимит должен быть от 1 до 100'),
  query('sort').optional().isIn(['name', 'price', 'rating', 'created', '-name', '-price', '-rating', '-created']).withMessage('Некорректная сортировка'),
  query('minPrice').optional().isNumeric().withMessage('Минимальная цена должна быть числом'),
  query('maxPrice').optional().isNumeric().withMessage('Максимальная цена должна быть числом')
], optionalAuth, getProducts);

// Поиск товаров
router.get('/search', [
  query('q').notEmpty().withMessage('Поисковый запрос обязателен'),
  query('page').optional().isInt({ min: 1 }).withMessage('Номер страницы должен быть положительным числом'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Лимит должен быть от 1 до 100')
], optionalAuth, searchProducts);

// Рекомендуемые товары
router.get('/featured', optionalAuth, getFeaturedProducts);

// Товары по категории
router.get('/category/:categoryId', [
  query('page').optional().isInt({ min: 1 }).withMessage('Номер страницы должен быть положительным числом'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Лимит должен быть от 1 до 100')
], optionalAuth, getProductsByCategory);

// Получить конкретный товар
router.get('/:id', optionalAuth, getProduct);

// Получить отзывы товара
router.get('/:id/reviews', [
  query('page').optional().isInt({ min: 1 }).withMessage('Номер страницы должен быть положительным числом'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Лимит должен быть от 1 до 50'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Рейтинг должен быть от 1 до 5')
], getProductReviews);

// 🔐 ЗАЩИЩЕННЫЕ МАРШРУТЫ

// Добавить отзыв
router.post('/:id/reviews', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Рейтинг должен быть от 1 до 5'),
  body('title').notEmpty().withMessage('Заголовок отзыва обязателен'),
  body('content').isLength({ min: 10, max: 1000 }).withMessage('Отзыв должен содержать от 10 до 1000 символов')
], addProductReview);

// 👨‍💼 АДМИНИСТРАТИВНЫЕ МАРШРУТЫ

// Создать товар
router.post('/', protect, authorize('admin', 'super_admin'), [
  body('name').notEmpty().withMessage('Название обязательно'),
  body('price').isNumeric().withMessage('Цена должна быть числом'),
  body('category').optional().isMongoId().withMessage('Некорректный ID категории')
], createProduct);

// Обновить товар
router.put('/:id', protect, authorize('admin', 'super_admin'), [
  body('price').optional().isNumeric().withMessage('Цена должна быть числом'),
  body('category').optional().isMongoId().withMessage('Некорректный ID категории')
], updateProduct);

// Удалить товар
router.delete('/:id', protect, authorize('admin', 'super_admin'), deleteProduct);

module.exports = router;
