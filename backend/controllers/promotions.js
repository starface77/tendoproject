/**
 * 🎁 КОНТРОЛЛЕР ПРОМОАКЦИЙ И ПРОМОКОДОВ
 * Система промокодов, скидок и программы лояльности
 */

const Promotion = require('../models/Promotion');
const Order = require('../models/Order');
const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * @desc    Получить все промоакции (для админа)
 * @route   GET /api/v1/promotions
 * @access  Private (Admin)
 */
const getPromotions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type, 
      search,
      sortBy = '-createdAt'
    } = req.query;

    // Построение запроса
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { 'name.ru': { $regex: search, $options: 'i' } },
        { 'name.uz': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } }
      ];
    }

    const limitNum = Math.min(parseInt(limit), 100);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    const [promotions, total] = await Promise.all([
      Promotion.find(query)
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .sort(sortBy)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Promotion.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: promotions.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      },
      data: promotions
    });

  } catch (error) {
    console.error('Ошибка получения промоакций:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения промоакций',
      message: error.message
    });
  }
};

/**
 * @desc    Получить публичные активные промоакции
 * @route   GET /api/v1/promotions/public
 * @access  Public
 */
const getPublicPromotions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const promotions = await Promotion.findActivePromotions()
      .find({ 'settings.public': true })
      .select('name code type discount validUntil conditions.minOrderAmount')
      .sort({ 'settings.priority': -1, 'analytics.successes': -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: promotions
    });

  } catch (error) {
    console.error('Ошибка получения публичных промоакций:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения промоакций'
    });
  }
};

/**
 * @desc    Создать промоакцию
 * @route   POST /api/v1/promotions
 * @access  Private (Admin)
 */
const createPromotion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    // Проверяем уникальность кода
    const existingPromo = await Promotion.findOne({ 
      code: req.body.code.toUpperCase() 
    });

    if (existingPromo) {
      return res.status(400).json({
        success: false,
        error: 'Промокод с таким кодом уже существует'
      });
    }

    // Создаем промоакцию
    const promotionData = {
      ...req.body,
      code: req.body.code.toUpperCase(),
      createdBy: req.user._id
    };

    const promotion = new Promotion(promotionData);
    await promotion.save();

    await promotion.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Промоакция успешно создана',
      data: promotion
    });

  } catch (error) {
    console.error('Ошибка создания промоакции:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации данных',
        details: errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Ошибка создания промоакции',
      message: error.message
    });
  }
};

/**
 * @desc    Обновить промоакцию
 * @route   PUT /api/v1/promotions/:id
 * @access  Private (Admin)
 */
const updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Промоакция не найдена'
      });
    }

    // Если меняется код, проверяем уникальность
    if (req.body.code && req.body.code.toUpperCase() !== promotion.code) {
      const existingPromo = await Promotion.findOne({ 
        code: req.body.code.toUpperCase(),
        _id: { $ne: req.params.id }
      });

      if (existingPromo) {
        return res.status(400).json({
          success: false,
          error: 'Промокод с таким кодом уже существует'
        });
      }
    }

    // Обновляем данные
    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    if (req.body.code) {
      updateData.code = req.body.code.toUpperCase();
    }

    const updatedPromotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Промоакция успешно обновлена',
      data: updatedPromotion
    });

  } catch (error) {
    console.error('Ошибка обновления промоакции:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления промоакции',
      message: error.message
    });
  }
};

/**
 * @desc    Удалить промоакцию
 * @route   DELETE /api/v1/promotions/:id
 * @access  Private (Admin)
 */
const deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Промоакция не найдена'
      });
    }

    // Мягкое удаление - меняем статус
    promotion.status = 'discontinued';
    await promotion.save();

    res.json({
      success: true,
      message: 'Промоакция успешно удалена'
    });

  } catch (error) {
    console.error('Ошибка удаления промоакции:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления промоакции',
      message: error.message
    });
  }
};

/**
 * @desc    Проверить промокод
 * @route   POST /api/v1/promotions/validate
 * @access  Public
 */
