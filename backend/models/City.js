const mongoose = require('mongoose');

/**
 * 🏙️ МОДЕЛЬ ГОРОДА
 * Система городов Узбекистана с локализацией и доставкой
 */

const citySchema = new mongoose.Schema({
  // 🏷️ НАЗВАНИЕ
  name: {
    ru: { type: String, required: true, trim: true },
    uz: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true }
  },

  // 🔗 УНИКАЛЬНЫЙ КОД
  code: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    enum: [
      'tashkent', 'samarkand', 'bukhara', 'andijan', 'namangan', 
      'fergana', 'nukus', 'urgench', 'karshi', 'termez'
    ]
  },

  // 🗺️ ГЕОГРАФИЧЕСКИЕ КООРДИНАТЫ
  coordinates: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },

  // 🏛️ АДМИНИСТРАТИВНОЕ ДЕЛЕНИЕ
  region: {
    ru: { type: String, required: true },
    uz: { type: String, required: true },
    en: { type: String, required: true }
  },

  // 👥 ИНФОРМАЦИЯ О НАСЕЛЕНИИ
  population: {
    type: Number,
    min: 0
  },

  // 🕐 ЧАСОВОЙ ПОЯС
  timezone: {
    type: String,
    default: 'Asia/Tashkent'
  },

  // 🚚 НАСТРОЙКИ ДОСТАВКИ
  delivery: {
    isAvailable: {
      type: Boolean,
      default: true
    },

    methods: [{
      type: {
        type: String,
        enum: ['standard', 'express', 'pickup', 'same_day'],
        required: true
      },
      isAvailable: { type: Boolean, default: true },
      cost: { type: Number, min: 0, default: 0 },
      freeShippingThreshold: { type: Number, min: 0 }, // Бесплатная доставка от суммы
      estimatedDays: {
        min: { type: Number, min: 0 },
        max: { type: Number, min: 0 }
      },
      workingHours: {
        start: String, // "09:00"
        end: String    // "18:00"
      },
      workingDays: [{ 
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }]
    }],

    zones: [{ // Зоны доставки внутри города
      name: {
        ru: String,
        uz: String,
        en: String
      },
      districts: [String],
      cost: { type: Number, min: 0 },
      estimatedTime: String, // "2-4 часа"
      isActive: { type: Boolean, default: true }
    }]
  },

  // 📍 ПУНКТЫ ВЫДАЧИ
  pickupPoints: [{
    name: {
      ru: { type: String, required: true },
      uz: { type: String, required: true },
      en: { type: String, required: true }
    },
    address: {
      ru: { type: String, required: true },
      uz: { type: String, required: true },
      en: { type: String, required: true }
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    phone: String,
    workingHours: {
      weekdays: { start: String, end: String },
      weekends: { start: String, end: String }
    },
    isActive: { type: Boolean, default: true },
    notes: {
      ru: String,
      uz: String,
      en: String
    }
  }],

  // 💰 РЕГИОНАЛЬНЫЕ ЦЕНЫ
  pricing: {
    adjustmentFactor: {
      type: Number,
      default: 1.0,
      min: 0.1,
      max: 10.0
    }, // Коэффициент для цен (1.0 = базовые цены)
    
    currency: {
      type: String,
      default: 'UZS',
      enum: ['UZS', 'USD']
    }
  },

  // 📊 СТАТИСТИКА
  stats: {
    totalOrders: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    lastOrderDate: Date
  },

  // ✅ СТАТУС
  isActive: {
    type: Boolean,
    default: true
  },

  isVisible: {
    type: Boolean,
    default: true
  },

  // 📝 ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ
  description: {
    ru: String,
    uz: String,
    en: String
  },

  // 🔢 СОРТИРОВКА
  order: {
    type: Number,
    default: 0
  },

  // 🚨 ОСОБЕННОСТИ
  features: [{
    type: String,
    enum: ['capital', 'major_city', 'tourist_destination', 'industrial', 'border_city']
  }],

  // 📞 КОНТАКТНАЯ ИНФОРМАЦИЯ
  contacts: {
    phone: String,
    email: String,
    address: {
      ru: String,
      uz: String,
      en: String
    }
  },

  // 🌐 SEO
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },

  metaTitle: {
    ru: String,
    uz: String,
    en: String
  },

  metaDescription: {
    ru: String,
    uz: String,
    en: String
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔍 ВИРТУАЛЬНЫЕ ПОЛЯ
citySchema.virtual('displayName').get(function() {
  return this.name; // Будет зависеть от языка запроса
});

citySchema.virtual('availableDeliveryMethods').get(function() {
  return this.delivery.methods.filter(method => method.isAvailable);
});

citySchema.virtual('activePickupPoints').get(function() {
  return this.pickupPoints.filter(point => point.isActive);
});

citySchema.virtual('hasExpressDelivery').get(function() {
  return this.delivery.methods.some(method => 
    method.type === 'express' && method.isAvailable
  );
});

citySchema.virtual('hasSameDayDelivery').get(function() {
  return this.delivery.methods.some(method => 
    method.type === 'same_day' && method.isAvailable
  );
});

// 📊 ИНДЕКСЫ
citySchema.index({ code: 1 }, { unique: true });
citySchema.index({ slug: 1 }, { unique: true });
citySchema.index({ coordinates: '2dsphere' }); // Геопространственный индекс
citySchema.index({ isActive: 1, isVisible: 1 });
citySchema.index({ order: 1 });
citySchema.index({ 'delivery.isAvailable': 1 });

// 🔧 MIDDLEWARE
citySchema.pre('save', async function(next) {
  try {
    // Автогенерация slug
    if (this.isModified('name.ru') && !this.slug) {
      const baseSlug = this.name.ru
        .toLowerCase()
        .replace(/[^a-zа-я0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Проверка уникальности
      let slug = baseSlug;
      let counter = 1;
      
      while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      this.slug = slug;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// 📈 МЕТОДЫ
citySchema.methods.getDeliveryMethods = function(language = 'ru') {
  return this.delivery.methods
    .filter(method => method.isAvailable)
    .map(method => ({
      ...method.toObject(),
      displayName: this.getDeliveryMethodName(method.type, language)
    }));
};

citySchema.methods.getDeliveryMethodName = function(type, language = 'ru') {
  const names = {
    standard: {
      ru: 'Стандартная доставка',
      uz: 'Standart yetkazib berish',
      en: 'Standard delivery'
    },
    express: {
      ru: 'Экспресс доставка',
      uz: 'Ekspress yetkazib berish', 
      en: 'Express delivery'
    },
    pickup: {
      ru: 'Самовывоз',
      uz: 'O\'zi olib ketish',
      en: 'Pickup'
    },
    same_day: {
      ru: 'Доставка в тот же день',
      uz: 'O\'sha kuni yetkazib berish',
      en: 'Same day delivery'
    }
  };

  return names[type]?.[language] || type;
};

citySchema.methods.calculateDeliveryCost = function(orderValue, deliveryType = 'standard') {
  const method = this.delivery.methods.find(m => m.type === deliveryType);
  if (!method || !method.isAvailable) return null;

  // Проверка бесплатной доставки
  if (method.freeShippingThreshold && orderValue >= method.freeShippingThreshold) {
    return 0;
  }

  return method.cost;
};

citySchema.methods.isDeliveryAvailable = function(deliveryType = 'standard') {
  if (!this.delivery.isAvailable) return false;
  
  const method = this.delivery.methods.find(m => m.type === deliveryType);
  return method && method.isAvailable;
};

citySchema.methods.updateStats = async function() {
  const Order = require('./Order');
  const User = require('./User');

  const orderStats = await Order.aggregate([
    { 
      $match: { 
        'shippingAddress.city': this.code,
        status: 'delivered'
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalValue: { $sum: '$pricing.total' },
        lastOrder: { $max: '$createdAt' }
      }
    }
  ]);

  const customerCount = await User.countDocuments({ city: this.code });

  if (orderStats.length > 0) {
    const stats = orderStats[0];
    this.stats.totalOrders = stats.totalOrders;
    this.stats.averageOrderValue = Math.round(stats.totalValue / stats.totalOrders);
    this.stats.lastOrderDate = stats.lastOrder;
  }

  this.stats.totalCustomers = customerCount;
  
  return await this.save();
};

// Статические методы
citySchema.statics.getActiveCities = function(language = 'ru') {
  return this.find({ isActive: true, isVisible: true })
    .sort({ order: 1 })
    .select(`name.${language} code coordinates delivery.isAvailable`);
};

citySchema.statics.findByCoordinates = function(latitude, longitude, maxDistance = 50000) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // в метрах
      }
    },
    isActive: true
  });
};

citySchema.statics.getDeliveryInfo = function(cityCode) {
  return this.findOne({ code: cityCode, isActive: true })
    .select('name delivery pickupPoints');
};

module.exports = mongoose.model('City', citySchema);
