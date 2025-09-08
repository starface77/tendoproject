const { validationResult } = require('express-validator');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Демо хранилище для демо режима
// demoStorage отключен - используем только MongoDB

/**
 * 👤 КОНТРОЛЛЕР ПОЛЬЗОВАТЕЛЕЙ
 * Управление пользователями (только для админов)
 */

// @desc    Получить всех пользователей
// @route   GET /api/v1/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      city,
      isActive,
      search,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (role) query.role = role;
    if (city) query.city = city;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    let users, total;

    // Используем только MongoDB
    users = await User.find(query)
      .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: users
    });

  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения пользователей'
    });
  }
};

// @desc    Получить пользователя по ID
// @route   GET /api/v1/users/:id
// @access  Private (Admin)
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshTokens -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    // Получаем статистику заказов пользователя
    const orderStats = await Order.aggregate([
      { $match: { customer: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$pricing.total' }
        }
      }
    ]);

    // Последние заказы
    const recentOrders = await Order.find({ customer: user._id })
      .select('orderNumber status pricing.total createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          orders: orderStats.reduce((acc, stat) => {
            acc[stat._id] = {
              count: stat.count,
              totalAmount: stat.totalAmount
            };
            return acc;
          }, {}),
          recentOrders
        }
      }
    });

  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения пользователя'
    });
  }
};

// @desc    Создать пользователя
// @route   POST /api/v1/users
// @access  Private (Admin)
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    const { email, phone } = req.body;

    // Проверка на существование пользователя
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Пользователь с таким email или телефоном уже существует'
      });
    }

    const user = new User(req.body);
    await user.save();

    // Убираем пароль из ответа
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно создан',
      data: user
    });

  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания пользователя'
    });
  }
};

// @desc    Обновить пользователя
// @route   PUT /api/v1/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    // Проверка уникальности email и телефона
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Пользователь с таким email уже существует'
        });
      }
    }

    if (req.body.phone && req.body.phone !== user.phone) {
      const phoneExists = await User.findOne({ phone: req.body.phone });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          error: 'Пользователь с таким телефоном уже существует'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password -refreshTokens');

    res.status(200).json({
      success: true,
      message: 'Пользователь успешно обновлен',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления пользователя'
    });
  }
};

// @desc    Изменить роль пользователя
// @route   PATCH /api/v1/users/:id/role
// @access  Private (Super Admin)
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    // Нельзя изменить роль супер-админа
    if (user.role === 'super_admin') {
      return res.status(400).json({
        success: false,
        error: 'Нельзя изменить роль супер-администратора'
      });
    }

    // Нельзя назначить роль супер-админа
    if (role === 'super_admin') {
      return res.status(400).json({
        success: false,
        error: 'Нельзя назначить роль супер-администратора'
      });
    }

    user.role = role;
    
    // Добавляем базовые разрешения в зависимости от роли
    if (role === 'admin') {
      user.permissions = [
        'read_products', 'create_products', 'update_products', 'delete_products',
        'read_orders', 'create_orders', 'update_orders',
        'read_users', 'update_users',
        'moderate_reviews', 'manage_categories', 'view_analytics'
      ];
    } else if (role === 'moderator') {
      user.permissions = [
        'read_products', 'read_orders', 'read_users',
        'moderate_reviews'
      ];
    } else {
      user.permissions = [];
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Роль пользователя успешно изменена',
      data: {
        id: user._id,
        role: user.role,
        permissions: user.permissions
      }
    });

  } catch (error) {
    console.error('Change User Role Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка изменения роли пользователя'
    });
  }
};

