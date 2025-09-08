const jwt = require('jsonwebtoken');
const User = require('../../models/User');

/**
 * 🔐 АДМИНСКИЙ MIDDLEWARE АУТЕНТИФИКАЦИИ
 */

// Проверка авторизации админа
const protect = async (req, res, next) => {
  try {
    let token;

    // Получение токена из заголовка Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Проверка наличия токена
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Доступ запрещен. Необходима авторизация'
      });
    }

    try {
      // Верификация токена
      const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET);
      
      // Получение пользователя
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не найден'
        });
      }

      // Проверка админских прав
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

      // Проверка блокировки
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          error: 'Аккаунт заблокирован'
        });
      }

      // Добавление пользователя в запрос
      req.user = user;
      next();

    } catch (error) {
      console.error('JWT Error:', error.message);
      return res.status(401).json({
        success: false,
        error: 'Недействительный токен'
      });
    }

  } catch (error) {
    console.error('Admin Auth Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при проверке авторизации'
    });
  }
};

// Проверка супер-админа
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Доступ запрещен'
    });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Доступ запрещен. Требуются права супер-администратора'
    });
  }

  next();
};

// Логирование действий админа
const logAdminAction = (action) => {
  return (req, res, next) => {
    if (req.user) {
      const logData = {
        userId: req.user._id,
        email: req.user.email,
        action,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      };

      // Логирование в консоль (в production лучше использовать внешний сервис)
      console.log(`🔒 Admin Action: ${JSON.stringify(logData)}`);
      
      // Здесь можно добавить сохранение в БД или отправку в внешний сервис
    }
    next();
  };
};

module.exports = {
  protect,
  requireSuperAdmin,
  logAdminAction
};
