const express = require('express');
const { body, query } = require('express-validator');
const {
  getCities,
  getCity,
  createCity,
  updateCity,
  deleteCity,
  getDeliveryInfo,
  detectCity,
  getCityStats
} = require('../controllers/cities');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// 🛍️ ПУБЛИЧНЫЕ МАРШРУТЫ

// Получить все активные города
router.get('/', [
  query('language').optional().isIn(['ru', 'uz', 'en']).withMessage('Некорректный язык')
], getCities);

// Определить город по координатам
router.post('/detect', [
  body('latitude').isNumeric().withMessage('Широта должна быть числом'),
  body('longitude').isNumeric().withMessage('Долгота должна быть числом')
], detectCity);

// Получить информацию о доставке в город
router.get('/:code/delivery', getDeliveryInfo);

// Получить конкретный город
router.get('/:code', getCity);

// 👨‍💼 АДМИНИСТРАТИВНЫЕ МАРШРУТЫ

// Получить статистику городов
router.get('/admin/stats', protect, authorize('admin', 'super_admin'), getCityStats);

// Создать город
router.post('/admin', protect, authorize('super_admin'), [
  body('name.ru').notEmpty().withMessage('Название на русском обязательно'),
  body('name.uz').notEmpty().withMessage('Название на узбекском обязательно'),
  body('name.en').notEmpty().withMessage('Название на английском обязательно'),
  body('code').notEmpty().withMessage('Код города обязателен'),
  body('coordinates.latitude').isNumeric().withMessage('Широта должна быть числом'),
  body('coordinates.longitude').isNumeric().withMessage('Долгота должна быть числом')
], createCity);

// Обновить город
router.put('/admin/:id', protect, authorize('super_admin'), [
  body('coordinates.latitude').optional().isNumeric().withMessage('Широта должна быть числом'),
  body('coordinates.longitude').optional().isNumeric().withMessage('Долгота должна быть числом')
], updateCity);

// Удалить город
router.delete('/admin/:id', protect, authorize('super_admin'), deleteCity);

module.exports = router;
