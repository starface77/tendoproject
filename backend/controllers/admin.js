const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Chat = require('../models/Chat');
const Review = require('../models/Review');

/**
 * 📊 ADMIN CONTROLLER
 * Full admin panel with complete management capabilities
 */

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    // Get basic counts
    const [
      totalOrders,
      totalProducts,
      totalCategories,
      totalUsers,
      totalRevenue,
      activeProducts,
      pendingOrders,
      recentOrders
    ] = await Promise.all([
      Order.countDocuments({}),
      Product.countDocuments({}),
      Category.countDocuments({}),
      User.countDocuments({ role: { $ne: 'admin' } }),
      Order.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      Product.countDocuments({ isActive: true, status: 'active' }),
      Order.countDocuments({ status: 'pending' }),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('customer', 'firstName lastName email')
        .select('orderNumber pricing.total status createdAt')
    ]);

    // Calculate revenue
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // Get recent activity stats
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [
      ordersThisMonth,
      revenueThisMonth,
      newUsersThisMonth,
      newProductsThisMonth
    ] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: thirtyDaysAgo },
            'payment.status': 'paid'
          } 
        },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      User.countDocuments({ 
        createdAt: { $gte: thirtyDaysAgo },
        role: { $ne: 'admin' }
      }),
      Product.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    const monthlyRevenue = revenueThisMonth.length > 0 ? revenueThisMonth[0].total : 0;

    // Calculate additional stats for dashboard
    const gmv = revenue; // GMV = Gross Merchandise Value = Total Revenue
    const conversionRate = totalOrders > 0 ? ((totalOrders - pendingOrders) / totalOrders * 100) : 0;
    const activeSellers = await User.countDocuments({ role: 'seller', isActive: true });

    // Get top sellers
    const topSellers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          'payment.status': 'paid'
        }
      },
      {
        $group: {
          _id: '$seller',
          orders: { $sum: 1 },
          sales: { $sum: '$pricing.total' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'seller'
        }
      },
      { $unwind: '$seller' },
      {
        $project: {
          name: { $concat: ['$seller.firstName', ' ', '$seller.lastName'] },
          orders: 1,
          sales: 1
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        // Main stats
        orders: totalOrders,
        revenue: revenue,
        users: totalUsers,
        products: totalProducts,
        categories: totalCategories,

        // Dashboard specific stats
        gmv: gmv,
        conversionRate: conversionRate,
        activeSellers: activeSellers,

        // Additional stats
        activeProducts,
        pendingOrders,

        // Monthly stats
        ordersThisMonth,
        revenueThisMonth: monthlyRevenue,
        newUsersThisMonth,
        newProductsThisMonth,

        // Recent activity
        recentOrders: recentOrders.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          customer: order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Гость',
          amount: order.pricing.total,
          status: order.status,
          time: order.createdAt.toLocaleDateString('ru-RU')
        })),

        // Top sellers
        topSellers: topSellers
      }
    });

  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения статистики'
    });
  }
};

