const mongoose = require('mongoose');

/**
 * 🎁 МОДЕЛЬ ПРОМОАКЦИЙ И ПРОМОКОДОВ
 * Система промокодов, скидок и программы лояльности
 */

const promotionSchema = new mongoose.Schema({
  // 🏷️ ОСНОВНАЯ ИНФОРМАЦИЯ
  name: {
    ru: { type: String, required: true },
    uz: { type: String, required: true },
    en: { type: String, required: true }
  },

  description: {
    ru: String,
    uz: String,
    en: String
  },

  // 🔑 КОД ПРОМОАКЦИИ
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },

  // 🎯 ТИП ПРОМОАКЦИИ
  type: {
    type: String,
    required: true,
    enum: [
      'percentage',      // Процентная скидка
      'fixed_amount',    // Фиксированная сумма скидки
      'free_shipping',   // Бесплатная доставка
      'buy_x_get_y',     // Купи X получи Y
      'cashback',        // Кешбэк
      'loyalty_points'   // Баллы лояльности
    ]
  },

  // 💰 ПАРАМЕТРЫ СКИДКИ
  discount: {
    value: { 
    type: Number,
      required: true,
      min: 0
    },
    
    // Максимальная скидка для процентных акций
    maxAmount: {
      type: Number,
      min: 0
    },
    
    // Минимальная сумма заказа для применения
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // 🛍️ УСЛОВИЯ ПРИМЕНЕНИЯ
  conditions: {
    // Минимальное количество товаров
    minQuantity: {
      type: Number,
      default: 1,
      min: 1
    },

    // Применимые категории
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],

    // Применимые товары
    products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],

    // Исключенные категории
    excludeCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],

    // Исключенные товары
    excludeProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],

    // Только для новых пользователей
    newCustomersOnly: {
      type: Boolean,
      default: false
    },

    // Только для определенных пользователей
    targetUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],

    // Уровни лояльности
    loyaltyLevels: [{
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum']
    }]
  },

  // 🕒 ВРЕМЕННЫЕ РАМКИ
  validFrom: {
    type: Date,
    required: true,
    default: Date.now
  },

  validUntil: {
    type: Date,
    required: true
  },

  // ⏰ АКТИВНЫЕ ЧАСЫ (опционально)
  activeHours: {
    start: String, // "09:00"
    end: String,   // "18:00"
    timezone: {
      type: String,
      default: 'Asia/Tashkent'
    }
  },

  // 📅 АКТИВНЫЕ ДНИ НЕДЕЛИ
  activeDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],

  // 🔢 ЛИМИТЫ ИСПОЛЬЗОВАНИЯ
  usage: {
    // Общий лимит использований
    totalLimit: {
      type: Number,
      min: 0
    },

    // Лимит на пользователя
    perUserLimit: {
    type: Number,
      default: 1,
      min: 1
  },

    // Текущее количество использований
    currentUsage: {
    type: Number,
      default: 0,
      min: 0
    },

    // История использований
    usageHistory: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      },
      usedAt: {
        type: Date,
        default: Date.now
      },
      discountAmount: Number
    }]
  },

  // 🎁 ДОПОЛНИТЕЛЬНЫЕ НАСТРОЙКИ
  settings: {
    // Можно комбинировать с другими промо
    combinable: {
      type: Boolean,
      default: false
    },

    // Автоматическое применение (без кода)
    autoApply: {
      type: Boolean,
      default: false
    },

    // Показывать в публичном списке
    public: {
      type: Boolean,
      default: true
    },

    // Приоритет (для автоматического применения)
    priority: {
    type: Number,
    default: 0
    }
  },

  // 📊 СТАТУС
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'expired', 'discontinued'],
    default: 'active'
  },

  // 👤 СОЗДАТЕЛЬ
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // 📈 АНАЛИТИКА
  analytics: {
    views: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    successes: { type: Number, default: 0 },
    totalSaved: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔍 ВИРТУАЛЬНЫЕ ПОЛЯ
promotionSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' &&
         now >= this.validFrom && 
         now <= this.validUntil &&
         (!this.usage.totalLimit || this.usage.currentUsage < this.usage.totalLimit);
});

promotionSchema.virtual('isExpired').get(function() {
  return new Date() > this.validUntil;
});

promotionSchema.virtual('usagePercentage').get(function() {
  if (!this.usage.totalLimit) return 0;
  return Math.round((this.usage.currentUsage / this.usage.totalLimit) * 100);
});

promotionSchema.virtual('conversionRate').get(function() {
  if (this.analytics.attempts === 0) return 0;
  return Math.round((this.analytics.successes / this.analytics.attempts) * 100);
});

// 📊 ИНДЕКСЫ
promotionSchema.index({ code: 1 }, { unique: true });
promotionSchema.index({ status: 1, validFrom: 1, validUntil: 1 });
promotionSchema.index({ type: 1, status: 1 });
promotionSchema.index({ validUntil: 1 });
promotionSchema.index({ 'conditions.categories': 1 });
promotionSchema.index({ 'conditions.products': 1 });

// 🔧 MIDDLEWARE
promotionSchema.pre('save', function(next) {
  // Автоматическое изменение статуса
  const now = new Date();

  if (now > this.validUntil && this.status === 'active') {
    this.status = 'expired';
  }
  
  if (this.usage.totalLimit && this.usage.currentUsage >= this.usage.totalLimit) {
    this.status = 'expired';
  }

  next();
});

