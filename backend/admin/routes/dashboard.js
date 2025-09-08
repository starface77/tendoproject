const express = require('express');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const Review = require('../../models/Review');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * 📊 ДАШБОРД АДМИНКИ
 */

// Получить общую статистику
router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - 7));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Общие счетчики
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      todayOrders,
      weekOrders,
      monthOrders,
      pendingOrders,
      pendingReviews
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
      Review.countDocuments({ moderationStatus: 'pending' })
    ]);

    // Статистика заказов по статусам
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$pricing.total' }
        }
      }
    ]);

    // Топ товары
    const topProducts = await Product.find({ isActive: true })
      .sort({ purchases: -1, 'rating.average': -1 })
      .limit(5)
      .select('name images price purchases rating');

    // Последние заказы
    const recentOrders = await Order.find()
      .populate('customer', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber customer pricing.total status createdAt');

    // Активность по дням (последние 7 дней)
    const dailyActivity = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          todayOrders,
          weekOrders,
          monthOrders,
          pendingOrders,
          pendingReviews
        },
        orderStats: orderStats.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            totalValue: stat.totalValue
          };
          return acc;
        }, {}),
        topProducts,
        recentOrders,
        dailyActivity
      }
    });

  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения статистики'
    });
  }
});

// Получить статистику продаж
router.get('/sales', protect, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['delivered', 'shipped', 'processing'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: period === '24h' ? '%Y-%m-%d %H:00' : '%Y-%m-%d',
              date: '$createdAt' 
            }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.total' },
          averageOrder: { $avg: '$pricing.total' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        salesData
      }
    });

  } catch (error) {
    console.error('Sales Stats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения статистики продаж'
    });
  }
});

// Получить уведомления для админа
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = [];

    // Ожидающие заказы
    const pendingOrdersCount = await Order.countDocuments({ 
      status: 'pending' 
    });
    if (pendingOrdersCount > 0) {
      notifications.push({
        type: 'warning',
        title: 'Новые заказы',
        message: `${pendingOrdersCount} заказов ожидают обработки`,
        count: pendingOrdersCount,
        link: '/orders?status=pending'
      });
    }

    // Ожидающие отзывы
    const pendingReviewsCount = await Review.countDocuments({ 
      moderationStatus: 'pending' 
    });
    if (pendingReviewsCount > 0) {
      notifications.push({
        type: 'info',
        title: 'Модерация отзывов',
        message: `${pendingReviewsCount} отзывов ожидают проверки`,
        count: pendingReviewsCount,
        link: '/reviews?status=pending'
      });
    }

    // Товары с низким остатком
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true
    });
    if (lowStockProducts > 0) {
      notifications.push({
        type: 'warning',
        title: 'Низкий остаток',
        message: `${lowStockProducts} товаров заканчиваются на складе`,
        count: lowStockProducts,
        link: '/products?lowStock=true'
      });
    }

    // Неактивированные пользователи за последние 3 дня
    const unverifiedUsers = await User.countDocuments({
      isEmailVerified: false,
      createdAt: { $gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    });
    if (unverifiedUsers > 0) {
      notifications.push({
        type: 'info',
        title: 'Новые пользователи',
        message: `${unverifiedUsers} пользователей не подтвердили email`,
        count: unverifiedUsers,
        link: '/users?verified=false'
      });
    }

    res.status(200).json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Notifications Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения уведомлений'
    });
  }
});

module.exports = router;
