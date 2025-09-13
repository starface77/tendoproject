const mongoose = require('mongoose');

/**
 * 🛒 МОДЕЛЬ ЗАКАЗА
 * Система заказов с отслеживанием статуса и доставки
 */

const orderSchema = new mongoose.Schema({
  // 🔢 НОМЕР ЗАКАЗА
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },

  // 👤 КЛИЕНТ
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Данные клиента на момент заказа (для гостевых заказов или архива)
  customerInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    language: { type: String, enum: ['ru', 'uz', 'en'], default: 'ru' }
  },

  // 📦 ТОВАРЫ
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    
    // Снимок товара на момент заказа
    productSnapshot: {
      name: {
        ru: String,
        uz: String,
        en: String
      },
      image: String,
      sku: String
    },

    variant: {
      _id: mongoose.Schema.Types.ObjectId,
      name: {
        ru: String,
        uz: String,
        en: String
      },
      type: String,
      value: String
    },

    quantity: {
      type: Number,
      required: true,
      min: [1, 'Количество должно быть больше 0']
    },

    price: {
      type: Number,
      required: true,
      min: [0, 'Цена не может быть отрицательной']
    },

    originalPrice: Number,
    
    subtotal: {
      type: Number,
      required: true
    }
  }],

  // 💰 СТОИМОСТЬ
  pricing: {
    subtotal: { type: Number, required: true }, // Сумма товаров
    shipping: { type: Number, default: 0 },     // Доставка
    tax: { type: Number, default: 0 },          // Налоги
    discount: { type: Number, default: 0 },     // Скидка
    total: { type: Number, required: true }     // Итого
  },

  currency: {
    type: String,
    default: 'UZS',
    enum: ['UZS', 'USD', 'RUB']
  },

  // 🏷️ ПРОМОКОДЫ И СКИДКИ
  promoCode: {
    code: String,
    type: { type: String, enum: ['percentage', 'fixed'] },
    value: Number,
    discount: Number
  },

  // 📍 АДРЕС ДОСТАВКИ
  shippingAddress: {
    city: {
      type: String,
      required: true,
      enum: ['tashkent', 'samarkand', 'bukhara', 'andijan', 'namangan', 'fergana', 'nukus', 'urgench', 'karshi', 'termez']
    },
    district: String,
    street: { type: String, required: true },
    building: { type: String, required: true },
    apartment: String,
    floor: String,
    entrance: String,
    intercom: String,
    notes: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },

  // 🚚 ДОСТАВКА
  delivery: {
    method: {
      type: String,
      required: true,
      enum: ['standard', 'express', 'pickup', 'same_day'],
      default: 'standard'
    },
    
    cost: { type: Number, default: 0 },
    
    estimatedDate: Date,
    actualDate: Date,
    
    trackingNumber: String,
    
    courier: {
      name: String,
      phone: String,
      rating: Number
    },
    
    notes: String,
    
    attempts: [{
      date: { type: Date, default: Date.now },
      status: { type: String, enum: ['attempted', 'delivered', 'failed'] },
      notes: String
    }]
  },

  // 💳 ОПЛАТА
  payment: {
    method: {
      type: String,
      required: true,
      enum: ['cash', 'card', 'transfer', 'click', 'payme', 'uzcard'],
      default: 'cash'
    },
    
    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending'
    },
    
    transactionId: String,
    
    paidAmount: { type: Number, default: 0 },
    refundedAmount: { type: Number, default: 0 },
    
    paidAt: Date,
    
    gateway: {
      provider: String, // click, payme, uzcard
      response: mongoose.Schema.Types.Mixed
    }
  },

  // 📊 СТАТУС ЗАКАЗА
  status: {
    type: String,
    enum: [
      'pending',        // Ожидает обработки
      'confirmed',      // Подтвержден
      'processing',     // В обработке
      'packed',         // Упакован
      'shipped',        // Отправлен
      'out_for_delivery', // В доставке
      'delivered',      // Доставлен
      'cancelled',      // Отменен
      'returned'        // Возвращен
    ],
    default: 'pending'
  },

  // 💳 СТАТУС ОПЛАТЫ
  paymentStatus: {
    type: String,
    enum: [
      'pending',      // Ожидает оплаты
      'processing',   // Оплата обрабатывается
      'paid',         // Оплачен
      'failed',       // Ошибка оплаты
      'refunded',     // Возврат средств
      'partial'       // Частичная оплата
    ],
    default: 'pending'
  },

  // 💳 СПОСОБ ОПЛАТЫ
  paymentMethod: {
    type: String,
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

  // 📅 ИСТОРИЯ СТАТУСОВ
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // 🔔 УВЕДОМЛЕНИЯ
  notifications: {
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    sentNotifications: [{
      type: { type: String, enum: ['sms', 'email'] },
      event: String, // order_confirmed, shipped, delivered, etc.
      sentAt: { type: Date, default: Date.now },
      success: Boolean
    }]
  },

  // ⭐ ОТЗЫВ И ОЦЕНКА
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedAt: Date
  },

  // 📝 ЗАМЕТКИ
  notes: {
    customer: String,    // Заметки клиента
    internal: String,    // Внутренние заметки
    courier: String      // Заметки курьера
  },

  // 🎯 ИСТОЧНИК ЗАКАЗА
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'telegram', 'call_center', 'admin_panel'],
    default: 'website'
  },

  // 📱 УСТРОЙСТВО И БРАУЗЕР
  userAgent: String,
  ipAddress: String,

  // 🔄 ВОЗВРАТЫ И ОБМЕНЫ
  returns: [{
    items: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      reason: String
    }],
    status: { type: String, enum: ['requested', 'approved', 'rejected', 'completed'] },
    refundAmount: Number,
    requestedAt: { type: Date, default: Date.now },
    processedAt: Date,
    notes: String
  }],

  // 📊 АНАЛИТИКА
  analytics: {
    referrer: String,
    utm_source: String,
    utm_medium: String,
    utm_campaign: String,
    utm_term: String,
    utm_content: String
  },

  // ❌ ОТМЕНА
  cancellation: {
    reason: String,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: Date,
    refundAmount: Number,
    refundStatus: { type: String, enum: ['pending', 'processed', 'failed'] }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔍 ВИРТУАЛЬНЫЕ ПОЛЯ
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

orderSchema.virtual('isDelivered').get(function() {
  return this.status === 'delivered';
});

orderSchema.virtual('isPaid').get(function() {
  return this.payment.status === 'paid';
});

orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed', 'processing'].includes(this.status);
});

