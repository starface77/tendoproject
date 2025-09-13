/**
 * 📊 АНАЛИТИКА И СТАТИСТИКА
 * Система аналитики для маркетплейса
 */

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

/**
 * @desc    Общая статистика для админа
 * @route   GET /api/v1/analytics/admin/overview
 * @access  Private (Admin)
 */
const getAdminOverview = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Определяем период
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Параллельные запросы для получения статистики
    const [
      // Основные показатели
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      
      // Показатели за период
      newUsers,
      newProducts,
      newOrders,
      periodRevenue,
      
      // Статусы заказов
      ordersByStatus,
      
      // Топ категории
      topCategories,
      
      // Топ товары
      topProducts,
      
      // Активность по дням
      dailyStats,
      
      // Средний чек
      averageOrderValue,
      
      // Конверсия
      conversionStats
      
    ] = await Promise.all([
      // Общие счетчики
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      
      // За период
      User.countDocuments({ 
        role: 'customer', 
        createdAt: { $gte: startDate } 
      }),
      Product.countDocuments({ 
        status: 'active', 
        createdAt: { $gte: startDate } 
      }),
      Order.countDocuments({ 
        createdAt: { $gte: startDate } 
      }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      
      // Заказы по статусам
      Order.aggregate([
        { $group: { 
          _id: '$status', 
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }}
      ]),
      
      // Топ категории
      Product.aggregate([
        { $match: { status: 'active' } },
        { $group: { 
          _id: '$category', 
          productCount: { $sum: 1 },
          avgRating: { $avg: '$rating.average' }
        }},
        { $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }},
        { $unwind: '$category' },
        { $project: {
          name: '$category.name',
          productCount: 1,
          avgRating: 1
        }},
        { $sort: { productCount: -1 } },
        { $limit: 10 }
      ]),
      
      // Топ товары
      Product.find({ status: 'active' })
        .sort({ purchases: -1, 'rating.average': -1 })
        .select('name price purchases rating views')
        .populate('category', 'name')
        .limit(10)
        .lean(),
        
      // Статистика по дням
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.total' },
          customers: { $addToSet: '$customer' }
        }},
        { $addFields: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          uniqueCustomers: { $size: '$customers' }
        }},
        { $sort: { date: 1 } }
      ]),
      
      // Средний чек
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: {
          _id: null,
          averageOrderValue: { $avg: '$pricing.total' },
          minOrderValue: { $min: '$pricing.total' },
          maxOrderValue: { $max: '$pricing.total' }
        }}
      ]),
      
      // Конверсия (упрощенная версия)
      Promise.all([
        Product.aggregate([
          { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]),
        Order.countDocuments({ status: { $ne: 'cancelled' } })
      ])
    ]);

    // Обрабатываем данные
    const overview = {
      period,
      dateRange: { startDate, endDate: now },
      
      // Основные показатели
      metrics: {
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        
        // Рост за период
        newUsers: newUsers || 0,
        newProducts: newProducts || 0,
        newOrders: newOrders || 0,
        periodRevenue: periodRevenue[0]?.total || 0,
        
        // Средние показатели
        averageOrderValue: averageOrderValue[0]?.averageOrderValue || 0,
        minOrderValue: averageOrderValue[0]?.minOrderValue || 0,
        maxOrderValue: averageOrderValue[0]?.maxOrderValue || 0,
        
        // Конверсия (упрощенная)
        totalViews: conversionStats[0]?.[0]?.totalViews || 0,
        successfulOrders: conversionStats[1] || 0,
        conversionRate: conversionStats[0]?.[0]?.totalViews > 0 
          ? ((conversionStats[1] || 0) / (conversionStats[0]?.[0]?.totalViews || 1)) * 100 
          : 0
      },
      
      // Детальная статистика
      ordersByStatus: ordersByStatus.reduce((acc, status) => {
        acc[status._id] = {
          count: status.count,
          revenue: status.revenue
        };
        return acc;
      }, {}),
      
      topCategories: topCategories.map(cat => ({
        name: cat.name?.ru || cat.name?.uz || cat.name || 'Без названия',
        productCount: cat.productCount,
        avgRating: Math.round((cat.avgRating || 0) * 10) / 10
      })),
      
      topProducts: topProducts.map(product => ({
        id: product._id,
        name: product.name?.ru || product.name?.uz || product.name || 'Без названия',
        category: product.category?.name?.ru || 'Без категории',
        price: product.price,
        purchases: product.purchases || 0,
        views: product.views || 0,
        rating: Math.round((product.rating?.average || 0) * 10) / 10
      })),
      
      // График активности
      dailyStats: dailyStats.map(stat => ({
        date: stat.date,
        orders: stat.orders,
        revenue: stat.revenue,
        uniqueCustomers: stat.uniqueCustomers
      })),
      
      // Дополнительная аналитика
      insights: {
        growthRate: newOrders > 0 && totalOrders > newOrders 
          ? ((newOrders / (totalOrders - newOrders)) * 100).toFixed(1)
          : '0',
        revenueGrowth: periodRevenue[0]?.total > 0 && totalRevenue[0]?.total > periodRevenue[0]?.total
          ? (((periodRevenue[0].total / (totalRevenue[0].total - periodRevenue[0].total)) * 100)).toFixed(1)
          : '0'
      }
    };

    res.json({
      success: true,
      data: overview
    });

  } catch (error) {
    console.error('Ошибка получения аналитики админа:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения статистики',
      message: error.message
    });
  }
};

