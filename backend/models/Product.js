const mongoose = require('mongoose');

/**
 * 📱 МОДЕЛЬ ТОВАРА
 * Система товаров с многоязычностью и вариантами
 */

const productSchema = new mongoose.Schema({
  // 🏷️ ОСНОВНАЯ ИНФОРМАЦИЯ
  name: {
    type: mongoose.Schema.Types.Mixed, // Может быть строкой или объектом
    required: true
  },

  description: {
    type: mongoose.Schema.Types.Mixed, // Может быть строкой или объектом
    required: false
  },

  shortDescription: {
    ru: { type: String, maxlength: 200 },
    uz: { type: String, maxlength: 200 },
    en: { type: String, maxlength: 200 }
  },

  // 🔗 СВЯЗИ
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Категория обязательна']
  },

  brand: {
    type: String,
    required: false // Сделаем необязательным
  },

  model: {
    type: String,
    required: false // Сделаем необязательным
  },

  // 💰 ЦЕНА И НАЛИЧИЕ
  price: {
    type: Number,
    required: [true, 'Цена обязательна'],
    min: [0, 'Цена не может быть отрицательной']
  },

  originalPrice: {
    type: Number,
    min: [0, 'Оригинальная цена не может быть отрицательной']
  },

  currency: {
    type: String,
    default: 'UZS',
    enum: ['UZS', 'USD', 'RUB']
  },

  // 📦 ИНВЕНТАРЬ
  stock: {
    type: Number,
    required: false, // Сделаем необязательным
    min: [0, 'Количество не может быть отрицательным'],
    default: 1
  },

  lowStockThreshold: {
    type: Number,
    default: 5,
    min: [0, 'Порог не может быть отрицательным']
  },

  isInStock: {
    type: Boolean,
    default: true
  },

  // 🖼️ ИЗОБРАЖЕНИЯ
  images: [{
    url: { type: String, required: true },
    alt: {
      ru: String,
      uz: String,
      en: String
    },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],

  // 🎨 ВАРИАНТЫ (ЦВЕТА/МАТЕРИАЛЫ)
  variants: [{
    name: {
      ru: { type: String, required: true },
      uz: { type: String, required: true },
      en: { type: String, required: true }
    },
    type: {
      type: String,
      required: true,
      enum: ['color', 'material', 'size']
    },
    value: String, // hex для цветов, название для материалов
    price: Number, // доплата за вариант
    stock: { type: Number, default: 0 },
    sku: String,
    images: [String] // дополнительные изображения для варианта
  }],

  // 📋 ХАРАКТЕРИСТИКИ
  specifications: [{
    name: {
      ru: { type: String, required: true },
      uz: { type: String, required: true },
      en: { type: String, required: true }
    },
    value: {
      ru: { type: String, required: true },
      uz: { type: String, required: true },
      en: { type: String, required: true }
    },
    order: { type: Number, default: 0 }
  }],

  // 🔒 ЗАЩИТА И МАТЕРИАЛЫ
  material: {
    type: String,
    required: [true, 'Материал обязателен'],
    enum: ['silicone', 'leather', 'plastic', 'metal', 'fabric', 'wood', 'glass']
  },

  protection: {
    shockProof: { type: Boolean, default: false },
    waterProof: { type: Boolean, default: false },
    dustProof: { type: Boolean, default: false },
    scratchResistant: { type: Boolean, default: false },
    dropProtection: { type: String, enum: ['none', 'basic', 'advanced', 'military'], default: 'basic' }
  },

  // 📏 РАЗМЕРЫ И ВЕС
  dimensions: {
    length: Number, // в мм
    width: Number,  // в мм  
    height: Number, // в мм
    weight: Number  // в граммах
  },

  // 🏷️ ТЕГИ И КАТЕГОРИЗАЦИЯ
  tags: [String],

  features: [{
    type: String,
    enum: [
      'wireless_charging', 'magnetic', 'kickstand', 'card_holder', 
      'screen_protector', 'camera_protection', 'eco_friendly',
      'anti_bacterial', 'glow_in_dark', 'transparent'
    ]
  }],

  // 📊 СТАТИСТИКА
  views: { type: Number, default: 0 },
  purchases: { type: Number, default: 0 },
  favorites: { type: Number, default: 0 },
  
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },

  // 🛍️ SEO И МАРКЕТИНГ
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
  },

  keywords: [String],

  // 🎯 СТАТУСЫ
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'discontinued'],
    default: 'active'
  },

  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  isOnSale: { type: Boolean, default: false },

  // 📅 ДАТЫ
  publishDate: { type: Date, default: Date.now },
  discontinuedDate: Date,

  // 👤 СОЗДАТЕЛЬ
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // 🏪 ПРОДАВЕЦ
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // 🔄 ИМПОРТ/ЭКСПОРТ
  externalId: String, // ID во внешней системе
  supplier: String,

  // 📦 ДОСТАВКА
  shipping: {
    weight: Number, // в граммах
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: { type: Boolean, default: false },
    shippingClass: {
      type: String,
      enum: ['standard', 'express', 'same_day'],
      default: 'standard'
    }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔍 ВИРТУАЛЬНЫЕ ПОЛЯ
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

productSchema.virtual('primaryImage').get(function() {
  if (!this.images || this.images.length === 0) return null;
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0] ? this.images[0].url : null);
});

productSchema.virtual('isLowStock').get(function() {
  return this.stock <= this.lowStockThreshold && this.stock > 0;
});

productSchema.virtual('totalStock').get(function() {
  let total = this.stock;
  if (this.variants && this.variants.length > 0) {
    total += this.variants.reduce((sum, variant) => sum + variant.stock, 0);
  }
  return total;
});

// 📊 ИНДЕКСЫ
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ brand: 1, model: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ purchases: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ tags: 1 });
productSchema.index({ isActive: 1, status: 1 });
productSchema.index({ publishDate: -1 });

// 🔧 MIDDLEWARE
productSchema.pre('save', function(next) {
  // Автогенерация slug с уникальностью
  if (this.isModified('name') && !this.slug) {
    // Поддерживаем и строки, и объекты
    const nameForSlug = typeof this.name === 'string' ? this.name : (this.name?.ru || 'product');
    this.slug = nameForSlug
      .toLowerCase()
      .replace(/[^a-zа-я0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now(); // Добавляем timestamp для уникальности
  }

  // Обновление статуса наличия
  this.isInStock = this.totalStock > 0;

  // Проверка скидки
  if (this.originalPrice && this.originalPrice > this.price) {
    this.isOnSale = true;
  }

  next();
});

// 📈 МЕТОДЫ
productSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

productSchema.methods.updateRating = async function() {
  const Review = require('./Review');
  const stats = await Review.aggregate([
    { $match: { product: this._id, isApproved: true } },
    { $group: {
      _id: null,
      avgRating: { $avg: '$rating' },
      totalReviews: { $sum: 1 }
    }}
  ]);

  if (stats.length > 0) {
    this.rating.average = Math.round(stats[0].avgRating * 10) / 10;
    this.rating.count = stats[0].totalReviews;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }

  return this.save();
};

module.exports = mongoose.model('Product', productSchema);

