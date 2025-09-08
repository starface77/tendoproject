const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get current seller profile
// @route   GET /api/v1/sellers/me/profile
// @access  Private (Seller)
const getMe = async (req, res) => {
  try {
    const seller = await User.findById(req.user._id)
      .select('-password')
      .populate('reviews', 'rating comment createdAt');
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Продавец не найден'
      });
    }
    
    res.json({
      success: true,
      data: seller
    });
    
  } catch (error) {
    console.error('❌ Get seller profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения профиля'
    });
  }
};

// @desc    Get all sellers
// @route   GET /api/v1/admin/sellers
// @access  Private (Admin)
exports.getSellers = async (req, res) => {
  try {
    console.log('🏪 Получаем список продавцов...');
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status;
    const search = req.query.search;
    
    // Строим фильтр
    let filter = { role: 'seller' };
    
    if (status && status !== 'all') {
      if (status === 'active') {
        filter['sellerProfile.status'] = 'active';
      } else if (status === 'inactive') {
        filter['sellerProfile.status'] = 'inactive';
      } else if (status === 'suspended') {
        filter['sellerProfile.status'] = 'suspended';
      } else if (status === 'banned') {
        filter['sellerProfile.status'] = 'banned';
      }
    }
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'sellerProfile.businessName': { $regex: search, $options: 'i' } }
      ];
    }
    
    const startIndex = (page - 1) * limit;
    
    // Получаем продавцов
    const sellers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);
      
    const total = await User.countDocuments(filter);
    
    // Pagination result
    const pagination = {};
    
    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    console.log(`✅ Найдено ${sellers.length} продавцов из ${total}`);
    
    res.status(200).json({
      success: true,
      count: sellers.length,
      total,
      pagination,
      data: sellers
    });
    
  } catch (error) {
    console.error('❌ Ошибка получения продавцов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении продавцов'
    });
  }
};

// @desc    Get single seller
// @route   GET /api/v1/admin/sellers/:id
// @access  Private (Admin)
exports.getSeller = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id)
      .select('-password');
      
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({
        success: false,
        message: 'Продавец не найден'
      });
    }
    
    res.status(200).json({
      success: true,
      data: seller
    });
  } catch (error) {
    console.error('❌ Ошибка получения продавца:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении продавца'
    });
  }
};

// @desc    Suspend seller
// @route   PATCH /api/v1/admin/sellers/:id/suspend
// @access  Private (Admin)
exports.suspendSeller = async (req, res) => {
  try {
    console.log(`🔴 Блокируем продавца ${req.params.id}...`);
    
    const seller = await User.findById(req.params.id);
    
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({
        success: false,
        message: 'Продавец не найден'
      });
    }
    
    // Обновляем статус продавца
    if (!seller.sellerProfile) {
      seller.sellerProfile = {};
    }
    
    seller.sellerProfile.status = 'suspended';
    seller.sellerProfile.suspendedAt = new Date();
    seller.sellerProfile.suspendedBy = req.user._id;
    seller.sellerProfile.suspensionReason = req.body.reason || 'Нарушение правил';
    
    await seller.save();
    
    console.log(`✅ Продавец ${seller.username} заблокирован`);
    
    res.status(200).json({
      success: true,
      message: 'Продавец заблокирован',
      data: seller
    });
    
  } catch (error) {
    console.error('❌ Ошибка блокировки продавца:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при блокировке продавца'
    });
  }
};

// @desc    Unsuspend seller
// @route   PATCH /api/v1/admin/sellers/:id/unsuspend
// @access  Private (Admin)
exports.unsuspendSeller = async (req, res) => {
  try {
    console.log(`🟢 Разблокируем продавца ${req.params.id}...`);
    
    const seller = await User.findById(req.params.id);
    
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({
        success: false,
        message: 'Продавец не найден'
      });
    }
    
    // Обновляем статус продавца
    if (!seller.sellerProfile) {
      seller.sellerProfile = {};
    }
    
    seller.sellerProfile.status = 'active';
    seller.sellerProfile.unsuspendedAt = new Date();
    seller.sellerProfile.unsuspendedBy = req.user._id;
    
    await seller.save();
    
    console.log(`✅ Продавец ${seller.username} разблокирован`);
    
    res.status(200).json({
      success: true,
      message: 'Продавец разблокирован',
      data: seller
    });
    
  } catch (error) {
    console.error('❌ Ошибка разблокировки продавца:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при разблокировке продавца'
    });
  }
};

