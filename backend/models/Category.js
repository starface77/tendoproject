const mongoose = require('mongoose');

/**
 * 📂 МОДЕЛЬ КАТЕГОРИИ
 * Иерархическая система категорий с многоязычностью
 */

const categorySchema = new mongoose.Schema({
  // 🏷️ ОСНОВНАЯ ИНФОРМАЦИЯ
  name: {
    ru: { type: String, required: true, trim: true },
    uz: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true }
  },

  description: {
    ru: { type: String, trim: true },
    uz: { type: String, trim: true },
    en: { type: String, trim: true }
  },

  // 🔗 ИЕРАРХИЯ
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },

  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],

  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 5 // Максимум 5 уровней вложенности
  },

  path: {
    type: String,
    index: true
  }, // Например: "/electronics/phones/iphone"

  // 🖼️ ВИЗУАЛ
  icon: {
    type: String,
    default: '📱'
  },

  image: {
    url: String,
    alt: {
      ru: String,
      uz: String,
      en: String
    }
  },

  color: {
    type: String,
    default: '#3B82F6',
    match: /^#[0-9A-F]{6}$/i
  },

  // 🔗 SEO
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
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

  // 📊 СТАТИСТИКА
  productCount: {
    type: Number,
    default: 0,
    min: 0
  },

  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },

  orderCount: {
    type: Number,
    default: 0,
    min: 0
  },

  // 🎯 НАСТРОЙКИ
  isActive: {
    type: Boolean,
    default: true
  },

  isFeatured: {
    type: Boolean,
    default: false
  },

  isVisible: {
    type: Boolean,
    default: true
  },

  // 📋 ПОРЯДОК СОРТИРОВКИ
  sortOrder: {
    type: Number,
    default: 0
  },

  // 🛒 КОММЕРЧЕСКИЕ НАСТРОЙКИ
  commission: {
    type: Number,
    default: 0,
    min: 0,
    max: 100 // Процент комиссии
  },

  minPrice: {
    type: Number,
    default: 0,
    min: 0
  },

  maxPrice: {
    type: Number,
    default: 0,
    min: 0
  },

  // 🔧 ФИЛЬТРЫ И АТРИБУТЫ
  filters: [{
    name: {
      ru: { type: String, required: true },
      uz: { type: String, required: true },
      en: { type: String, required: true }
    },
    type: {
      type: String,
      required: true,
      enum: ['range', 'select', 'checkbox', 'radio', 'color']
    },
    options: [{
      value: String,
      label: {
        ru: String,
        uz: String,
        en: String
      },
      color: String // для цветовых фильтров
    }],
    isRequired: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],

  // 🎨 ШАБЛОН ОТОБРАЖЕНИЯ
  template: {
    type: String,
    enum: ['grid', 'list', 'catalog', 'gallery'],
    default: 'grid'
  },

  // 📱 НАСТРОЙКИ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ
  mobileSettings: {
    showOnHome: { type: Boolean, default: false },
    quickOrderEnabled: { type: Boolean, default: true },
    showFilters: { type: Boolean, default: true }
  },

  // 👤 СОЗДАТЕЛЬ И РЕДАКТОР
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔍 ВИРТУАЛЬНЫЕ ПОЛЯ
categorySchema.virtual('hasChildren').get(function() {
  return this.children && this.children.length > 0;
});

categorySchema.virtual('breadcrumbs').get(function() {
  // Будет заполняться через populate или отдельный метод
  return [];
});

categorySchema.virtual('fullPath').get(function() {
  return this.path || '/';
});

// 📊 ИНДЕКСЫ
categorySchema.index({ parent: 1, sortOrder: 1 });
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ isActive: 1, isVisible: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ path: 1 });
categorySchema.index({ isFeatured: 1, sortOrder: 1 });
categorySchema.index({ productCount: -1 });
categorySchema.index({ 'name.ru': 'text', 'name.uz': 'text', 'name.en': 'text' });

// 🔧 MIDDLEWARE
categorySchema.pre('save', async function(next) {
  // Автогенерация slug
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.en
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Установка уровня и пути для иерархии
  if (this.isModified('parent') || this.isNew) {
    if (this.parent) {
      const parentCategory = await this.constructor.findById(this.parent);
      if (parentCategory) {
        this.level = parentCategory.level + 1;
        this.path = `${parentCategory.path}/${this.slug}`;
      }
    } else {
      this.level = 0;
      this.path = `/${this.slug}`;
    }
  }

  next();
});

categorySchema.post('save', async function(category) {
  // Обновляем список детей у родительской категории
  if (category.parent) {
    await this.constructor.findByIdAndUpdate(
      category.parent,
      { $addToSet: { children: category._id } }
    );
  }
});

categorySchema.pre('remove', async function(next) {
  // Удаляем из списка детей родительской категории
  if (this.parent) {
    await this.constructor.findByIdAndUpdate(
      this.parent,
      { $pull: { children: this._id } }
    );
  }

  // Переносим дочерние категории на уровень выше или удаляем
  if (this.children && this.children.length > 0) {
    await this.constructor.updateMany(
      { parent: this._id },
      { parent: this.parent, level: this.level }
    );
  }

  next();
});

// 📈 МЕТОДЫ
categorySchema.methods.incrementProductCount = function() {
  this.productCount += 1;
  return this.save();
};

categorySchema.methods.decrementProductCount = function() {
  if (this.productCount > 0) {
    this.productCount -= 1;
  }
  return this.save();
};

categorySchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

categorySchema.methods.getAncestors = async function() {
  const ancestors = [];
  let current = this;

  while (current.parent) {
    current = await this.constructor.findById(current.parent);
    if (current) {
      ancestors.unshift(current);
    } else {
      break;
    }
  }

  return ancestors;
};

categorySchema.methods.getDescendants = async function() {
  const descendants = [];
  
  const findChildren = async (categoryId) => {
    const children = await this.constructor.find({ parent: categoryId });
    for (const child of children) {
      descendants.push(child);
      await findChildren(child._id);
    }
  };

  await findChildren(this._id);
  return descendants;
};

categorySchema.methods.getBreadcrumbs = async function() {
  const ancestors = await this.getAncestors();
  return [...ancestors, this];
};

// Статические методы
categorySchema.statics.findTopLevel = function() {
  return this.find({ parent: null, isActive: true, isVisible: true })
    .sort({ sortOrder: 1, 'name.ru': 1 });
};

categorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, isActive: true, isVisible: true });
};

categorySchema.statics.findFeatured = function(limit = 10) {
  return this.find({ isFeatured: true, isActive: true, isVisible: true })
    .sort({ sortOrder: 1 })
    .limit(limit);
};

categorySchema.statics.getTree = async function() {
  const categories = await this.find({ isActive: true, isVisible: true })
    .sort({ level: 1, sortOrder: 1 });

  const buildTree = (parentId = null) => {
    return categories
      .filter(cat => (cat.parent?.toString() || null) === (parentId?.toString() || null))
      .map(cat => ({
        ...cat.toObject(),
        children: buildTree(cat._id)
      }));
  };

  return buildTree();
};

categorySchema.statics.updateProductCounts = async function() {
  const Product = require('./Product');
  
  const pipeline = [
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ];

  const productCounts = await Product.aggregate(pipeline);
  
  // Сбрасываем все счетчики
  await this.updateMany({}, { productCount: 0 });
  
  // Обновляем счетчики
  for (const item of productCounts) {
    await this.findByIdAndUpdate(item._id, { productCount: item.count });
  }
};

module.exports = mongoose.model('Category', categorySchema);