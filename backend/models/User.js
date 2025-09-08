const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * 👤 МОДЕЛЬ ПОЛЬЗОВАТЕЛЯ
 * Система пользователей с ролями и профилями
 */

const userSchema = new mongoose.Schema({
  // 📧 ОСНОВНАЯ ИНФОРМАЦИЯ
  email: {
    type: String,
    required: [true, 'Email обязателен'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Введите корректный email']
  },

  password: {
    type: String,
    required: [true, 'Пароль обязателен'],
    minlength: [6, 'Пароль должен содержать минимум 6 символов'],
    select: false // Не включать в запросы по умолчанию
  },

  // 👤 ПЕРСОНАЛЬНЫЕ ДАННЫЕ
  firstName: {
    type: String,
    required: [true, 'Имя обязательно'],
    trim: true,
    maxlength: [50, 'Имя не может быть длиннее 50 символов']
  },

  lastName: {
    type: String,
    required: [true, 'Фамилия обязательна'],
    trim: true,
    maxlength: [50, 'Фамилия не может быть длиннее 50 символов']
  },

  phone: {
    type: String,
    trim: true,
    match: [/^\+998[0-9]{9}$/, 'Введите корректный номер телефона (+998XXXXXXXXX)']
  },

  dateOfBirth: Date,

  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },

  // 📍 АДРЕСА
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
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
    },
    isDefault: { type: Boolean, default: false }
  }],

  // 🔐 РОЛИ И ПРАВА
  role: {
    type: String,
    enum: ['user', 'seller', 'admin', 'super_admin', 'moderator', 'courier'],
    default: 'user'
  },

  permissions: {
    canManageUsers: { type: Boolean, default: false },
    canManageProducts: { type: Boolean, default: false },
    canManageOrders: { type: Boolean, default: false },
    canManageSettings: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false },
    canManagePayments: { type: Boolean, default: false },
    canManageSellers: { type: Boolean, default: false },
    canManageCategories: { type: Boolean, default: false },
    canManageReviews: { type: Boolean, default: false }
  },

  // 📊 СТАТУС АККАУНТА
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },

  // 📧 ВЕРИФИКАЦИЯ EMAIL
  emailVerification: {
    token: String,
    expiresAt: Date,
    verifiedAt: Date
  },

  // 🔄 ВОССТАНОВЛЕНИЕ ПАРОЛЯ
  passwordReset: {
    token: String,
    expiresAt: Date,
    usedAt: Date
  },

  // 📱 НАСТРОЙКИ ПРОФИЛЯ
  preferences: {
    language: {
      type: String,
      enum: ['ru', 'uz', 'en'],
      default: 'ru'
    },
    currency: {
      type: String,
      enum: ['UZS', 'USD', 'RUB'],
      default: 'UZS'
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },

  // 🖼️ АВАТАР
  avatar: {
    url: String,
    publicId: String // для Cloudinary
  },

  // 📊 СТАТИСТИКА
  stats: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    favoritesCount: { type: Number, default: 0 },
    favoriteProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    lastLogin: Date,
    loginCount: { type: Number, default: 0 }
  },

  // 🛒 КОРЗИНА
  cart: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    variant: mongoose.Schema.Types.ObjectId,
    quantity: { type: Number, default: 1, min: 1 },
    addedAt: { type: Date, default: Date.now }
  }],

  // ⭐ ИЗБРАННОЕ
  wishlist: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    addedAt: { type: Date, default: Date.now }
  }],

  // 🔍 ИСТОРИЯ ПОИСКА
  searchHistory: [{
    query: String,
    searchedAt: { type: Date, default: Date.now }
  }],

  // 👁️ ИСТОРИЯ ПРОСМОТРОВ
  viewHistory: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    viewedAt: { type: Date, default: Date.now }
  }],

  // 💳 ПЛАТЕЖНЫЕ МЕТОДЫ
  paymentMethods: [{
    type: {
      type: String,
      enum: ['card', 'uzcard', 'humo', 'click', 'payme'],
      required: true
    },
    isDefault: { type: Boolean, default: false },
    cardNumber: String, // последние 4 цифры
    expiryDate: String,
    cardType: String, // visa, mastercard, uzcard, humo
    bankName: String
  }],

  // 🏷️ СОЦИАЛЬНЫЕ СЕТИ
  socialLinks: {
    telegram: String,
    instagram: String,
    facebook: String
  },

  // 📱 УСТРОЙСТВА И СЕССИИ
  sessions: [{
    deviceId: String,
    deviceType: String, // mobile, desktop, tablet
    userAgent: String,
    ipAddress: String,
    location: String,
    lastActivity: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  }],

  // 🎯 МАРКЕТИНГ
  referral: {
    code: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    earnings: { type: Number, default: 0 }
  },

  // 📊 АНАЛИТИКА
  analytics: {
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    firstVisit: { type: Date, default: Date.now },
    registrationSource: {
      type: String,
      enum: ['website', 'mobile_app', 'telegram', 'referral'],
      default: 'website'
    }
  }

}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordReset;
      delete ret.emailVerification;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// 🔍 ВИРТУАЛЬНЫЕ ПОЛЯ
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('defaultAddress').get(function() {
  if (!this.addresses || !Array.isArray(this.addresses) || this.addresses.length === 0) {
    return null;
  }
  return this.addresses.find(addr => addr && addr.isDefault) || this.addresses[0];
});