// @desc    Update seller commission
// @route   PATCH /api/v1/admin/sellers/:id/commission
// @access  Private (Admin)
exports.updateCommission = async (req, res) => {
  try {
    console.log(`💰 Обновляем комиссию продавца ${req.params.id}...`);
    
    const { commissionRate } = req.body;
    
    if (!commissionRate || commissionRate < 0 || commissionRate > 1) {
      return res.status(400).json({
        success: false,
        message: 'Комиссия должна быть от 0 до 1 (0-100%)'
      });
    }
    
    const seller = await User.findById(req.params.id);
    
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({
        success: false,
        message: 'Продавец не найден'
      });
    }
    
    // Обновляем комиссию
    if (!seller.sellerProfile) {
      seller.sellerProfile = {};
    }
    
    seller.sellerProfile.commissionRate = commissionRate;
    seller.sellerProfile.commissionUpdatedAt = new Date();
    seller.sellerProfile.commissionUpdatedBy = req.user._id;
    
    await seller.save();
    
    console.log(`✅ Комиссия продавца ${seller.username} обновлена на ${commissionRate * 100}%`);
    
    res.status(200).json({
      success: true,
      message: 'Комиссия обновлена',
      data: seller
    });
    
  } catch (error) {
    console.error('❌ Ошибка обновления комиссии:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении комиссии'
    });
  }
};

// @desc    Get seller analytics
// @route   GET /api/v1/admin/sellers/:id/analytics
// @access  Private (Admin)
exports.getSellerAnalytics = async (req, res) => {
  try {
    console.log(`📊 Получаем аналитику продавца ${req.params.id}...`);
    
    const seller = await User.findById(req.params.id);
    
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({
        success: false,
        message: 'Продавец не найден'
      });
    }
    
    // Здесь можно добавить реальную аналитику
    // Пока возвращаем базовую информацию
    const analytics = {
      sellerId: seller._id,
      businessName: seller.sellerProfile?.businessName || 'Не указано',
      totalProducts: 0, // TODO: Подсчитать из модели Product
      totalOrders: 0,   // TODO: Подсчитать из модели Order
      totalRevenue: 0,  // TODO: Подсчитать из модели Order
      commissionRate: seller.sellerProfile?.commissionRate || 0.05,
      status: seller.sellerProfile?.status || 'active',
      joinedAt: seller.createdAt,
      lastActivity: seller.updatedAt
    };
    
    console.log('✅ Аналитика продавца получена');
    
    res.status(200).json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('❌ Ошибка получения аналитики:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении аналитики'
    });
  }
};

/**
 * 👤 SELLER SELF ENDPOINTS (для фронтового кабинета продавца)
 */

// @desc    Профиль текущего продавца
// @route   GET /api/v1/sellers/me/profile
// @access  Private (Seller/Admin)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('❌ Seller getMe error:', error);
    res.status(500).json({ success: false, error: 'Ошибка получения профиля' });
  }
};

// @desc    Товары текущего продавца
// @route   GET /api/v1/sellers/me/products
// @access  Private (Seller/Admin)
exports.getSellerProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { createdBy: req.user._id };

    const [items, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name price stock isActive views purchases images createdAt'),
      Product.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      data: items
    });
  } catch (error) {
    console.error('❌ Seller products error:', error);
    res.status(500).json({ success: false, error: 'Ошибка получения товаров' });
  }
};

// @desc    Получить финансовые данные продавца
// @route   GET /api/v1/sellers/me/finance
// @access  Private (Seller/Admin)
exports.getFinance = async (req, res) => {
  try {
    console.log('💰 Запрос финансовых данных от пользователя:', req.user._id);
    
    const orders = await Order.find({ 'items.seller': req.user._id, status: 'paid' });
    
    let balance = 0;
    let monthlyRevenue = 0;
    let totalEarnings = 0;
    const recentTransactions = [];
    
    // Подсчитываем доходы
    orders.forEach(order => {
      const orderTotal = order.totalAmount || 0;
      totalEarnings += orderTotal;
      
      // Доходы за текущий месяц
      const orderDate = new Date(order.createdAt);
      const currentMonth = new Date().getMonth();
      if (orderDate.getMonth() === currentMonth) {
        monthlyRevenue += orderTotal;
      }
      
      // Добавляем в транзакции
      recentTransactions.push({
        id: order._id,
        type: 'sale',
        amount: orderTotal,
        description: `Продажа заказа #${order.orderNumber}`,
        date: order.createdAt,
        status: 'completed'
      });
    });
    
    balance = totalEarnings; // Упрощенно - весь доход как баланс
    
    res.status(200).json({
      success: true,
      data: {
        balance,
        monthlyRevenue,
        pendingPayouts: 0,
        totalEarnings,
        recentTransactions: recentTransactions.slice(0, 10),
        monthlyChart: [] // TODO: implement monthly chart data
      }
    });
  } catch (error) {
    console.error('❌ Seller finance error:', error);
    res.status(500).json({ success: false, error: 'Ошибка получения финансовых данных' });
  }
};

