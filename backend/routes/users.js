const express = require('express');
const { body, query } = require('express-validator');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  changeUserRole,
  getUserStats,
  getProfile,
  updateProfile,
  getFavorites,
  addToFavorites,
  removeFromFavorites
} = require('../controllers/users');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// 👨‍💼 АДМИНИСТРАТИВНЫЕ МАРШРУТЫ (все защищены)

// Получить всех пользователей
router.get('/', protect, authorize('admin', 'super_admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Номер страницы должен быть положительным числом'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Лимит должен быть от 1 до 100'),
  query('role').optional().isIn(['user', 'moderator', 'admin', 'super_admin']).withMessage('Некорректная роль'),
  query('city').optional().notEmpty().withMessage('Город не может быть пустым'),
  query('isActive').optional().isBoolean().withMessage('isActive должно быть boolean'),
  query('search').optional().notEmpty().withMessage('Поисковый запрос не может быть пустым')
], getUsers);

// Получить статистику пользователей
router.get('/stats', protect, authorize('admin', 'super_admin'), getUserStats);

// Создать пользователя
router.post('/', protect, authorize('admin', 'super_admin'), [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
  body('firstName').notEmpty().withMessage('Имя обязательно'),
  body('lastName').notEmpty().withMessage('Фамилия обязательна'),
  body('phone').matches(/^\+998[0-9]{9}$/).withMessage('Некорректный формат телефона'),
  body('role').optional().isIn(['user', 'moderator', 'admin']).withMessage('Некорректная роль')
], createUser);

// Получить конкретного пользователя
router.get('/:id', protect, authorize('admin', 'super_admin'), getUser);

// Обновить пользователя
router.put('/:id', protect, authorize('admin', 'super_admin'), [
  body('email').optional().isEmail().withMessage('Некорректный email'),
  body('firstName').optional().notEmpty().withMessage('Имя не может быть пустым'),
  body('lastName').optional().notEmpty().withMessage('Фамилия не может быть пустой'),
  body('phone').optional().matches(/^\+998[0-9]{9}$/).withMessage('Некорректный формат телефона')
], updateUser);

// Изменить роль пользователя
router.patch('/:id/role', protect, authorize('super_admin'), [
  body('role').isIn(['user', 'moderator', 'admin']).withMessage('Некорректная роль')
], changeUserRole);

// Заблокировать пользователя
router.patch('/:id/block', protect, authorize('admin', 'super_admin'), [
  body('reason').optional().notEmpty().withMessage('Причина блокировки не может быть пустой')
], blockUser);

// Разблокировать пользователя
router.patch('/:id/unblock', protect, authorize('admin', 'super_admin'), unblockUser);

// Удалить пользователя (только супер-админ)
router.delete('/:id', protect, authorize('super_admin'), deleteUser);

// ==================================================
// 👤 МАРШРУТЫ ДЛЯ АВТОРИЗОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ
// ==================================================

// Профиль пользователя
router.get('/profile', protect, getProfile);
router.put('/profile', protect, [
  body('firstName').optional().notEmpty().withMessage('Имя не может быть пустым'),
  body('lastName').optional().notEmpty().withMessage('Фамилия не может быть пустой'),
  body('phone').optional().matches(/^\+998[0-9]{9}$/).withMessage('Некорректный формат телефона')
], updateProfile);

// Избранные товары - используем простые маршруты в users.js
router.get('/favorites', protect, getFavorites);
router.post('/favorites', protect, [
  body('productId').isMongoId().withMessage('Некорректный ID товара')
], addToFavorites);
router.delete('/favorites/:productId', protect, removeFromFavorites);

module.exports = router;
