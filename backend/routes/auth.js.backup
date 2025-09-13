const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  adminLogin,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  verifyEmail,
  resendVerificationEmail
} = require('../controllers/auth');

const { protect } = require('../middleware/auth');

const router = express.Router();

// 📋 ДОСТУПНЫЕ МАРШРУТЫ
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes available',
    routes: [
      'POST /register',
      'POST /login',
      'POST /admin/login',
      'GET /logout',
      'GET /me',
      'POST /forgot-password',
      'PUT /reset-password/:token',
      'PUT /update-details',
      'PUT /update-password',
      'GET /verify-email/:token',
      'POST /resend-verification'
    ]
  });
});

// 📝 РЕГИСТРАЦИЯ
router.post('/register', [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
  body('firstName').notEmpty().withMessage('Имя обязательно'),
  body('lastName').notEmpty().withMessage('Фамилия обязательна'),
  body('phone').matches(/^\+998[0-9]{9}$/).withMessage('Некорректный формат телефона')
], register);

// 🔐 ВХОД
router.post('/login', [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Пароль обязателен')
], login);

// 👑 ВХОД АДМИНИСТРАТОРА
router.post('/admin/login', [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Пароль обязателен')
], adminLogin);

// 🚪 ВЫХОД
router.get('/logout', logout);

// 👤 ПОЛУЧЕНИЕ ПРОФИЛЯ
router.get('/me', protect, getMe);

// 📧 ЗАБЫЛ ПАРОЛЬ
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Некорректный email')
], forgotPassword);

// 🔄 СБРОС ПАРОЛЯ
router.put('/reset-password/:resettoken', [
  body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов')
], resetPassword);

// ✏️ ОБНОВЛЕНИЕ ПРОФИЛЯ
router.put('/update-details', protect, [
  body('firstName').optional().notEmpty().withMessage('Имя не может быть пустым'),
  body('lastName').optional().notEmpty().withMessage('Фамилия не может быть пустой'),
  body('phone').optional().matches(/^\+998[0-9]{9}$/).withMessage('Некорректный формат телефона')
], updateDetails);

// 🔒 СМЕНА ПАРОЛЯ
router.put('/update-password', protect, [
  body('currentPassword').notEmpty().withMessage('Текущий пароль обязателен'),
  body('newPassword').isLength({ min: 6 }).withMessage('Новый пароль должен содержать минимум 6 символов')
], updatePassword);

// ✅ ПОДТВЕРЖДЕНИЕ EMAIL
router.get('/verify-email/:token', verifyEmail);

// 📧 ПОВТОРНАЯ ОТПРАВКА ПОДТВЕРЖДЕНИЯ
router.post('/resend-verification', protect, resendVerificationEmail);

module.exports = router;