// @desc    Получить заказы продавца
// @route   GET /api/v1/sellers/me/orders
// @access  Private (Seller/Admin)
exports.getOrders = async (req, res) => {
  try {
    console.log('📦 Запрос заказов от пользователя:', req.user._id);
    
    const orders = await Order.find({ 'items.seller': req.user._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    const formattedOrders = orders.map(order => ({
      id: `#${order.orderNumber}`,
      customer: order.user?.name || 'Неизвестный покупатель',
      products: order.items?.length || 0,
      total: order.totalAmount || 0,
      status: order.status || 'pending',
      date: order.createdAt,
      items: order.items || []
    }));
    
    console.log('📊 Найдено заказов:', formattedOrders.length);
    
    res.status(200).json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('❌ Seller orders error:', error);
    res.status(500).json({ success: false, error: 'Ошибка получения заказов' });
  }
};

// @desc    Дашборд продавца (реальные данные)
// @route   GET /api/v1/sellers/me/dashboard
// @access  Private (Seller/Admin)
exports.getDashboard = async (req, res) => {
  try {
    console.log('🏪 Запрос дашборда от пользователя:', req.user._id);
    
    const products = await Product.find({ createdBy: req.user._id }).select('price stock isActive views purchases createdAt name');
    console.log('📦 Найдено товаров:', products.length);

    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;
    const lowStock = products.filter(p => (p.stock ?? 0) > 0 && p.stock <= (p.lowStockThreshold ?? 5)).length;
    const outOfStock = products.filter(p => (p.stock ?? 0) === 0).length;
    const viewsTotal = products.reduce((sum, p) => sum + (p.views || 0), 0);
    const purchasesTotal = products.reduce((sum, p) => sum + (p.purchases || 0), 0);
    const estimatedRevenue = products.reduce((sum, p) => sum + (p.price || 0) * (p.purchases || 0), 0);

    const recentProducts = [...products]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 6)
      .map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        isActive: p.isActive,
        views: p.views,
        purchases: p.purchases,
        createdAt: p.createdAt
      }));

    const dashboardData = {
      success: true,
      data: {
        stats: {
          totalProducts,
          activeProducts,
          lowStock,
          outOfStock,
          viewsTotal,
          purchasesTotal,
          estimatedRevenue
        },
        recentProducts
      }
    };

    console.log('📊 Отправляем данные дашборда:', JSON.stringify(dashboardData, null, 2));
    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('❌ Seller dashboard error:', error);
    res.status(500).json({ success: false, error: 'Ошибка дашборда продавца' });
  }
};

// @desc    Создать товар как продавец
// @route   POST /api/v1/sellers/me/products
// @access  Private (Seller/Admin)
exports.createSellerProduct = async (req, res) => {
  try {
    console.log('📦 Создание товара от продавца:', req.user._id);
    console.log('📋 Данные товара:', req.body);
    
    // Добавляем seller ID к данным товара
    const productData = {
      ...req.body,
      createdBy: req.user._id,
      seller: req.user._id
    };
    
    // Создаем товар
    const product = new Product(productData);
    await product.save();
    
    console.log('✅ Товар создан:', product._id);
    console.log('📝 Сохраненные данные товара:', JSON.stringify(product.toObject(), null, 2));
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('❌ Create seller product error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка создания товара',
      details: error.message 
    });
  }
};

// @desc    Обновить товар продавца
// @route   PUT /api/v1/sellers/me/products/:id
// @access  Private (Seller/Admin)
exports.updateSellerProduct = async (req, res) => {
  try {
    console.log('📝 Обновление товара:', req.params.id, 'от продавца:', req.user._id);
    
    const product = await Product.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Товар не найден или у вас нет прав на его редактирование'
      });
    }
    
    // Обновляем товар
    Object.assign(product, req.body);
    await product.save();
    
    console.log('✅ Товар обновлен:', product._id);
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('❌ Update seller product error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка обновления товара',
      details: error.message 
    });
  }
};

