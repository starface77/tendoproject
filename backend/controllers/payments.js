/**
 * 💳 PAYMENT CONTROLLERS
 * Controllers for payment processing
 */

// Get payment methods
const getPaymentMethods = async (req, res) => {
  try {
    const methods = [
      {
        id: 'payme',
        name: 'Payme',
        description: 'Оплата через Payme',
        icon: '💳',
        enabled: true,
        fee: 0.02 // 2%
      },
      {
        id: 'click',
        name: 'Click',
        description: 'Оплата через Click',
        icon: '💳',
        enabled: true,
        fee: 0.02 // 2%
      },
      {
        id: 'uzcard',
        name: 'Uzcard',
        description: 'Оплата картой Uzcard',
        icon: '💳',
        enabled: true,
        fee: 0.015 // 1.5%
      },
      {
        id: 'cash',
        name: 'Наличные',
        description: 'Оплата наличными при получении',
        icon: '💵',
        enabled: true,
        fee: 0
      }
    ];

    res.status(200).json({
      success: true,
      data: methods
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения методов оплаты'
    });
  }
};

// Create payment
const createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, returnUrl } = req.body;
    
    console.log('💳 Creating payment:', { orderId, paymentMethod });
    
    // Валидация входных данных
    if (!orderId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Не указаны обязательные параметры'
      });
    }

    // Найти заказ
    const Order = require('../models/Order');
    const order = await Order.findById(orderId).populate('items.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Заказ не найден'
      });
    }

    // Проверить статус заказа
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Заказ отменен'
      });
    }

    // Создать платеж через PaymentService
    const PaymentService = require('../services/paymentService');
    const paymentService = new PaymentService();
    
    const paymentResult = await paymentService.createPaymentSession(order, paymentMethod);
    
    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        error: paymentResult.error || 'Ошибка создания платежа'
      });
    }

    // Сохранить платеж в базе данных
    const Payment = require('../models/Payment');
    const payment = new Payment({
      orderId: order._id,
      amount: order.pricing?.total || order.totalAmount,
      currency: 'UZS',
      paymentMethod,
      status: 'pending',
      sessionData: paymentResult.session,
      returnUrl: returnUrl || `${process.env.FRONTEND_URL}/payment/success`
    });

    await payment.save();
    
    console.log('✅ Payment created:', payment._id);

    // Обновить статус заказа
    order.paymentStatus = 'pending';
    order.paymentMethod = paymentMethod;
    await order.save();

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        paymentUrl: paymentResult.paymentUrl,
        paymentMethod: paymentResult.paymentMethod,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status
      }
    });

  } catch (error) {
    console.error('❌ Create payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания платежа'
    });
  }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    // TODO: Implement payment status check
    res.json({
      success: true,
      message: 'Payment status not implemented yet'
    });
  } catch (error) {
    console.error('❌ Get payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения статуса платежа'
    });
  }
};

// Handle Payme callback
const handlePaymeCallback = async (req, res) => {
  try {
    // TODO: Implement Payme callback
    res.json({
      success: true,
      message: 'Payme callback not implemented yet'
    });
  } catch (error) {
    console.error('❌ Payme callback error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обработки Payme callback'
    });
  }
};

// Handle Click2Pay callback
const handleClick2PayCallback = async (req, res) => {
  try {
    // TODO: Implement Click2Pay callback
    res.json({
      success: true,
      message: 'Click2Pay callback not implemented yet'
    });
  } catch (error) {
    console.error('❌ Click2Pay callback error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обработки Click2Pay callback'
    });
  }
};

// Handle Click webhook
const handleClickWebhook = async (req, res) => {
  try {
    // TODO: Implement Click webhook
    res.json({
      success: true,
      message: 'Click webhook not implemented yet'
    });
  } catch (error) {
    console.error('❌ Click webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обработки Click webhook'
    });
  }
};

// Create receipt
const createReceipt = async (req, res) => {
  try {
    // TODO: Implement receipt creation
    res.json({
      success: true,
      message: 'Receipt creation not implemented yet'
    });
  } catch (error) {
    console.error('❌ Create receipt error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания чека'
    });
  }
};