/**
 * @desc    Статистика для продавца
 * @route   GET /api/v1/analytics/seller/overview
 * @access  Private (Seller)
 */
const getSellerOverview = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { period = '30d' } = req.query;
    
    // Определяем период
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Получаем товары продавца
    const sellerProducts = await Product.find({ 
      $or: [
        { seller: sellerId },
        { createdBy: sellerId }
      ],
      status: 'active'
    }).select('_id').lean();

    const productIds = sellerProducts.map(p => p._id);

    if (productIds.length === 0) {
      return res.json({
        success: true,
        data: {
          metrics: {
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            totalViews: 0,
            avgRating: 0
          },
          message: 'У вас пока нет активных товаров'
        }
      });
    }

    const [
      // Основные показатели
      totalOrders,
      totalRevenue,
      periodOrders,
      periodRevenue,
      
      // Статистика товаров
      productStats,
      
      // Заказы по статусам
      ordersByStatus,
      
      // Топ товары продавца
      topProducts,
      
      // Отзывы
      reviewStats,
      
      // График продаж
      salesChart
      
    ] = await Promise.all([
      // Заказы с товарами продавца
      Order.countDocuments({
        'items.product': { $in: productIds }
      }),
      
      // Выручка
      Order.aggregate([
        { $match: { 'items.product': { $in: productIds } } },
        { $unwind: '$items' },
        { $match: { 'items.product': { $in: productIds } } },
        { $group: { _id: null, total: { $sum: '$items.subtotal' } } }
      ]),
      
      // Заказы за период
      Order.countDocuments({
        'items.product': { $in: productIds },
        createdAt: { $gte: startDate }
      }),
      
      // Выручка за период
      Order.aggregate([
        { 
          $match: { 
            'items.product': { $in: productIds },
            createdAt: { $gte: startDate }
          } 
        },
        { $unwind: '$items' },
        { $match: { 'items.product': { $in: productIds } } },
        { $group: { _id: null, total: { $sum: '$items.subtotal' } } }
      ]),
      
      // Статистика товаров
      Product.aggregate([
        { $match: { _id: { $in: productIds } } },
        { $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalPurchases: { $sum: '$purchases' },
          avgRating: { $avg: '$rating.average' },
          inStock: { $sum: { $cond: ['$isInStock', 1, 0] } },
          lowStock: { 
            $sum: { 
              $cond: [
                { $and: ['$isInStock', { $lte: ['$stock', '$lowStockThreshold'] }] }, 
                1, 
                0
              ] 
            } 
          }
        }}
      ]),
      
      // Заказы по статусам
      Order.aggregate([
        { $match: { 'items.product': { $in: productIds } } },
        { $group: { 
          _id: '$status', 
          count: { $sum: 1 }
        }}
      ]),
      
      // Топ товары
      Product.find({ _id: { $in: productIds } })
        .sort({ purchases: -1, views: -1 })
        .select('name price purchases views rating stock')
        .limit(10)
        .lean(),
        
      // Отзывы
      Review.aggregate([
        { $match: { product: { $in: productIds } } },
        { $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          positiveReviews: { $sum: { $cond: [{ $gte: ['$rating', 4] }, 1, 0] } }
        }}
      ]),
      
      // График продаж по дням
      Order.aggregate([
        { 
          $match: { 
            'items.product': { $in: productIds },
            createdAt: { $gte: startDate }
          } 
        },
        { $unwind: '$items' },
        { $match: { 'items.product': { $in: productIds } } },
        { $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          sales: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' }
        }},
        { $addFields: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          }
        }},
        { $sort: { date: 1 } }
      ])
    ]);

    const stats = productStats[0] || {
      totalProducts: 0,
      totalViews: 0,
      totalPurchases: 0,
      avgRating: 0,
      inStock: 0,
      lowStock: 0
    };

    const reviews = reviewStats[0] || {
      totalReviews: 0,
      avgRating: 0,
      positiveReviews: 0
    };

    const overview = {
      period,
      dateRange: { startDate, endDate: now },
      
      metrics: {
        totalProducts: stats.totalProducts,
        totalOrders: totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        periodOrders: periodOrders,
        periodRevenue: periodRevenue[0]?.total || 0,
        totalViews: stats.totalViews,
        totalPurchases: stats.totalPurchases,
        avgRating: Math.round((stats.avgRating || 0) * 10) / 10,
        inStockProducts: stats.inStock,
        lowStockProducts: stats.lowStock,
        
        // Отзывы
        totalReviews: reviews.totalReviews,
        avgReviewRating: Math.round((reviews.avgRating || 0) * 10) / 10,
        positiveReviews: reviews.positiveReviews,
        positiveReviewRate: reviews.totalReviews > 0 
          ? Math.round((reviews.positiveReviews / reviews.totalReviews) * 100)
          : 0
      },
      
      ordersByStatus: ordersByStatus.reduce((acc, status) => {
        acc[status._id] = status.count;
        return acc;
      }, {}),
      
      topProducts: topProducts.map(product => ({
        id: product._id,
        name: product.name?.ru || product.name?.uz || product.name || 'Без названия',
        price: product.price,
        purchases: product.purchases || 0,
        views: product.views || 0,
        rating: Math.round((product.rating?.average || 0) * 10) / 10,
        stock: product.stock
      })),
      
      salesChart: salesChart.map(day => ({
        date: day.date,
        sales: day.sales,
        revenue: day.revenue
      }))
    };

    res.json({
      success: true,
      data: overview
    });

  } catch (error) {
    console.error('Ошибка получения аналитики продавца:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения статистики продавца',
      message: error.message
    });
  }
};