// @desc    Удалить товар продавца
// @route   DELETE /api/v1/sellers/me/products/:id
// @access  Private (Seller/Admin)
exports.deleteSellerProduct = async (req, res) => {
  try {
    console.log('🗑️ Удаление товара:', req.params.id, 'от продавца:', req.user._id);
    
    const product = await Product.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Товар не найден или у вас нет прав на его удаление'
      });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    console.log('✅ Товар удален:', req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Товар успешно удален'
    });
  } catch (error) {
    console.error('❌ Delete seller product error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка удаления товара',
      details: error.message 
    });
  }
};

// @desc    Get seller profile (public)
// @route   GET /api/v1/sellers/:sellerId
// @access  Public
const getSellerProfile = async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    // Находим продавца по ID
    const seller = await User.findById(sellerId)
      .select('firstName lastName name storeName verified rating reviewsCount location description createdAt')
      .where('role').in(['seller', 'admin']);
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Продавец не найден'
      });
    }
    
    // Считаем статистику
    const productsCount = await Product.countDocuments({ 
      seller: sellerId,
      status: 'active',
      isActive: true 
    });
    
    // Формируем ответ
    const sellerProfile = {
      ...seller.toObject(),
      productsCount,
      // Дополнительные поля если нужно
      joinDate: seller.createdAt
    };
    
    res.json({
      success: true,
      data: sellerProfile
    });
    
  } catch (error) {
    console.error('❌ Get seller profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения профиля продавца'
    });
  }
};

// @desc    Get seller products
// @route   GET /api/v1/sellers/me/products
// @access  Private (Seller)
const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: products
    });
    
  } catch (error) {
    console.error('❌ Get seller products error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения товаров'
    });
  }
};

// @desc    Get seller dashboard
// @route   GET /api/v1/sellers/me/dashboard
// @access  Private (Seller)
const getDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // Статистика
    const totalProducts = await Product.countDocuments({ seller: sellerId });
    const activeProducts = await Product.countDocuments({ seller: sellerId, status: 'active' });
    
    res.json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        totalOrders: 0,
        totalRevenue: 0
      }
    });
    
  } catch (error) {
    console.error('❌ Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения статистики'
    });
  }
};

// @desc    Get seller finance
// @route   GET /api/v1/sellers/me/finance
// @access  Private (Seller)
const getFinance = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        balance: 0,
        totalEarnings: 0,
        pendingPayments: 0
      }
    });
    
  } catch (error) {
    console.error('❌ Get finance error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения финансов'
    });
  }
};

// @desc    Get seller orders
// @route   GET /api/v1/sellers/me/orders
// @access  Private (Seller)
const getOrders = async (req, res) => {
  try {
    res.json({
      success: true,
      data: []
    });
    
  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения заказов'
    });
  }
};

// @desc    Create seller product
// @route   POST /api/v1/sellers/me/products
// @access  Private (Seller)
const createSellerProduct = async (req, res) => {
  try {
    console.log('📦 Создание товара от продавца:', req.user._id);
    console.log('📋 Данные товара:', req.body);
    
    const productData = { 
      ...req.body, 
      createdBy: req.user._id, 
      seller: req.user._id 
    };
    
    const product = new Product(productData);
    await product.save();
    
    console.log('✅ Товар создан:', product._id);
    console.log('📝 Сохраненные данные товара:', JSON.stringify(product.toObject(), null, 2));
    
    res.status(201).json({ 
      success: true, 
      data: product 
    });
    
  } catch (error) {
    console.error('❌ Create seller product error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка создания товара',
      details: error.message 
    });
  }
};

// @desc    Update seller product
// @route   PUT /api/v1/sellers/me/products/:id
// @access  Private (Seller)
const updateSellerProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Товар не найден'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
    
  } catch (error) {
    console.error('❌ Update seller product error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления товара'
    });
  }
};

// @desc    Delete seller product
// @route   DELETE /api/v1/sellers/me/products/:id
// @access  Private (Seller)
const deleteSellerProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      seller: req.user._id
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Товар не найден'
      });
    }
    
    res.json({
      success: true,
      message: 'Товар удален'
    });
    
  } catch (error) {
    console.error('❌ Delete seller product error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления товара'
    });
  }
};

module.exports = {
  getMe,
  getSellerProducts,
  getDashboard,
  getFinance,
  getOrders,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerProfile
};