orderSchema.virtual('deliveryStatus').get(function() {
  const statusMap = {
    'pending': 'Ожидает обработки',
    'confirmed': 'Подтвержден',
    'processing': 'В обработке',
    'packed': 'Упакован',
    'shipped': 'Отправлен',
    'out_for_delivery': 'В доставке',
    'delivered': 'Доставлен',
    'cancelled': 'Отменен',
    'returned': 'Возвращен'
  };
  return statusMap[this.status] || this.status;
});

// 📊 ИНДЕКСЫ
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shippingAddress.city': 1 });
orderSchema.index({ 'delivery.estimatedDate': 1 });

// 🔧 MIDDLEWARE
orderSchema.pre('save', function(next) {
  // Автогенерация номера заказа
  if (this.isNew || !this.orderNumber) {
    const prefix = 'CHX';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `${prefix}${timestamp}${random}`;
  }

  // Пересчет общей стоимости
  this.pricing.subtotal = this.items.reduce((total, item) => {
    item.subtotal = item.price * item.quantity;
    return total + item.subtotal;
  }, 0);

  this.pricing.total = this.pricing.subtotal + this.pricing.shipping + this.pricing.tax - this.pricing.discount;

  // Добавление в историю статусов
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      date: new Date(),
      notes: `Статус изменен на: ${this.status}`
    });
  }

  next();
});

// 📈 МЕТОДЫ
orderSchema.methods.updateStatus = async function(newStatus, notes, updatedBy) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    date: new Date(),
    notes,
    updatedBy
  });
  
  return await this.save();
};

orderSchema.methods.addPayment = async function(amount, transactionId, method) {
  this.payment.paidAmount += amount;
  this.payment.transactionId = transactionId;
  this.payment.method = method;
  this.payment.paidAt = new Date();
  
  if (this.payment.paidAmount >= this.pricing.total) {
    this.payment.status = 'paid';
  }
  
  return await this.save();
};

orderSchema.methods.canBeReturned = function() {
  const returnWindow = 14 * 24 * 60 * 60 * 1000; // 14 дней
  return this.isDelivered && 
         this.delivery.actualDate && 
         (new Date() - this.delivery.actualDate) <= returnWindow;
};

// Статические методы
orderSchema.statics.generateOrderNumber = function() {
  const prefix = 'CHX';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

orderSchema.statics.getOrdersByStatus = function(status, limit = 50) {
  return this.find({ status })
    .populate('customer', 'firstName lastName email phone')
    .populate('items.product', 'name images price')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Order', orderSchema);
