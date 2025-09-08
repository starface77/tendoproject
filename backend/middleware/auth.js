const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Seller = require('../models/Seller');

/**
 * 🔐 MIDDLEWARE АУТЕНТИФИКАЦИИ
 * Проверка JWT токенов и авторизация пользователей
 */

// Проверка авторизации
const protect = async (req, res, next) => {
  try {
    let token;

    // Получение токена из заголовка Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Или из cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Проверка наличия токена
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Доступ запрещен. Необходима авторизация',
        code: 'NO_TOKEN'
      });
    }

    try {
      // Верификация токена
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo_development_only_change_in_production_2025');

      // Проверка срока действия
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return res.status(401).json({
          success: false,
          error: 'Срок действия токена истек',
          code: 'TOKEN_EXPIRED'
        });
      }

      let user;

      // Отключаем демо режим - используем только MongoDB
      user = await User.findById(decoded.id)
        .select('-password -__v')
        .populate('permissions')
        .lean();

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не найден',
          code: 'USER_NOT_FOUND'
        });
      }

      // Проверка активности аккаунта
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Аккаунт деактивирован',
          code: 'ACCOUNT_INACTIVE'
        });
      }

      // Проверка блокировки
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          error: 'Аккаунт заблокирован',
          code: 'ACCOUNT_LOCKED'
        });
      }

      // Добавление пользователя в запрос
      req.user = user;
      next();

    } catch (jwtError) {
      console.error('JWT Error:', jwtError.message);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Срок действия токена истек',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Недействительный токен',
          code: 'INVALID_TOKEN'
        });
      }
      
      return res.status(401).json({
        success: false,
        error: 'Ошибка авторизации',
        code: 'AUTH_ERROR'
      });
    }

  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при проверке авторизации',
      code: 'SERVER_ERROR'
    });
  }
};

// Проверка ролей
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Доступ запрещен'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Роль ${req.user.role} не имеет доступа к этому ресурсу`
      });
    }

    next();
  };
};

// Проверка разрешений
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Доступ запрещен'
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        error: `Недостаточно прав для выполнения действия: ${permission}`
      });
    }

    next();
  };
};

// Опциональная авторизация (не обязательная)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo_development_only_change_in_production_2025';
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive && !user.isLocked) {
          req.user = user;
        }
      } catch (error) {
        // Игнорируем ошибки токена в опциональной авторизации
        console.warn('Optional auth warning:', error.message);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Проверка владельца ресурса
const checkOwnership = (resourceModel, resourceField = '_id') => {
  return async (req, res, next) => {
    try {
      const Resource = require(`../models/${resourceModel}`);
      const resourceId = req.params.id || req.params[resourceField];
      
      const resource = await Resource.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: 'Ресурс не найден'
        });
      }

      // Админы и супер-админы имеют доступ ко всем ресурсам
      if (['admin', 'super_admin'].includes(req.user.role)) {
        req.resource = resource;
        return next();
      }

      // Проверка владельца
      const ownerId = resource.user || resource.customer || resource.createdBy;
      
      if (!ownerId || !ownerId.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          error: 'Доступ запрещен. Недостаточно прав'
        });
      }

      req.resource = resource;
      next();

    } catch (error) {
      console.error('Ownership check error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Ошибка проверки прав доступа'
      });
    }
  };
};

// Middleware для логирования активности пользователя
const logUserActivity = (action) => {
  return (req, res, next) => {
    if (req.user) {
      // Здесь можно добавить логирование в БД или файл
      console.log(`📊 User Activity: ${req.user.email} - ${action} - ${new Date().toISOString()}`);
    }
    next();
  };
};

// Проверка авторизации для продавцов
const sellerProtect = async (req, res, next) => {
  try {
    let token;

    // Получение токена из заголовка Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Или из cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Проверка наличия токена
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Доступ запрещен. Необходима авторизация'
      });
    }

    try {
      // Верификация токена
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo_development_only_change_in_production_2025');
      
      // Проверяем, что это токен продавца
      if (decoded.type !== 'seller') {
        return res.status(401).json({
          success: false,
          message: 'Недействительный тип токена'
        });
      }
      
      // Получение продавца
      const seller = await Seller.findById(decoded.id).select('-password');

      if (!seller) {
        return res.status(401).json({
          success: false,
          message: 'Продавец не найден'
        });
      }

      // Проверка активности аккаунта
      if (!seller.isActive) {
        let message = 'Аккаунт недоступен';
        if (seller.status === 'suspended') {
          message = `Аккаунт заблокирован до ${seller.suspendedUntil?.toLocaleDateString('ru-RU')}`;
          if (seller.suspensionReason) {
            message += `. Причина: ${seller.suspensionReason}`;
          }
        } else if (seller.status === 'banned') {
          message = 'Аккаунт заблокирован навсегда';
        } else if (seller.status === 'inactive') {
          message = 'Аккаунт деактивирован';
        }

        return res.status(403).json({
          success: false,
          message
        });
      }

      // Добавление продавца в запрос
      req.seller = seller;
      next();

    } catch (error) {
      console.error('JWT Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Недействительный токен'
      });
    }

  } catch (error) {
    console.error('Seller Auth Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при проверке авторизации'
    });
  }
};

module.exports = {
  protect,
  authorize,
  requirePermission,
  optionalAuth,
  checkOwnership,
  logUserActivity,
  sellerProtect
};

