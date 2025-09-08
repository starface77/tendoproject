const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const sellerSchema = new mongoose.Schema({
  // Связь с заявкой
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SellerApplication',
    required: true
  },

  // Связь с пользователем
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Основная информация
  businessName: {
    type: String,
    required: [true, 'Название компании обязательно'],
    trim: true,
    maxlength: [100, 'Название компании не может быть длиннее 100 символов']
  },
  displayName: {
    type: String,
    required: [true, 'Отображаемое название магазина обязательно'],
    trim: true,
    maxlength: [100, 'Название магазина не может быть длиннее 100 символов']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Описание не может быть длиннее 1000 символов']
  },
  
  // URL магазина (slug)
  storeUrl: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-z0-9-]+$/.test(v);
      },
      message: 'URL магазина может содержать только строчные буквы, цифры и дефисы'
    }
  },

  // Аутентификация
  email: {
    type: String,
    required: [true, 'Email обязателен'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Некорректный формат email'
    }
  },
  password: {
    type: String,
    required: [true, 'Пароль обязателен'],
    minlength: [6, 'Пароль должен содержать минимум 6 символов'],
    select: false // Не возвращать пароль в запросах по умолчанию
  },

  // Контактная информация
  contactName: {
    type: String,
    required: [true, 'Имя контактного лица обязательно'],
    trim: true,
    maxlength: [50, 'Имя не может быть длиннее 50 символов']
  },
  phone: {
    type: String,
    required: [true, 'Телефон обязателен'],
    validate: {
      validator: function(v) {
        return /^\+998[0-9]{9}$/.test(v);
      },
      message: 'Телефон должен быть в формате +998XXXXXXXXX'
    }
  },
  address: {
    type: String,
    required: [true, 'Адрес обязателен'],
    trim: true,
    maxlength: [200, 'Адрес не может быть длиннее 200 символов']
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Некорректный формат веб-сайта'
    }
  },

  // Категории товаров
  categories: [{
    type: String,
    required: true,
    enum: {
      values: [
        'Электроника',
        'Одежда и обувь',
        'Одежда',
        'Аксессуары',
        'Дом и сад',
        'Красота и здоровье',
        'Спорт и отдых',
        'Автотовары',
        'Детские товары',
        'Книги и канцелярия',
        'Продукты питания',
        'Подарки и сувениры'
      ],
      message: 'Недопустимая категория товаров'
    }
  }],

  // Режим работы
  workingHours: {
    monday: {
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' }
    },
    tuesday: {
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' }
    },
    wednesday: {
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' }
    },
    thursday: {
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' }
    },
    friday: {
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' }
    },
    saturday: {
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '10:00' },
      close: { type: String, default: '16:00' }
    },
    sunday: {
      isOpen: { type: Boolean, default: false },
      open: { type: String, default: '10:00' },
      close: { type: String, default: '16:00' }
    }
  },

  // Социальные сети
  socialMedia: {
    telegram: String,
    instagram: String,
    facebook: String,
    youtube: String
  },

  // Настройки
  settings: {
    autoAcceptOrders: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: true },
    showAddress: { type: Boolean, default: true },
    allowReviews: { type: Boolean, default: true },
    requireOrderApproval: { type: Boolean, default: true }
  },

  // Статус продавца
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'suspended', 'banned'],
      message: 'Недопустимый статус продавца'
    },
    default: 'active'
  },

  // Статистика
  stats: {
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },

  // Комиссия (в процентах)
  commissionRate: {
    type: Number,
    default: 8.5,
    min: [0, 'Комиссия не может быть отрицательной'],
    max: [50, 'Комиссия не может превышать 50%']
  },

  // Изображения
  logo: String,
  banner: String,

  // Верификация
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // Сброс пароля
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Блокировка
  suspendedUntil: Date,
  suspensionReason: String,

  // Последняя активность
  lastLoginAt: Date,
  lastActiveAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Индексы
