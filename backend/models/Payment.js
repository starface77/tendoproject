
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Связь с заказом
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },

  // Связь с пользователем
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Основная информация о платеже
  amount: {
    type: Number,
    required: [true, 'Сумма платежа обязательна'],
    min: [0, 'Сумма не может быть отрицательной']
  },

  currency: {
    type: String,
    default: 'UZS',
    enum: ['UZS', 'USD', 'EUR', 'RUB']
  },

  // Способ оплаты
  paymentMethod: {
    type: String,
    required: [true, 'Способ оплаты обязателен'],
    enum: [
      'click',           // Click
      'payme',           // Payme  
      'uzcard',          // UzCard
      'humo',            // Humo
      'visa',            // Visa
      'mastercard',      // MasterCard
      'cash_on_delivery', // Наличными при доставке
      'bank_transfer'    // Банковский перевод
    ]
  },

  // Статус платежа
  status: {
    type: String,
    required: true,
    enum: [
      'pending',    // Ожидает оплаты
      'processing', // В обработке
      'completed',  // Завершен успешно
      'failed',     // Ошибка
      'cancelled',  // Отменен
      'refunded'    // Возврат
    ],
    default: 'pending'
  },

  // Внешние ID от платежных систем
  externalIds: {
    click: {
      clickTransId: String,
      serviceId: String,
      merchantTransId: String
    },
    payme: {
      paymeTransId: String,
      accountId: String
    },
    bank: {
      transactionId: String,
      authCode: String
    }
  },

  // Детали платежной карты (зашифрованные)
  cardDetails: {
    maskedNumber: String,    // **** **** **** 1234
    cardType: String,        // visa, mastercard, uzcard, humo
    expiryMonth: Number,
    expiryYear: Number,
    holderName: String
  },

  // Информация о транзакции
  transactionInfo: {
    // Комиссии
    merchantFee: {
      type: Number,
      default: 0
    },
    systemFee: {
      type: Number,
      default: 0
    },
    
    // IP адрес для безопасности
    ipAddress: String,
    userAgent: String,
    
    // Попытки оплаты
    attempts: {
      type: Number,
      default: 1
    },
    
    // Причина ошибки
    errorCode: String,
    errorMessage: String,
    
    // Дополнительные данные от платежных систем
    providerResponse: mongoose.Schema.Types.Mixed
  },

  // Временные метки
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  
  // Возврат средств
  refund: {
    amount: Number,
    reason: String,
    refundedAt: Date,
    refundTransactionId: String
  },

  // Дополнительные поля
  description: String,
  notes: String,

  // Webhook данные для отладки
  webhookLogs: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    provider: String,
    payload: mongoose.Schema.Types.Mixed,
    processed: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Индексы для производительности
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMethod: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ 'externalIds.click.clickTransId': 1 });
paymentSchema.index({ 'externalIds.payme.paymeTransId': 1 });

// Виртуальные поля
paymentSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

paymentSchema.virtual('isPending').get(function() {
  return this.status === 'pending' || this.status === 'processing';
});

paymentSchema.virtual('isFailed').get(function() {
  return this.status === 'failed' || this.status === 'cancelled';
});

paymentSchema.virtual('canRefund').get(function() {
  return this.status === 'completed' && !this.refund;
});

paymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('uz-UZ').format(this.amount) + ' сум';
});

// Методы схемы
paymentSchema.methods.markAsProcessing = function() {
  this.status = 'processing';
  this.processedAt = new Date();
  return this.save();
};

paymentSchema.methods.markAsCompleted = function(transactionData = {}) {
  this.status = 'completed';
  this.completedAt = new Date();
  
  if (transactionData) {
    this.transactionInfo = { ...this.transactionInfo, ...transactionData };
  }
  
  return this.save();
};

paymentSchema.methods.markAsFailed = function(errorCode, errorMessage) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.transactionInfo.errorCode = errorCode;
  this.transactionInfo.errorMessage = errorMessage;
  
  return this.save();
};

paymentSchema.methods.processRefund = function(refundAmount, reason) {
  if (!this.canRefund) {
    throw new Error('Платеж не может быть возвращен');
  }

  this.status = 'refunded';
  this.refund = {
    amount: refundAmount || this.amount,
    reason: reason,
    refundedAt: new Date()
  };
  
  return this.save();
};

paymentSchema.methods.addWebhookLog = function(provider, payload) {
  this.webhookLogs.push({
    provider,
    payload,
    processed: false
  });
  
  return this.save();
};

// Статические методы
paymentSchema.statics.findByOrderId = function(orderId) {
  return this.find({ order: orderId }).populate('user', 'firstName lastName email').populate('order');
};

paymentSchema.statics.findPendingPayments = function() {
  return this.find({ 
    status: { $in: ['pending', 'processing'] },
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // За последние 24 часа
  }).populate('order').populate('user');
};

paymentSchema.statics.getPaymentStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

// Middleware для обновления заказа при изменении статуса
paymentSchema.post('save', async function(payment) {
  if (payment.isModified('status')) {
    const Order = mongoose.model('Order');
    
    try {
      const order = await Order.findById(payment.order);
      if (order) {
        if (payment.status === 'completed') {
          order.paymentStatus = 'paid';
          order.status = 'confirmed';
        } else if (payment.status === 'failed' || payment.status === 'cancelled') {
          order.paymentStatus = 'failed';
        }
        
        await order.save();
      }
    } catch (error) {
      console.error('Error updating order payment status:', error);
    }
  }
});

module.exports = mongoose.model('Payment', paymentSchema);