// @desc    Get analytics data
// @route   GET /api/v1/admin/analytics
// @access  Private (Admin)
const getAnalytics = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range based on period
    let dateRange;
    const now = new Date();
    
    switch (period) {
      case '1d':
        dateRange = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateRange = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get analytics data
    const [
      ordersByDay,
      revenueByDay,
      topCategories,
      topProducts,
      paymentMethodStats
    ] = await Promise.all([
      // Orders by day
      Order.aggregate([
        { $match: { createdAt: { $gte: dateRange } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            revenue: { $sum: '$pricing.total' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Revenue by day
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: dateRange },
            'payment.status': 'paid'
          } 
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$pricing.total' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Top categories
      Product.aggregate([
        {
          $group: {
            _id: '$category',
            productCount: { $sum: 1 },
            totalPurchases: { $sum: '$purchases' }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        {
          $project: {
            name: '$category.name.ru',
            productCount: 1,
            totalPurchases: 1
          }
        },
        { $sort: { totalPurchases: -1 } },
        { $limit: 10 }
      ]),
      
      // Top products
      Product.aggregate([
        { $match: { purchases: { $gt: 0 } } },
        {
          $project: {
            name: '$name.ru',
            purchases: 1,
            revenue: { $multiply: ['$price', '$purchases'] },
            views: 1
          }
        },
        { $sort: { purchases: -1 } },
        { $limit: 10 }
      ]),
      
      // Payment method statistics
      Order.aggregate([
        { $match: { createdAt: { $gte: dateRange } } },
        {
          $group: {
            _id: '$payment.method',
            count: { $sum: 1 },
            revenue: { $sum: '$pricing.total' }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange,
        ordersByDay,
        revenueByDay,
        topCategories,
        topProducts,
        paymentMethodStats
      }
    });

  } catch (error) {
    console.error('Get Analytics Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения аналитики'
    });
  }
};

// @desc    Get system health
// @route   GET /api/v1/admin/health
// @access  Private (Admin)
const getSystemHealth = async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Test database connection
    await Order.findOne().limit(1);
    const dbResponseTime = Date.now() - startTime;
    
    // Get system info in dashboard format
    const memUsage = process.memoryUsage();
    const totalMem = require('os').totalmem();
    const freeMem = require('os').freemem();

    // Calculate CPU usage (simplified)
    const cpuUsage = Math.floor(Math.random() * 30) + 20; // Mock CPU usage 20-50%
    const ramUsage = Math.floor(((totalMem - freeMem) / totalMem) * 100);
    const diskUsage = Math.floor(Math.random() * 40) + 30; // Mock disk usage 30-70%

    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        cpu: cpuUsage,
        ram: ramUsage,
        disk: diskUsage,
        queriesPerSecond: Math.floor(Math.random() * 100) + 50, // Mock QPS
        connections: Math.floor(Math.random() * 50) + 10, // Mock connections
        system: {
          nodeVersion: process.version,
          uptime: process.uptime(),
          platform: process.platform,
          dbResponseTime: dbResponseTime + 'ms'
        }
      }
    });

  } catch (error) {
    console.error('Get System Health Error:', error);
    res.status(503).json({
      success: false,
      error: 'Проблемы с работоспособностью системы',
      details: error.message
    });
  }
};

// ==================== USER MANAGEMENT ====================

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (role) query.role = role;
    if (status) query.isActive = status === 'active';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

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

// @desc    Update user
// @route   PUT /api/v1/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Пользователь обновлен',
      data: user
    });

  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления пользователя'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Пользователь удален'
    });

  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления пользователя'
    });
  }
};

// ==================== PRODUCT MANAGEMENT ====================

// @desc    Get all products for admin
// @route   GET /api/v1/admin/products
// @access  Private (Admin)
const getAdminProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      status,
      search,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { 'name.ru': { $regex: search, $options: 'i' } },
        { 'name.uz': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: products
    });

  } catch (error) {
    console.error('Get Admin Products Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения товаров'
    });
  }
};

// @desc    Create product (admin)
// @route   POST /api/v1/admin/products
// @access  Private (Admin)
const createAdminProduct = async (req, res) => {
  try {
    req.body.createdBy = req.user._id;
    const product = new Product(req.body);
    await product.save();

    await product.populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Товар создан',
      data: product
    });

  } catch (error) {
    console.error('Create Admin Product Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания товара'
    });
  }
};

// @desc    Update product (admin)
// @route   PUT /api/v1/admin/products/:id
// @access  Private (Admin)
const updateAdminProduct = async (req, res) => {
  try {
    req.body.updatedBy = req.user._id;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Товар не найден'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Товар обновлен',
      data: product
    });

  } catch (error) {
    console.error('Update Admin Product Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления товара'
    });
  }
};

// ==================== ORDER MANAGEMENT ====================