/**
 * @desc    Экспорт данных в CSV
 * @route   GET /api/v1/analytics/export
 * @access  Private (Admin/Seller)
 */
const exportData = async (req, res) => {
  try {
    const { type = 'orders', period = '30d', format = 'json' } = req.query;
    
    // Определяем период
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    let data = [];
    let filename = '';

    switch (type) {
      case 'orders':
        data = await Order.find({
          createdAt: { $gte: startDate }
        })
        .populate('customer', 'firstName lastName email')
        .populate('items.product', 'name category')
        .lean();
        
        filename = `orders_${period}.json`;
        break;
        
      case 'products':
        data = await Product.find({
          status: 'active',
          createdAt: { $gte: startDate }
        })
        .populate('category', 'name')
        .select('name price stock purchases views rating createdAt')
        .lean();
        
        filename = `products_${period}.json`;
        break;
        
      case 'users':
        // Только для админов
        if (req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            error: 'Доступ запрещен'
          });
        }
        
        data = await User.find({
          createdAt: { $gte: startDate }
        })
        .select('firstName lastName email role createdAt isActive')
        .lean();
        
        filename = `users_${period}.json`;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Неизвестный тип экспорта'
        });
    }

    if (format === 'csv') {
      // Здесь можно добавить преобразование в CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename.replace('.json', '.csv')}`);
      
      // Простое CSV преобразование (можно улучшить)
      const csvData = data.map(item => Object.values(item).join(',')).join('\n');
      res.send(csvData);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.json({
        success: true,
        data,
        meta: {
          period,
          startDate,
          endDate: now,
          total: data.length
        }
      });
    }

  } catch (error) {
    console.error('Ошибка экспорта данных:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка экспорта данных',
      message: error.message
    });
  }
};

module.exports = {
  getAdminOverview,
  getSellerOverview,
  exportData
};