const validatePromoCode = async (req, res) => {
  try {
    const { code, orderData } = req.body;
    const user = req.user; // Может быть undefined для гостей

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Код промоакции обязателен'
      });
    }

    console.log('🎁 Проверка промокода:', code);

    // Находим промоакцию
    const promotion = await Promotion.findByCode(code);

    if (!promotion) {
      // Увеличиваем счетчик неудачных попыток для аналитики
      await Promotion.updateOne(
        { code: code.toUpperCase() },
        { $inc: { 'analytics.attempts': 1 } }
      );

      return res.status(404).json({
        success: false,
        error: 'Промокод не найден или неактивен'
      });
    }

    // Увеличиваем счетчики аналитики
    promotion.analytics.attempts += 1;
    promotion.analytics.views += 1;

    // Проверяем возможность использования
    const validationResult = promotion.canUse(user, orderData);

    if (!validationResult.valid) {
      await promotion.save();
      return res.status(400).json({
        success: false,
        error: validationResult.reason
      });
    }

    // Дополнительная проверка для новых пользователей
    if (promotion.conditions.newCustomersOnly && user) {
      const existingOrders = await Order.countDocuments({
        customer: user._id,
        status: { $in: ['delivered', 'confirmed'] }
      });

      if (existingOrders > 0) {
        await promotion.save();
        return res.status(400).json({
          success: false,
          error: 'Этот промокод доступен только для новых покупателей'
        });
      }
    }

    // Рассчитываем скидку
    let discountAmount = 0;
    let discountType = promotion.type;

    if (orderData) {
      discountAmount = promotion.calculateDiscount(orderData);
    }

    await promotion.save();

    res.json({
      success: true,
      data: {
        promotion: {
          id: promotion._id,
          code: promotion.code,
          name: promotion.name,
          type: promotion.type,
          discount: promotion.discount,
          description: promotion.description
        },
        discountAmount,
        discountType,
        savings: discountAmount,
        message: discountAmount > 0 
          ? `Скидка ${discountAmount} сум применена!`
          : 'Промокод действителен'
      }
    });

  } catch (error) {
    console.error('Ошибка проверки промокода:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка проверки промокода',
      message: error.message
    });
  }
};

/**
 * @desc    Применить промокод к заказу
 * @route   POST /api/v1/promotions/apply
 * @access  Private
 */
const applyPromoCode = async (req, res) => {
  try {
    const { code, orderId } = req.body;
    const user = req.user;

    // Находим заказ
    const order = await Order.findOne({
      _id: orderId,
      customer: user._id,
      status: 'pending'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Заказ не найден или уже обработан'
      });
    }

    // Находим промоакцию
    const promotion = await Promotion.findByCode(code);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Промокод не найден или неактивен'
      });
    }

    // Проверяем возможность использования
    const orderData = {
      subtotal: order.pricing.subtotal,
      shippingCost: order.pricing.shipping,
      items: order.items.map(item => ({
        productId: item.product,
        categoryId: item.productSnapshot?.categoryId,
        quantity: item.quantity,
        price: item.price
      }))
    };

    const validationResult = promotion.canUse(user, orderData);

    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: validationResult.reason
      });
    }

    // Рассчитываем скидку
    const discountAmount = promotion.calculateDiscount(orderData);

    // Применяем промокод к заказу
    order.promoCode = {
      code: promotion.code,
      type: promotion.type,
      value: promotion.discount.value,
      discount: discountAmount
    };

    order.pricing.discount = discountAmount;
    order.pricing.total = order.pricing.subtotal + order.pricing.shipping + order.pricing.tax - discountAmount;

    await order.save();

    // Отмечаем использование промокода
    await promotion.use(user, order, discountAmount);

    res.json({
      success: true,
      message: `Промокод применен! Скидка: ${discountAmount} сум`,
      data: {
        orderId: order._id,
        discountAmount,
        newTotal: order.pricing.total,
        promotion: {
          code: promotion.code,
          name: promotion.name
        }
      }
    });

  } catch (error) {
    console.error('Ошибка применения промокода:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка применения промокода',
      message: error.message
    });
  }
};