// Cancel receipt
const cancelReceipt = async (req, res) => {
  try {
    // TODO: Implement receipt cancellation
    res.json({
      success: true,
      message: 'Receipt cancellation not implemented yet'
    });
  } catch (error) {
    console.error('❌ Cancel receipt error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка отмены чека'
    });
  }
};

// @desc    Get payment by ID
// @route   GET /api/v1/payments/:id
// @access  Private
const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('order')
      .populate('user', 'firstName lastName email');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Платеж не найден'
      });
    }

    // Check if user owns this payment
    if (payment.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Доступ запрещен'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения платежа'
    });
  }
};

// @desc    Cancel payment
// @route   POST /api/v1/payments/:id/cancel
// @access  Private
const cancelPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Платеж не найден'
      });
    }

    // Check if user owns this payment
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Доступ запрещен'
      });
    }

    // Check if payment can be cancelled
    if (!['pending', 'processing'].includes(payment.status)) {
      return res.status(400).json({
        success: false,
        error: 'Платеж не может быть отменен'
      });
    }

    // Cancel the payment
    payment.status = 'cancelled';
    payment.failedAt = new Date();
    payment.transactionInfo.errorMessage = 'Отменено пользователем';
    await payment.save();

    // Update order
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = 'cancelled';
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: 'Платеж отменен',
      data: payment
    });

  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка отмены платежа'
    });
  }
};

// @desc    Process payment success callback
// @route   POST /api/v1/payments/success
// @access  Public
const paymentSuccess = async (req, res) => {
  try {
    const { paymentId, transactionId, orderId } = req.body;

    const payment = await Payment.findById(paymentId).populate('order');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Платеж не найден'
      });
    }

    // Mark payment as completed
    await payment.markAsCompleted({
      transactionId: transactionId,
      completedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Платеж успешно завершен',
      data: {
        payment: payment,
        order: payment.order
      }
    });

  } catch (error) {
    console.error('Payment success error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обработки успешного платежа'
    });
  }
};

// @desc    Process payment failure callback
// @route   POST /api/v1/payments/failure
// @access  Public
const paymentFailure = async (req, res) => {
  try {
    const { paymentId, errorCode, errorMessage } = req.body;

    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Платеж не найден'
      });
    }

    // Mark payment as failed
    await payment.markAsFailed(errorCode, errorMessage);

    res.status(200).json({
      success: true,
      message: 'Ошибка платежа зарегистрирована',
      data: payment
    });

  } catch (error) {
    console.error('Payment failure error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обработки неудачного платежа'
    });
  }
};

// @desc    Payme webhook handler
// @route   POST /api/v1/payments/webhook/payme
// @access  Public
const paymeWebhook = async (req, res) => {
  try {
    console.log('Payme webhook received:', req.body);
    // Немедленный 200/OK для провайдера
    res.status(200).json({ result: 'accepted' });

  } catch (error) {
    console.error('Payme webhook error:', error);
    res.status(500).json({ 
      error: { 
        code: -31001, 
        message: 'Internal server error' 
      } 
    });
  }
};

// @desc    Click webhook handler  
// @route   POST /api/v1/payments/webhook/click
// @access  Public
const clickWebhook = async (req, res) => {
  try {
    console.log('Click webhook received:', req.body);
    // Click ожидает 200 с телом error:0 даже при async
    res.status(200).json({ error: 0, note: 'accepted' });

  } catch (error) {
    console.error('Click webhook error:', error);
    res.status(200).json({ 
      error: -1,
      error_note: 'Internal server error' 
    });
  }
};

// @desc    Verify payment status
// @route   POST /api/v1/payments/:id/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('order');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Платеж не найден'
      });
    }

    // Check if user owns this payment
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Доступ запрещен'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        payment: payment,
        verification: { success: true }
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка проверки платежа'
    });
  }
};

// @desc    Get user payments
// @route   GET /api/v1/payments
// @access  Private
const getUserPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('order', 'orderNumber pricing status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения платежей'
    });
  }
};

module.exports = {
  getPaymentMethods,
  createPayment,
  getPayment,
  cancelPayment,
  paymentSuccess,
  paymentFailure,
  paymeWebhook,
  clickWebhook,
  verifyPayment,
  getUserPayments
};