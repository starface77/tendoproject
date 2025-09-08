const express = require('express');
const Order = require('../../models/Order');
const { protect, logAdminAction } = require('../middleware/auth');

const router = express.Router();

/**
 * 🛒 АДМИНСКИЕ МАРШРУТЫ ЗАКАЗОВ
 */

// Получить все заказы для админа
router.get('/', protect, logAdminAction('VIEW_ORDERS'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      city,
      paymentStatus,
      dateFrom,
      dateTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Фильтры
    if (status) query.status = status;
    if (city) query['shippingAddress.city'] = city;
    if (paymentStatus) query['payment.status'] = paymentStatus;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name images')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения заказов'
    });
  }
});

// Обновить статус заказа
router.patch('/:id/status', protect, logAdminAction('UPDATE_ORDER_STATUS'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    
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
});

module.exports = router;
