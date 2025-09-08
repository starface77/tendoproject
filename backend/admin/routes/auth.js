const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../../models/User');

const router = express.Router();

/**
 * 🔐 АДМИНСКАЯ АУТЕНТИФИКАЦИЯ
 */

// Вход в админ панель
router.post('/login', [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Пароль обязателен')
], async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Неверные учетные данные'
      });
    }

    // Проверка роли
    if (!['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Доступ запрещен. Требуются права администратора'
      });
    }

    // Проверка активности
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Аккаунт деактивирован'
      });
    }

    // Проверка пароля
    const isPasswordValid = await user.checkPassword(password);
    
    if (!isPasswordValid) {
      // await user.incLoginAttempts(); // Метод не реализован в модели
      return res.status(401).json({
        success: false,
        error: 'Неверные учетные данные'
      });
    }

    // Сброс попыток входа при успешной авторизации
    // await user.resetLoginAttempts(); // Метод не реализован в модели

    // Создание токена
    const token = jwt.sign(
      { id: user._id },
      process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET,
      { expiresIn: '8h' } // Админский токен действует 8 часов
    );

    // Обновление времени последнего входа
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Успешный вход в админ панель',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        permissions: user.permissions,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера'
    });
  }
});

// Проверка токена
router.get('/verify', async (req, res) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Токен не предоставлен'
      });
    }

    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !['admin', 'super_admin'].includes(user.role) || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Недействительный токен'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        permissions: user.permissions
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Недействительный токен'
    });
  }
});

// Выход
router.post('/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Успешный выход из админ панели'
  });
});

module.exports = router;