/**
 * @desc    Получить аналитику промоакции
 * @route   GET /api/v1/promotions/:id/analytics
 * @access  Private (Admin)
 */
const getPromotionAnalytics = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Промоакция не найдена'
      });
    }

    // Дополнительная аналитика из заказов
    const orderStats = await Order.aggregate([
      {
        $match: {
          'promoCode.code': promotion.code
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' },
          totalSavings: { $sum: '$promoCode.discount' },
          avgOrderValue: { $avg: '$pricing.total' },
          uniqueCustomers: { $addToSet: '$customer' }
        }
      }
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      totalSavings: 0,
      avgOrderValue: 0,
      uniqueCustomers: []
    };

    // Статистика по дням
    const dailyStats = await Order.aggregate([
      {
        $match: {
          'promoCode.code': promotion.code,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.total' },
          savings: { $sum: '$promoCode.discount' }
        }
      },
      {
        $addFields: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          }
        }
      },
      { $sort: { date: 1 } }
    ]);

    const analytics = {
      ...promotion.analytics,
      
      // Расширенные метрики
      totalOrders: stats.totalOrders,
      totalRevenue: stats.totalRevenue,
      totalSavings: stats.totalSavings,
      avgOrderValue: Math.round(stats.avgOrderValue || 0),
      uniqueCustomers: stats.uniqueCustomers.length,
      
      // Показатели эффективности
      conversionRate: promotion.analytics.attempts > 0 
        ? Math.round((promotion.analytics.successes / promotion.analytics.attempts) * 100)
        : 0,
      
      revenuePerUse: promotion.analytics.successes > 0
        ? Math.round(stats.totalRevenue / promotion.analytics.successes)
        : 0,
      
      // График по дням
      dailyChart: dailyStats.map(day => ({
        date: day.date,
        orders: day.orders,
        revenue: day.revenue,
        savings: day.savings
      })),
      
      // Общие показатели
      roi: stats.totalSavings > 0
        ? Math.round(((stats.totalRevenue - stats.totalSavings) / stats.totalSavings) * 100)
        : 0
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Ошибка получения аналитики промоакции:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения аналитики',
      message: error.message
    });
  }
};

/**
 * @desc    Автоматическое применение лучших промокодов
 * @route   POST /api/v1/promotions/auto-apply
 * @access  Public
 */
const autoApplyBestPromo = async (req, res) => {
  try {
    const { orderData } = req.body;
    const user = req.user; // Может быть undefined

    // Находим все активные автоматически применяемые промоакции
    const autoPromotions = await Promotion.findActivePromotions()
      .find({ 'settings.autoApply': true })
      .sort({ 'settings.priority': -1 });

    let bestPromotion = null;
    let maxDiscount = 0;

    // Проверяем каждую промоакцию
    for (const promotion of autoPromotions) {
      const validationResult = promotion.canUse(user, orderData);
      
      if (validationResult.valid) {
        const discount = promotion.calculateDiscount(orderData);
        
        if (discount > maxDiscount) {
          maxDiscount = discount;
          bestPromotion = promotion;
        }
      }
    }

    if (bestPromotion) {
      res.json({
        success: true,
        data: {
          promotion: {
            id: bestPromotion._id,
            code: bestPromotion.code,
            name: bestPromotion.name,
            type: bestPromotion.type
          },
          discountAmount: maxDiscount,
          message: `Автоматически применена лучшая скидка: ${maxDiscount} сум`
        }
      });
    } else {
      res.json({
        success: true,
        data: null,
        message: 'Нет доступных автоматических скидок для этого заказа'
      });
    }

  } catch (error) {
    console.error('Ошибка автоматического применения промокода:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка автоматического применения скидки'
    });
  }
};

module.exports = {
  getPromotions,
  getPublicPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  validatePromoCode,
  applyPromoCode,
  getPromotionAnalytics,
  autoApplyBestPromo
};