// @desc    Get all orders for admin
// @route   GET /api/v1/admin/orders
// @access  Private (Admin)
const getAdminOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      search,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query['payment.status'] = paymentStatus;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.firstName': { $regex: search, $options: 'i' } },
        { 'customerInfo.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('customer', 'firstName lastName email')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: orders
    });

  } catch (error) {
    console.error('Get Admin Orders Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения заказов'
    });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/v1/admin/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Заказ не найден'
      });
    }

    await order.updateStatus(status, notes, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Статус заказа обновлен',
      data: order
    });

  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления статуса заказа'
    });
  }
};

// ==================== CHAT MANAGEMENT ====================

// @desc    Get all chats for admin
// @route   GET /api/v1/admin/chats
// @access  Private (Admin)
const getAdminChats = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'active',
      search,
      sort = '-updatedAt'
    } = req.query;

    const query = { status };

    if (search) {
      query.$or = [
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'seller.businessName': { $regex: search, $options: 'i' } }
      ];
    }

    const chats = await Chat.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Chat.countDocuments(query);

    res.status(200).json({
      success: true,
      count: chats.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: chats
    });

  } catch (error) {
    console.error('Get Admin Chats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения чатов'
    });
  }
};

// ==================== CATEGORY MANAGEMENT ====================

// @desc    Get all categories for admin
// @route   GET /api/v1/admin/categories
// @access  Private (Admin)
const getAdminCategories = async (req, res) => {
  try {
    const categories = await Category.find({})
      .sort('order')
      .populate('parent', 'name');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });

  } catch (error) {
    console.error('Get Admin Categories Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения категорий'
    });
  }
};

// @desc    Create category (admin)
// @route   POST /api/v1/admin/categories
// @access  Private (Admin)
const createAdminCategory = async (req, res) => {
  try {
    console.log('📝 Создание категории, данные:', req.body);
    
    const { name, description, icon, color, isActive = true, isFeatured = false } = req.body;
    
    // Определяем название - может быть строкой или объектом
    let categoryName;
    if (typeof name === 'string') {
      // Если пришла простая строка
      categoryName = {
        ru: name,
        uz: name,
        en: name
      };
    } else if (typeof name === 'object' && name !== null) {
      // Если пришел объект
      categoryName = {
        ru: name.ru || name.name || 'Категория',
        uz: name.uz || name.name || 'Kategoriya',
        en: name.en || name.name || 'Category'
      };
    } else {
      // Дефолтные значения
      categoryName = {
        ru: 'Категория',
        uz: 'Kategoriya',
        en: 'Category'
      };
    }
    
    // Генерируем slug из русского названия (транслитерация)
    const transliterate = (text) => {
      const cyrillicToLatin = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
        'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
        'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
        'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
        'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
      };
      
      return text.split('').map(char => cyrillicToLatin[char] || char).join('');
    };
    
    const slug = categoryName.ru ? transliterate(categoryName.ru)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // убираем спец символы
      .replace(/\s+/g, '-') // пробелы в дефисы
      .replace(/-+/g, '-') // множественные дефисы в один
      .trim() : 'category-' + Date.now();
    
    // Аналогично для описания
    let categoryDescription;
    if (typeof description === 'string') {
      categoryDescription = {
        ru: description,
        uz: description,
        en: description
      };
    } else if (typeof description === 'object' && description !== null) {
      categoryDescription = {
        ru: description.ru || description.description || '',
        uz: description.uz || description.description || '',
        en: description.en || description.description || ''
      };
    } else {
      categoryDescription = {
        ru: '',
        uz: '',
        en: ''
      };
    }
    
    const categoryData = {
      name: categoryName,
      description: categoryDescription,
      slug,
      createdBy: req.user._id,
      isActive,
      isFeatured,
      icon: icon || '📦',
      color: color || '#3B82F6'
    };
    
    console.log('✅ Подготовленные данные категории:', categoryData);
    
    const category = new Category(categoryData);
    await category.save();

    res.status(201).json({
      success: true,
      message: 'Категория создана',
      data: category
    });

  } catch (error) {
    console.error('Create Admin Category Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания категории'
    });
  }
};

// ==================== REVIEW MANAGEMENT ====================

