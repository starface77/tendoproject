const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema(
  {
    // Text fields optional: banner — это картинка с опциональной ссылкой
    title: { type: String, trim: true },
    subtitle: { type: String, default: '', trim: true },
    badgeText: { type: String, default: '', trim: true },
    imageUrl: { type: String, required: true },
    targetUrl: { type: String, default: '' },
    bgColor: { type: String, default: '#ffffff' },
    bgGradient: { type: String, default: '' },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    validFrom: { type: Date },
    validTo: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', BannerSchema);

