sellerSchema.index({ email: 1 });
sellerSchema.index({ storeUrl: 1 });
sellerSchema.index({ status: 1 });
sellerSchema.index({ categories: 1 });
sellerSchema.index({ 'stats.averageRating': -1 });
sellerSchema.index({ businessName: 'text', displayName: 'text', description: 'text' });

// Виртуальные поля
sellerSchema.virtual('publicProfile').get(function() {
  return {
    id: this._id,
    displayName: this.displayName,
    description: this.description,
    storeUrl: this.storeUrl,
    categories: this.categories,
    logo: this.logo,
    banner: this.banner,
    stats: this.stats,
    workingHours: this.workingHours,
    socialMedia: this.socialMedia,
    phone: this.settings.showPhone ? this.phone : null,
    address: this.settings.showAddress ? this.address : null,
    website: this.website,
    joinedAt: this.createdAt
  };
});

sellerSchema.virtual('isActive').get(function() {
  return this.status === 'active' && (!this.suspendedUntil || this.suspendedUntil < new Date());
});

// Middleware - хеширование пароля
sellerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware - обновление lastActiveAt
sellerSchema.pre('save', function(next) {
  if (this.isNew) {
    this.lastActiveAt = new Date();
  }
  next();
});

// Методы экземпляра
sellerSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

sellerSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      type: 'seller',
      storeUrl: this.storeUrl 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

sellerSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  this.lastActiveAt = new Date();
  return this.save({ validateBeforeSave: false });
};

sellerSchema.methods.updateStats = async function() {
  const Order = mongoose.model('Order');
  const Product = mongoose.model('Product');
  const Review = mongoose.model('Review');

  try {
    // Подсчет заказов и выручки
    const orderStats = await Order.aggregate([
      { 
        $match: { 
          sellerId: this._id,
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);

    // Подсчет товаров
    const productCount = await Product.countDocuments({ sellerId: this._id });

    // Подсчет отзывов и среднего рейтинга
    const reviewStats = await Review.aggregate([
      { $match: { sellerId: this._id } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    // Обновление статистики
    this.stats = {
      totalOrders: orderStats[0]?.totalOrders || 0,
      totalRevenue: orderStats[0]?.totalRevenue || 0,
      totalProducts: productCount,
      totalReviews: reviewStats[0]?.totalReviews || 0,
      averageRating: reviewStats[0]?.averageRating || 0
    };

    return this.save({ validateBeforeSave: false });
  } catch (error) {
    console.error('Ошибка обновления статистики продавца:', error);
    throw error;
  }
};

sellerSchema.methods.suspend = function(reason, duration = 30) {
  this.status = 'suspended';
  this.suspensionReason = reason;
  this.suspendedUntil = new Date(Date.now() + duration * 24 * 60 * 60 * 1000); // дни в миллисекунды
  return this.save();
};

sellerSchema.methods.unsuspend = function() {
  this.status = 'active';
  this.suspensionReason = undefined;
  this.suspendedUntil = undefined;
  return this.save();
};

// Статические методы
sellerSchema.statics.findByStoreUrl = function(storeUrl) {
  return this.findOne({ storeUrl, status: 'active' });
};

sellerSchema.statics.searchSellers = function(query, options = {}) {
  const {
    page = 1,
    limit = 20,
    category,
    rating,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;

  const searchQuery = {
    status: 'active',
    ...(query && {
      $text: { $search: query }
    }),
    ...(category && {
      categories: category
    }),
    ...(rating && {
      'stats.averageRating': { $gte: rating }
    })
  };

  return this.find(searchQuery)
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('displayName description storeUrl categories logo stats workingHours');
};

sellerSchema.statics.getTopSellers = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'stats.averageRating': -1, 'stats.totalOrders': -1 })
    .limit(limit)
    .select('displayName description storeUrl categories logo stats');
};

module.exports = mongoose.model('Seller', sellerSchema);



