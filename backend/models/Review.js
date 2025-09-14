const mongoose = require('mongoose');

/**
 * ⭐ МОДЕЛЬ ОТЗЫВА
 * Система отзывов с модерацией и рейтингами
 */

const reviewSchema = new mongoose.Schema({
  // 📦 ТОВАР И ПОЛЬЗОВАТЕЛЬ
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Товар обязателен']
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Пользователь обязателен']
  },

  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order' // Привязка к заказу для проверки покупки
  },

  // ⭐ ОЦЕНКА
  rating: {
    type: Number,
    required: [true, 'Рейтинг обязателен'],
    min: [1, 'Минимальный рейтинг - 1'],
    max: [5, 'Максимальный рейтинг - 5']
  },

  // 📝 ОТЗЫВ
  title: {
    type: String,
    required: [true, 'Заголовок отзыва обязателен'],
    trim: true,
    maxlength: [100, 'Заголовок слишком длинный']
  },

  content: {
    type: String,
    required: [true, 'Текст отзыва обязателен'],
    trim: true,
    minlength: [10, 'Отзыв слишком короткий'],
    maxlength: [1000, 'Отзыв слишком длинный']
  },

  // 📷 ИЗОБРАЖЕНИЯ
  images: [{
    url: { type: String, required: true },
    alt: String,
    order: { type: Number, default: 0 }
  }],

  // 👍 ПЛЮСЫ И МИНУСЫ
  pros: [String],
  cons: [String],

  // 🏷️ ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ
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

  // 🏪 АСПЕКТЫ ОЦЕНКИ (детализированный рейтинг)
  aspects: {
    quality: { type: Number, min: 1, max: 5 },      // Качество
    design: { type: Number, min: 1, max: 5 },       // Дизайн
    protection: { type: Number, min: 1, max: 5 },   // Защита
    comfort: { type: Number, min: 1, max: 5 },      // Удобство
    value: { type: Number, min: 1, max: 5 }         // Соотношение цена/качество
  },

  // ✅ МОДЕРАЦИЯ
  isApproved: {
    type: Boolean,
    default: false
  },

  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'requires_changes'],
    default: 'pending'
  },

  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  moderatedAt: Date,

  moderationNotes: String,

  rejectionReason: {
    type: String,
    enum: [
      'inappropriate_content',
      'fake_review',
      'spam',
      'off_topic',
      'duplicate',
      'personal_information',
      'other'
    ]
  },

  // 🔍 ПРОВЕРКА ПОДЛИННОСТИ
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },

  purchaseVerifiedAt: Date,

  // 👍 ПОЛЕЗНОСТЬ ОТЗЫВА
  helpfulVotes: {
    positive: { type: Number, default: 0 },
    negative: { type: Number, default: 0 },
    voters: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      vote: { type: String, enum: ['positive', 'negative'] },
      votedAt: { type: Date, default: Date.now }
    }]
  },

  // 📊 СТАТИСТИКА
  views: { type: Number, default: 0 },
  
  // 🗣️ ОТВЕТ ПРОДАВЦА
  response: {
    content: String,
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    respondedAt: Date,
    isPublic: { type: Boolean, default: true }
  },

  // 🚨 ЖАЛОБЫ
  reports: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: {
      type: String,
      enum: ['spam', 'fake', 'inappropriate', 'offensive', 'other']
    },
    notes: String,
    reportedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending'
    }
  }],

  // 🏷️ МЕТКИ
  tags: [String], // Автоматические теги на основе содержания

  // 🌍 ЛОКАЛИЗАЦИЯ
  language: {
    type: String,
    enum: ['ru', 'uz', 'en'],
    default: 'ru'
  },

  // 📱 ТЕХНИЧЕСКАЯ ИНФОРМАЦИЯ
  userAgent: String,
  ipAddress: String,

  // 🔄 ОБНОВЛЕНИЯ
  editHistory: [{
    editedAt: { type: Date, default: Date.now },
    changes: mongoose.Schema.Types.Mixed,
    reason: String
  }],

  lastEditedAt: Date,

  // ❌ УДАЛЕНИЕ
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletionReason: String

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔍 ВИРТУАЛЬНЫЕ ПОЛЯ
reviewSchema.virtual('helpfulnessRatio').get(function() {
  const total = this.helpfulVotes.positive + this.helpfulVotes.negative;
  return total > 0 ? (this.helpfulVotes.positive / total) : 0;
});

reviewSchema.virtual('totalHelpfulVotes').get(function() {
  return this.helpfulVotes.positive + this.helpfulVotes.negative;
});