userSchema.virtual('cartItemsCount').get(function() {
  if (!this.cart || !Array.isArray(this.cart)) {
    return 0;
  }
  return this.cart.reduce((total, item) => total + (item && item.quantity ? item.quantity : 0), 0);
});

userSchema.virtual('wishlistCount').get(function() {
  if (!this.wishlist || !Array.isArray(this.wishlist)) {
    return 0;
  }
  return this.wishlist.length;
});

// 📊 ИНДЕКСЫ
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1, isVerified: 1 });
userSchema.index({ 'referral.code': 1 }, { sparse: true });
userSchema.index({ createdAt: -1 });

// 🔧 MIDDLEWARE
userSchema.pre('save', async function(next) {
  // Хеширование пароля при изменении
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // Генерация реферального кода
  if (this.isNew && !this.referral.code) {
    this.referral.code = this.generateReferralCode();
  }

  // Обеспечиваем только один default адрес
  if (this.isModified('addresses') && this.addresses && Array.isArray(this.addresses)) {
    const defaultAddresses = this.addresses.filter(addr => addr && addr.isDefault);
    if (defaultAddresses.length > 1) {
      // Убираем default с всех кроме последнего
      this.addresses.forEach((addr, index) => {
        if (index < this.addresses.length - 1 && addr) {
          addr.isDefault = false;
        }
      });
    }
  }

  next();
});

// 📈 МЕТОДЫ
userSchema.methods.checkPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateReferralCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

userSchema.methods.addToCart = function(productId, variantId, quantity = 1) {
  if (!this.cart) this.cart = [];
  if (!Array.isArray(this.cart)) this.cart = [];

  const existingItem = this.cart.find(item =>
    item && item.product && item.product.toString() === productId.toString() &&
    (!variantId || (item.variant && item.variant.toString() === variantId.toString()))
  );

  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 0) + quantity;
  } else {
    this.cart.push({
      product: productId,
      variant: variantId,
      quantity: quantity,
      addedAt: new Date()
    });
  }

  return this.save();
};

userSchema.methods.removeFromCart = function(productId, variantId) {
  if (!this.cart || !Array.isArray(this.cart)) {
    this.cart = [];
    return this.save();
  }

  this.cart = this.cart.filter(item =>
    !item || !item.product ||
    !(item.product.toString() === productId.toString() &&
      (!variantId || (item.variant && item.variant.toString() === variantId.toString())))
  );

  return this.save();
};

userSchema.methods.clearCart = function() {
  this.cart = [];
  return this.save();
};

userSchema.methods.addToWishlist = function(productId) {
  if (!this.wishlist) this.wishlist = [];
  if (!Array.isArray(this.wishlist)) this.wishlist = [];

  if (!this.wishlist.find(item =>
    item && item.product && item.product.toString() === productId.toString()
  )) {
    this.wishlist.push({
      product: productId,
      addedAt: new Date()
    });
  }
  return this.save();
};

userSchema.methods.removeFromWishlist = function(productId) {
  if (!this.wishlist || !Array.isArray(this.wishlist)) {
    this.wishlist = [];
    return this.save();
  }

  this.wishlist = this.wishlist.filter(item =>
    !item || !item.product ||
    item.product.toString() !== productId.toString()
  );
  return this.save();
};

userSchema.methods.hasPermission = function(permission) {
  // Админы имеют все разрешения
  if (this.role === 'admin' || this.role === 'super_admin') {
    return true;
  }

  // Проверяем разрешения в массиве permissions
  if (this.permissions && Array.isArray(this.permissions)) {
    return this.permissions.includes(permission);
  }

  // По умолчанию разрешения на основе ролей
  const rolePermissions = {
    user: ['read:products', 'read:orders'],
    seller: ['read:products', 'write:products', 'read:orders', 'write:orders'],
    admin: ['read:products', 'write:products', 'read:orders', 'write:orders', 'read:users', 'write:users', 'read:analytics', 'manage:site'],
    super_admin: ['read:products', 'write:products', 'read:orders', 'write:orders', 'read:users', 'write:users', 'read:analytics', 'manage:site'],
    moderator: ['read:products', 'write:products', 'read:orders', 'read:users', 'read:analytics'],
    courier: ['read:orders', 'write:orders']
  };

  return rolePermissions[this.role]?.includes(permission) || false;
};

userSchema.methods.updateLastLogin = function() {
  this.stats.lastLogin = new Date();
  this.stats.loginCount += 1;
  return this.save();
};

// Статические методы
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true, isBlocked: false });
};

// 🔧 ВКЛЮЧАЕМ ВИРТУАЛЬНЫЕ ПОЛЯ В JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);