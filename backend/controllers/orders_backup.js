const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * 🛒 КОНТРОЛЛЕР ЗАКАЗОВ
 * CRUD операции с заказами, управление статусами
 */

// @desc    Получить все заказы (админ)
// @route   GET /api/v1/orders
// @access  Private (Admin/Moderator)
const getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      city,
      paymentStatus,
      dateFrom,
      dateTo,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (city) query['shippingAddress.city'] = city;
    if (paymentStatus) query['payment.status'] = paymentStatus;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const orders = await Order.find(query)
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name images price')
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
    console.log("❌ ERROR:", error.message, error.stack);
    console.log("❌ ORDER ERROR:", error.message);
    console.error('Get Orders Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения заказов'
    });
  }
};

// @desc    Получить заказ по ID
// @route   GET /api/v1/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name images price brand model')
      .populate('statusHistory.updatedBy', 'firstName lastName');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Заказ не найден'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.log("❌ ERROR:", error.message, error.stack);
    console.log("❌ ORDER ERROR:", error.message);
    console.error('Get Order Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения заказа'
    });
  }
};

// @desc    Создать заказ
// @route   POST /api/v1/orders
// @access  Private
const createOrder = async (req, res) => {
    console.log("🛒 CREATE ORDER START - Body:", JSON.stringify(req.body, null, 2));
  try {
    const errors = validationResult(req);
    console.log("🔍 VALIDATION CHECK:", errors.isEmpty() ? "✅ No errors" : "❌ Errors found:", errors.array());
    console.log("🔍 VALIDATION CHECK - Errors:", errors.isEmpty() ? "None" : errors.array());
    console.log("📋 Processing order...");
    console.log("📋 Starting order processing...");
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    // Добавляем значения по умолчанию
    req.body.shippingAddress = req.body.shippingAddress || { city: "tashkent", street: "Default", building: "1" };
    req.body.payment = req.body.payment || { method: "cash" };
    const { items, shippingAddress, payment, delivery, notes } = req.body;

    // Проверяем товары и их наличие
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Товар с ID ${item.product} не найден`
        });
      }

      if (!product.isActive || product.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: `Товар "${product.name.ru}" недоступен`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Недостаточно товара "${product.name.ru}" на складе. Доступно: ${product.stock}`
        });
      }

      const itemPrice = product.price;
      const itemSubtotal = itemPrice * item.quantity;

      orderItems.push({
        product: product._id,
        productSnapshot: {
          name: { ru: product.name, uz: product.name, en: product.name },
          image: product.primaryImage,
          sku: product.sku || `${product.brand}-${product.model}`
        },
        variant: item.variant,
        quantity: item.quantity,
        price: itemPrice,
        originalPrice: product.originalPrice,
        subtotal: itemSubtotal
      });

      subtotal += itemSubtotal;
    }

    // Расчет доставки (упрощенная версия)
    const shippingCost = delivery?.method === 'express' ? 50000 : 
                        delivery?.method === 'same_day' ? 100000 : 20000;

    // Создание заказа
    const orderData = {
      orderNumber: `CHX${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
      customer: req.user._id,
      customerInfo: {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
        language: req.user.language
      },
      items: orderItems,
      pricing: {
        subtotal,
        shipping: shippingCost,
        tax: 0,
        discount: 0,
        total: subtotal + shippingCost
      },
      shippingAddress,
      delivery: {
        method: delivery?.method || 'standard',
        cost: shippingCost,
        estimatedDate: new Date(Date.now() + (delivery?.method === 'same_day' ? 1 : 3) * 24 * 60 * 60 * 1000)
      },
      payment: {
        method: payment.method,
        status: 'pending'
      },
      notes: {
        customer: notes
      },
      source: req.get('User-Agent')?.includes('Mobile') ? 'mobile_app' : 'website',
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    };

    const order = new Order(orderData);
    await order.save();

    // Уменьшаем количество товаров на складе
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, purchases: item.quantity }
      });
    }

    // Обновляем статистику пользователя
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalOrders: 1, totalSpent: order.pricing.total }
    });

    await order.populate([
      { path: 'customer', select: 'firstName lastName email phone' },
      { path: 'items.product', select: 'name images price brand model' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Заказ успешно создан',
      data: order
    });

  } catch (error) {
    console.log("❌ ERROR:", error.message, error.stack);
    console.log("❌ ORDER ERROR:", error.message);
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания заказа'
    });
  }
};

// @desc    Обновить заказ
// @route   PUT /api/v1/orders/:id
// @access  Private (Admin)
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Заказ не найден'
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name images price');

    res.status(200).json({
      success: true,
      message: 'Заказ успешно обновлен',
      data: updatedOrder
    });

  } catch (error) {
    console.log("❌ ERROR:", error.message, error.stack);
    console.log("❌ ORDER ERROR:", error.message);
    console.error('Update Order Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления заказа'
    });
  }
};

// @desc    Удалить заказ
// @route   DELETE /api/v1/orders/:id
// @access  Private (Super Admin)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Заказ не найден'
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Заказ успешно удален'
    });

  } catch (error) {
    console.log("❌ ERROR:", error.message, error.stack);
    console.log("❌ ORDER ERROR:", error.message);
    console.error('Delete Order Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления заказа'
    });
  }
};

// @desc    Получить заказы пользователя
// @route   GET /api/v1/orders/my
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sort = '-createdAt' } = req.query;

    const query = { customer: req.user._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('items.product', 'name images price brand model')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-customerInfo -userAgent -ipAddress');

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
    console.log("❌ ERROR:", error.message, error.stack);
    console.log("❌ ORDER ERROR:", error.message);
    console.error('Get My Orders Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения заказов'
    });
  }
};

// @desc    Отменить заказ
// @route   PATCH /api/v1/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Заказ не найден'
      });
    }

    if (!order.canBeCancelled) {
      return res.status(400).json({
        success: false,
        error: 'Заказ нельзя отменить на текущем этапе'
      });
    }

    order.status = 'cancelled';
    order.cancellation = {
      reason,
      cancelledBy: req.user._id,
      cancelledAt: new Date()
    };

    await order.updateStatus('cancelled', `Заказ отменен: ${reason}`, req.user._id);

    // Возвращаем товары на склад
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, purchases: -item.quantity }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Заказ успешно отменен',
      data: order
    });

  } catch (error) {
    console.log("❌ ERROR:", error.message, error.stack);
    console.log("❌ ORDER ERROR:", error.message);
    console.error('Cancel Order Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка отмены заказа'
    });
  }
};

// @desc    Обновить статус заказа
// @route   PATCH /api/v1/orders/:id/status
// @access  Private (Admin/Moderator)
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
    console.log("❌ ERROR:", error.message, error.stack);
    console.log("❌ ORDER ERROR:", error.message);
    console.error('Update Order Status Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления статуса заказа'
    });
  }
};

// @desc    Отследить заказ
// @route   GET /api/v1/orders/track/:orderNumber
// @access  Public
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      orderNumber: req.params.orderNumber 
    })
      .select('orderNumber status statusHistory delivery shippingAddress.city pricing.total createdAt')
      .populate('statusHistory.updatedBy', 'firstName lastName');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Заказ не найден'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        deliveryStatus: order.deliveryStatus,
        statusHistory: order.statusHistory,
        delivery: {
          method: order.delivery.method,
          estimatedDate: order.delivery.estimatedDate,
          trackingNumber: order.delivery.trackingNumber
        },
        city: order.shippingAddress.city,
        total: order.pricing.total,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.log("❌ ERROR:", error.message, error.stack);
    console.log("❌ ORDER ERROR:", error.message);
    console.error('Track Order Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка отслеживания заказа'
    });
  }
};

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getMyOrders,
  cancelOrder,
  updateOrderStatus,
  trackOrder
};