reviewSchema.virtual('averageAspectRating').get(function() {
  const aspects = this.aspects;
  if (!aspects) return this.rating;
  
  const values = Object.values(aspects).filter(val => val !== undefined);
  return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : this.rating;
});

reviewSchema.virtual('authorName').get(function() {
  if (this.user && this.user.firstName) {
    return `${this.user.firstName} ${this.user.lastName ? this.user.lastName[0] + '.' : ''}`;
  }
  return 'Аноним';
});

// 📊 ИНДЕКСЫ
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ isApproved: 1, moderationStatus: 1 });
reviewSchema.index({ isVerifiedPurchase: 1 });
reviewSchema.index({ 'helpfulVotes.positive': -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ product: 1, user: 1 }, { unique: true }); // Один отзыв на товар от пользователя

// 🔧 MIDDLEWARE
reviewSchema.pre('save', async function(next) {
  try {
    // Проверка на покупку товара
    if (this.isNew && this.order) {
      const Order = require('./Order');
      const order = await Order.findById(this.order);
      
      if (order && order.customer.equals(this.user) && order.status === 'delivered') {
        const hasPurchased = order.items.some(item => item.product.equals(this.product));
        this.isVerifiedPurchase = hasPurchased;
        
        if (hasPurchased) {
          this.purchaseVerifiedAt = new Date();
        }
      }
    }

    // Автоматическая генерация тегов на основе содержания
    if (this.isModified('content') || this.isModified('title')) {
      this.tags = this.extractTags();
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Обновление рейтинга товара после изменения отзыва
reviewSchema.post('save', async function() {
  if (this.isApproved) {
    const Product = require('./Product');
    const product = await Product.findById(this.product);
    if (product) {
      await product.updateRating();
    }
  }
});

// 📈 МЕТОДЫ
reviewSchema.methods.extractTags = function() {
  const content = `${this.title} ${this.content}`.toLowerCase();
  const tags = [];

  // Ключевые слова для автоматической категоризации
  const keywords = {
    'quality': ['качество', 'sifat', 'quality'],
    'design': ['дизайн', 'dizayn', 'design', 'красив', 'chiroyli', 'beautiful'],
    'protection': ['защита', 'himoya', 'protection', 'прочн', 'mustahkam', 'durable'],
    'comfort': ['удобн', 'qulay', 'comfortable', 'comfort'],
    'price': ['цена', 'narx', 'price', 'дёшев', 'arzon', 'cheap', 'дорог', 'qimmat', 'expensive'],
    'delivery': ['доставка', 'yetkazib berish', 'delivery', 'быстр', 'tez', 'fast']
  };

  for (const [tag, words] of Object.entries(keywords)) {
    if (words.some(word => content.includes(word))) {
      tags.push(tag);
    }
  }

  return tags;
};

reviewSchema.methods.vote = async function(userId, voteType) {
  // Проверка, голосовал ли пользователь ранее
  const existingVote = this.helpfulVotes.voters.find(voter => 
    voter.user.equals(userId)
  );

  if (existingVote) {
    // Изменение голоса
    if (existingVote.vote !== voteType) {
      this.helpfulVotes[existingVote.vote] -= 1;
      this.helpfulVotes[voteType] += 1;
      existingVote.vote = voteType;
      existingVote.votedAt = new Date();
    }
  } else {
    // Новый голос
    this.helpfulVotes[voteType] += 1;
    this.helpfulVotes.voters.push({
      user: userId,
      vote: voteType
    });
  }

  return await this.save();
};

reviewSchema.methods.addReport = async function(userId, reason, notes) {
  this.reports.push({
    user: userId,
    reason,
    notes
  });

  return await this.save();
};

reviewSchema.methods.respond = async function(content, respondedBy) {
  this.response = {
    content,
    respondedBy,
    respondedAt: new Date()
  };

  return await this.save();
};

// Статические методы
reviewSchema.statics.getProductRating = async function(productId) {
  const result = await this.aggregate([
    { 
      $match: { 
        product: new mongoose.Types.ObjectId(productId),
        isApproved: true 
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const data = result[0];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  data.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    averageRating: Math.round(data.averageRating * 10) / 10,
    totalReviews: data.totalReviews,
    distribution
  };
};

reviewSchema.statics.getPendingReviews = function(limit = 50) {
  return this.find({ moderationStatus: 'pending' })
    .populate('user', 'firstName lastName email')
    .populate('product', 'name images')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Review', reviewSchema);