// @desc    Get all reviews for admin
// @route   GET /api/v1/admin/reviews
// @access  Private (Admin)
const getAdminReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'approved',
      rating,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (status) query.isApproved = status === 'approved';
    if (rating) query.rating = parseInt(rating);

    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName avatar')
      .populate('product', 'name images')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: reviews
    });

  } catch (error) {
    console.error('Get Admin Reviews Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения отзывов'
    });
  }
};

// @desc    Approve/Reject review
// @route   PUT /api/v1/admin/reviews/:id/status
// @access  Private (Admin)
const updateReviewStatus = async (req, res) => {
  try {
    const { isApproved } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    ).populate('user', 'firstName lastName').populate('product', 'name');

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Отзыв не найден'
      });
    }

    // Update product rating
    if (isApproved) {
      await review.product.updateRating();
    }

    res.status(200).json({
      success: true,
      message: `Отзыв ${isApproved ? 'одобрен' : 'отклонен'}`,
      data: review
    });

  } catch (error) {
    console.error('Update Review Status Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления статуса отзыва'
    });
  }
};

// ==================== SETTINGS MANAGEMENT ====================

// @desc    Get system settings
// @route   GET /api/v1/admin/settings
// @access  Private (Admin)
const getSystemSettings = async (req, res) => {
  try {
    // Mock settings - in real app would be from database
    const settings = {
      general: {
        siteName: 'Chexol.UZ',
        siteDescription: 'Магазин чехлов для телефонов',
        contactEmail: 'support@chexol.uz',
        contactPhone: '+998901234567',
        currency: 'UZS',
        language: 'ru'
      },
      orders: {
        autoConfirm: true,
        autoShip: false,
        allowGuestOrders: false,
        defaultShippingCost: 20000,
        freeShippingThreshold: 500000
      },
      payments: {
        clickEnabled: true,
        paymeEnabled: true,
        uzcardEnabled: true,
        cashOnDeliveryEnabled: true
      },
      security: {
        maxLoginAttempts: 5,
        sessionTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
        passwordMinLength: 6,
        requireEmailVerification: false
      }
    };

    res.status(200).json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Get System Settings Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения настроек'
    });
  }
};

// @desc    Update system settings
// @route   PUT /api/v1/admin/settings
// @access  Private (Admin)
const updateSystemSettings = async (req, res) => {
  try {
    // In real app, save to database
    const settings = req.body;

    res.status(200).json({
      success: true,
      message: 'Настройки сохранены',
      data: settings
    });

  } catch (error) {
    console.error('Update System Settings Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сохранения настроек'
    });
  }
};

// ==================== SELLER MANAGEMENT ====================

// @desc    Get all sellers
// @route   GET /api/v1/admin/sellers
// @access  Private (Admin)
const getSellers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sort = '-createdAt'
    } = req.query;

    const query = { role: 'seller' };

    if (status) query.isActive = status === 'active';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'sellerProfile.businessName': { $regex: search, $options: 'i' } }
      ];
    }

    const sellers = await User.find(query)
      .select('-password')
      .populate('sellerProfile')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sellers.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: sellers
    });

  } catch (error) {
    console.error('Get Sellers Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения продавцов'
    });
  }
};

// @desc    Get single seller
// @route   GET /api/v1/admin/sellers/:id
// @access  Private (Admin)
const getSeller = async (req, res) => {
  try {
    const seller = await User.findOne({ 
      _id: req.params.id, 
      role: 'seller' 
    })
      .select('-password')
      .populate('sellerProfile');

    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Продавец не найден'
      });
    }

    // Get seller stats
    const [productCount, orderCount, totalRevenue] = await Promise.all([
      Product.countDocuments({ seller: seller._id }),
      Order.countDocuments({ seller: seller._id }),
      Order.aggregate([
        { $match: { seller: seller._id, 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ])
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        ...seller.toObject(),
        stats: {
          productCount,
          orderCount,
          totalRevenue: revenue
        }
      }
    });

  } catch (error) {
    console.error('Get Seller Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения продавца'
    });
  }
};

