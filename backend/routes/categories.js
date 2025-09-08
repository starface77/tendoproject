const express = require('express');
const { body, query } = require('express-validator');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getFeaturedCategories
} = require('../controllers/categories');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// 🛍️ ПУБЛИЧНЫЕ МАРШРУТЫ

// Получить все категории
router.get('/', [
  query('parent').optional().isMongoId().withMessage('Некорректный ID родительской категории'),
  query('level').optional().isInt({ min: 0, max: 3 }).withMessage('Уровень должен быть от 0 до 3')
], getCategories);

// Древо категорий
router.get('/tree', getCategoryTree);

// Рекомендуемые категории
router.get('/featured', getFeaturedCategories);

// Получить конкретную категорию
router.get('/:id', getCategory);

// 👨‍💼 АДМИНИСТРАТИВНЫЕ МАРШРУТЫ

// Создать категорию
router.post('/', protect, authorize('admin', 'super_admin'), [
  body('name.ru').notEmpty().withMessage('Название на русском обязательно'),
  body('name.uz').notEmpty().withMessage('Название на узбекском обязательно'),
  body('name.en').notEmpty().withMessage('Название на английском обязательно'),
  body('parent').optional().isMongoId().withMessage('Некорректный ID родительской категории'),
  body('order').optional().isInt({ min: 0 }).withMessage('Порядок должен быть неотрицательным числом'),
  body('icon').optional().isString().withMessage('Иконка должна быть строкой'),
  body('isActive').optional().isBoolean().withMessage('Статус активности должен быть булевым')
], createCategory);

// Обновить категорию
router.put('/:id', protect, authorize('admin', 'super_admin'), [
  body('parent').optional().isMongoId().withMessage('Некорректный ID родительской категории'),
  body('order').optional().isInt({ min: 0 }).withMessage('Порядок должен быть неотрицательным числом')
], updateCategory);

// Удалить категорию
router.delete('/:id', protect, authorize('admin', 'super_admin'), deleteCategory);

module.exports = router;