// 📈 МЕТОДЫ
promotionSchema.methods.canUse = function(user, orderData) {
  const now = new Date();
  
  // Основные проверки
  if (!this.isActive) return { valid: false, reason: 'Промокод неактивен' };
  
  // Проверка времени
  if (now < this.validFrom || now > this.validUntil) {
    return { valid: false, reason: 'Промокод истек или еще не активен' };
  }
  
  // Проверка лимита использований
  if (this.usage.totalLimit && this.usage.currentUsage >= this.usage.totalLimit) {
    return { valid: false, reason: 'Достигнут лимит использований промокода' };
  }
  
  // Проверка лимита на пользователя
  if (user) {
    const userUsage = this.usage.usageHistory.filter(h => 
      h.user && h.user.toString() === user._id.toString()
    ).length;
    
    if (userUsage >= this.usage.perUserLimit) {
      return { valid: false, reason: 'Вы уже использовали этот промокод максимальное количество раз' };
    }
  }
  
  // Проверка только для новых пользователей
  if (this.conditions.newCustomersOnly && user) {
    // Проверяем, есть ли у пользователя завершенные заказы
    // Эту проверку нужно делать в контроллере с доступом к модели Order
  }
  
  // Проверка минимальной суммы заказа
  if (orderData && this.discount.minOrderAmount > 0) {
    if (orderData.subtotal < this.discount.minOrderAmount) {
      return { 
        valid: false, 
        reason: `Минимальная сумма заказа для применения промокода: ${this.discount.minOrderAmount} сум` 
      };
    }
  }
  
  // Проверка категорий и товаров (если указаны)
  if (orderData && orderData.items) {
    const hasValidItems = this.checkItemsEligibility(orderData.items);
    if (!hasValidItems.valid) {
      return hasValidItems;
    }
  }
  
  return { valid: true };
};

promotionSchema.methods.checkItemsEligibility = function(items) {
  // Если не указаны конкретные категории/товары, то все подходят
  if (this.conditions.categories.length === 0 && this.conditions.products.length === 0) {
    return { valid: true };
  }
  
  let validItems = 0;
  
  for (const item of items) {
    let itemValid = false;
    
    // Проверка на включенные товары
    if (this.conditions.products.length > 0) {
      if (this.conditions.products.includes(item.productId || item.product)) {
        itemValid = true;
      }
    }
    
    // Проверка на включенные категории
    if (this.conditions.categories.length > 0 && item.categoryId) {
      if (this.conditions.categories.includes(item.categoryId)) {
        itemValid = true;
      }
    }
    
    // Проверка на исключенные товары
    if (this.conditions.excludeProducts.includes(item.productId || item.product)) {
      itemValid = false;
    }
    
    // Проверка на исключенные категории
    if (item.categoryId && this.conditions.excludeCategories.includes(item.categoryId)) {
      itemValid = false;
    }
    
    if (itemValid) validItems++;
  }
  
  if (validItems === 0) {
    return { valid: false, reason: 'Промокод не применим к товарам в корзине' };
  }
  
  if (validItems < this.conditions.minQuantity) {
    return { 
      valid: false, 
      reason: `Нужно минимум ${this.conditions.minQuantity} подходящих товаров` 
    };
  }
  
  return { valid: true, validItems };
};

promotionSchema.methods.calculateDiscount = function(orderData) {
  let discountAmount = 0;
  
  switch (this.type) {
    case 'percentage':
      discountAmount = (orderData.subtotal * this.discount.value) / 100;
      
      // Применяем максимальный лимит если указан
      if (this.discount.maxAmount && discountAmount > this.discount.maxAmount) {
        discountAmount = this.discount.maxAmount;
      }
      break;
      
    case 'fixed_amount':
      discountAmount = Math.min(this.discount.value, orderData.subtotal);
      break;
      
    case 'free_shipping':
      discountAmount = orderData.shippingCost || 0;
      break;
      
    case 'cashback':
      // Кешбэк не уменьшает сумму заказа, а начисляется на счет
      discountAmount = (orderData.subtotal * this.discount.value) / 100;
      break;
      
    default:
      discountAmount = 0;
  }
  
  return Math.max(0, Math.round(discountAmount));
};

promotionSchema.methods.use = function(user, order, discountAmount) {
  // Увеличиваем счетчики
  this.usage.currentUsage += 1;
  this.analytics.successes += 1;
  this.analytics.totalSaved += discountAmount;
  
  // Добавляем в историю
  this.usage.usageHistory.push({
    user: user._id,
    order: order._id,
    usedAt: new Date(),
    discountAmount
  });
  
  return this.save();
};

// Статические методы
promotionSchema.statics.findActivePromotions = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $or: [
      { 'usage.totalLimit': { $exists: false } },
      { $expr: { $lt: ['$usage.currentUsage', '$usage.totalLimit'] } }
    ]
  });
};

promotionSchema.statics.findByCode = function(code) {
  return this.findOne({ 
    code: code.toUpperCase(),
    status: 'active'
  });
};

module.exports = mongoose.model('Promotion', promotionSchema);