// @desc    Заблокировать пользователя
// @route   PATCH /api/v1/users/:id/block
// @access  Private (Admin)
const blockUser = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    // Нельзя заблокировать админа или супер-админа
    if (['admin', 'super_admin'].includes(user.role)) {
      return res.status(400).json({
        success: false,
        error: 'Нельзя заблокировать администратора'
      });
    }

    user.isActive = false;
    user.lockUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней
    user.notes = `${user.notes || ''}\nЗаблокирован: ${reason}`;
    user.refreshTokens = []; // Очищаем все токены

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Пользователь заблокирован',
      data: {
        id: user._id,
        isActive: user.isActive,
        lockUntil: user.lockUntil
      }
    });

  } catch (error) {
    console.error('Block User Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка блокировки пользователя'
    });
  }
};

// @desc    Разблокировать пользователя
// @route   PATCH /api/v1/users/:id/unblock
// @access  Private (Admin)
const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    user.isActive = true;
    user.lockUntil = undefined;
    user.loginAttempts = undefined;
    user.notes = `${user.notes || ''}\nРазблокирован: ${new Date().toISOString()}`;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Пользователь разблокирован',
      data: {
        id: user._id,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Unblock User Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка разблокировки пользователя'
    });
  }
};

// @desc    Удалить пользователя
// @route   DELETE /api/v1/users/:id
// @access  Private (Super Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    // Нельзя удалить супер-админа
    if (user.role === 'super_admin') {
      return res.status(400).json({
        success: false,
        error: 'Нельзя удалить супер-администратора'
      });
    }

    // Проверяем наличие заказов
    const orderCount = await Order.countDocuments({ customer: user._id });
    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Нельзя удалить пользователя с заказами. Заблокируйте вместо удаления.'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Пользователь успешно удален'
    });

  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления пользователя'
    });
  }
};

// @desc    Получить статистику пользователей
// @route   GET /api/v1/users/stats
// @access  Private (Admin)
const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          blocked: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
          verified: { $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] } },
          admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          moderators: { $sum: { $cond: [{ $eq: ['$role', 'moderator'] }, 1, 0] } },
          users: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } }
        }
      }
    ]);

    // Статистика по городам
    const cityStats = await User.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Статистика регистраций по дням (последние 30 дней)
    const registrationStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          active: 0,
          blocked: 0,
          verified: 0,
          admins: 0,
          moderators: 0,
          users: 0
        },
        byCities: cityStats,
        registrations: registrationStats
      }
    });

  } catch (error) {
    console.error('User Stats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения статистики пользователей'
    });
  }
};

// @desc    Получить профиль текущего пользователя
// @route   GET /api/v1/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -refreshTokens -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения профиля'
    });
  }
};

// @desc    Обновить профиль пользователя
// @route   PUT /api/v1/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone', 'address', 'city'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления профиля'
    });
  }
};

// @desc    Получить избранные товары пользователя
// @route   GET /api/v1/favorites
// @access  Private
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'favorites',
        populate: {
          path: 'category',
          select: 'name.ru name.uz'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    res.status(200).json({
      success: true,
      data: user.favorites || []
    });
  } catch (error) {
    console.error('Get Favorites Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения избранных товаров'
    });
  }
};

// @desc    Добавить товар в избранное
// @route   POST /api/v1/favorites
// @access  Private
const addToFavorites = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'ID товара обязателен'
      });
    }

    // Проверим, существует ли товар
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Товар не найден'
      });
    }

    const user = await User.findById(req.user.id);

    // Проверим, не добавлен ли уже товар в избранное
    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Товар добавлен в избранное'
    });
  } catch (error) {
    console.error('Add to Favorites Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка добавления в избранное'
    });
  }
};

// @desc    Удалить товар из избранного
// @route   DELETE /api/v1/favorites/:productId
// @access  Private
const removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);

    // Удаляем товар из массива favorites
    user.favorites = user.favorites.filter(id => id.toString() !== productId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Товар удален из избранного'
    });
  } catch (error) {
    console.error('Remove from Favorites Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления из избранного'
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  changeUserRole,
  blockUser,
  unblockUser,
  deleteUser,
  getUserStats,
  getProfile,
  updateProfile,
  getFavorites,
  addToFavorites,
  removeFromFavorites
};
