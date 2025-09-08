/**
 * ⚙️ SETTINGS MODEL
 * Управление настройками системы через админ-панель
 */

const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  // Ключ настройки (уникальный)
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Значение настройки (может быть любого типа)
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  // Метаданные настройки
  meta: {
    // Категория настройки
    category: {
      type: String,
      required: true,
      enum: [
        'general',          // Общие настройки
        'payments',         // Платежные системы
        'delivery',         // Доставка
        'appearance',       // Внешний вид
        'notifications',    // Уведомления
        'security',         // Безопасность
        'integrations',     // Интеграции
        'marketplace',      // Маркетплейс
        'social',          // Социальные сети
        'seo',             // SEO настройки
        'advanced'         // Дополнительные
      ]
    },

    // Название настройки
    title: {
      ru: { type: String, required: true },
      uz: String,
      en: String
    },

    // Описание настройки
    description: {
      ru: String,
      uz: String,
      en: String
    },

    // Тип поля для админ-панели
    fieldType: {
      type: String,
      required: true,
      enum: [
        'text',           // Текстовое поле
        'textarea',       // Многострочное текстовое поле
        'number',         // Числовое поле
        'boolean',        // Переключатель
        'select',         // Выпадающий список
        'color',          // Выбор цвета
        'image',          // Загрузка изображения
        'file',           // Загрузка файла
        'json',           // JSON редактор
        'url',            // URL поле
        'email',          // Email поле
        'password'        // Пароль
      ]
    },

    // Опции для select
    options: [{
      value: mongoose.Schema.Types.Mixed,
      label: {
        ru: String,
        uz: String,
        en: String
      }
    }],

    // Валидация
    validation: {
      required: { type: Boolean, default: false },
      min: Number,
      max: Number,
      minLength: Number,
      maxLength: Number,
      pattern: String, // Regex pattern
      custom: String   // Кастомная валидация
    },

    // Значение по умолчанию
    defaultValue: mongoose.Schema.Types.Mixed,

    // Приоритет сортировки
    order: { type: Number, default: 0 },

    // Является ли настройка системной (нельзя удалить)
    isSystem: { type: Boolean, default: false },

    // Скрыта ли настройка
    isHidden: { type: Boolean, default: false },

    // Требует ли перезагрузки
    requiresRestart: { type: Boolean, default: false }
  },

  // Кто последний изменял настройку
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Индексы
settingSchema.index({ 'meta.category': 1 });
settingSchema.index({ 'meta.order': 1 });

// Статические методы
settingSchema.statics.getSetting = async function(key, defaultValue = null) {
  try {
    const setting = await this.findOne({ key });
    return setting ? setting.value : defaultValue;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return defaultValue;
  }
};

settingSchema.statics.setSetting = async function(key, value, updatedBy = null) {
  try {
    const updateData = { 
      value,
      updatedAt: new Date()
    };
    
    if (updatedBy) {
      updateData.updatedBy = updatedBy;
    }

    const setting = await this.findOneAndUpdate(
      { key },
      updateData,
      { upsert: true, new: true }
    );
    
    return setting;
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    throw error;
  }
};

settingSchema.statics.getSettingsByCategory = async function(category) {
  return this.find({ 'meta.category': category })
    .sort({ 'meta.order': 1, 'meta.title.ru': 1 });
};

settingSchema.statics.getAllSettings = async function() {
  const settings = await this.find({}).sort({ 'meta.category': 1, 'meta.order': 1 });
  const grouped = {};
  
  settings.forEach(setting => {
    const category = setting.meta.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(setting);
  });
  
  return grouped;
};

// Методы экземпляра
settingSchema.methods.updateValue = function(newValue, updatedBy = null) {
  this.value = newValue;
  this.updatedAt = new Date();
  if (updatedBy) {
    this.updatedBy = updatedBy;
  }
  return this.save();
};

// Middleware для логирования изменений
settingSchema.pre('save', function(next) {
  if (this.isModified('value')) {
    console.log(`Setting ${this.key} changed:`, {
      old: this._original?.value,
      new: this.value,
      changedBy: this.updatedBy
    });
  }
  next();
});

module.exports = mongoose.model('Setting', settingSchema);

