const mongoose = require('mongoose');

/**
 * 🧩 HomeSection
 * Админ-настраиваемые секции на главной: "Рекомендуемые", "Новинки", "Скидки", произвольные и т.д.
 * Поддерживает два режима:
 * - manual: список productIds
 * - dynamic: query-конфиг (category, tags, флаги, сортировка)
 */

const HomeSectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  key: { type: String, trim: true }, // необязательный системный ключ
  type: { type: String, enum: ['manual', 'dynamic'], default: 'manual' },
  description: { type: String, default: '' },
  order: { type: Number, default: 0, index: true },
  isActive: { type: Boolean, default: true, index: true },

  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  query: {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tag: { type: String },
    isFeatured: { type: Boolean },
    isOnSale: { type: Boolean },
    limit: { type: Number, default: 12, min: 1, max: 48 },
    sort: { type: String, default: '-createdAt' } // например: '-createdAt', '-rating.average', '-purchases'
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('HomeSection', HomeSectionSchema);