// @desc    Suspend seller
// @route   PATCH /api/v1/admin/sellers/:id/suspend
// @access  Private (Admin)
const suspendSeller = async (req, res) => {
  try {
    const seller = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'seller' },
      { isActive: false, suspendedAt: new Date(), suspendedBy: req.user._id },
      { new: true }
    ).select('-password');

    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Продавец не найден'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Продавец заблокирован',
      data: seller
    });

  } catch (error) {
    console.error('Suspend Seller Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка блокировки продавца'
    });
  }
};

// @desc    Unsuspend seller
// @route   PATCH /api/v1/admin/sellers/:id/unsuspend
// @access  Private (Admin)
const unsuspendSeller = async (req, res) => {
  try {
    const seller = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'seller' },
      { 
        isActive: true, 
        $unset: { suspendedAt: 1, suspendedBy: 1 }
      },
      { new: true }
    ).select('-password');

    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Продавец не найден'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Продавец разблокирован',
      data: seller
    });

  } catch (error) {
    console.error('Unsuspend Seller Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка разблокировки продавца'
    });
  }
};

// @desc    Update seller commission
// @route   PATCH /api/v1/admin/sellers/:id/commission
// @access  Private (Admin)
const updateCommission = async (req, res) => {
  try {
    const { commission } = req.body;

    if (!commission || commission < 0 || commission > 100) {
      return res.status(400).json({
        success: false,
        error: 'Комиссия должна быть от 0 до 100%'
      });
    }

    const seller = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'seller' },
      { 'sellerProfile.commission': commission },
      { new: true }
    ).select('-password').populate('sellerProfile');

    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Продавец не найден'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Комиссия обновлена',
      data: seller
    });

  } catch (error) {
    console.error('Update Commission Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления комиссии'
    });
  }
};

// @desc    Get seller analytics
// @route   GET /api/v1/admin/sellers/:id/analytics
// @access  Private (Admin)
const getSellerAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const sellerId = req.params.id;

    // Calculate date range
    let dateRange;
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateRange = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get analytics data
    const [
      ordersByDay,
      revenueByDay,
      topProducts,
      orderStatusStats
    ] = await Promise.all([
      // Orders by day
      Order.aggregate([
        { $match: { seller: sellerId, createdAt: { $gte: dateRange } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            revenue: { $sum: '$pricing.total' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Revenue by day
      Order.aggregate([
        { 
          $match: { 
            seller: sellerId,
            createdAt: { $gte: dateRange },
            'payment.status': 'paid'
          } 
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$pricing.total' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Top products
      Product.aggregate([
        { $match: { seller: sellerId, purchases: { $gt: 0 } } },
        {
          $project: {
            name: '$name.ru',
            purchases: 1,
            revenue: { $multiply: ['$price', '$purchases'] },
            views: 1
          }
        },
        { $sort: { purchases: -1 } },
        { $limit: 10 }
      ]),
      
      // Order status statistics
      Order.aggregate([
        { $match: { seller: sellerId, createdAt: { $gte: dateRange } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            revenue: { $sum: '$pricing.total' }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange,
        ordersByDay,
        revenueByDay,
        topProducts,
        orderStatusStats
      }
    });

  } catch (error) {
    console.error('Get Seller Analytics Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения аналитики продавца'
    });
  }
};

module.exports = {
  // Dashboard
  getDashboardStats,
  getAnalytics,
  getSystemHealth,

  // User management
  getUsers,
  updateUser,
  deleteUser,

  // Product management
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,

  // Order management
  getAdminOrders,
  updateOrderStatus,

  // Chat management
  getAdminChats,

  // Category management
  getAdminCategories,
  createAdminCategory,

  // Review management
  getAdminReviews,
  updateReviewStatus,

  // Settings
  getSystemSettings,
  updateSystemSettings,

  // Seller management
  getSellers,
  getSeller,
  suspendSeller,
  unsuspendSeller,
  updateCommission,
  getSellerAnalytics
};