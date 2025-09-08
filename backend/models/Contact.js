const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Имя обязательно'],
    trim: true,
    maxlength: [50, 'Имя не может быть длиннее 50 символов']
  },
  email: {
    type: String,
    required: [true, 'Email обязателен'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Пожалуйста, введите корректный email'
    ]
  },
  subject: {
    type: String,
    required: [true, 'Тема обязательна'],
    trim: true,
    maxlength: [100, 'Тема не может быть длиннее 100 символов']
  },
  message: {
    type: String,
    required: [true, 'Сообщение обязательно'],
    trim: true,
    maxlength: [1000, 'Сообщение не может быть длиннее 1000 символов'],
    minlength: [5, 'Сообщение должно содержать минимум 5 символов']
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'closed'],
    default: 'new'
  },
  ip: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  repliedAt: {
    type: Date
  },
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  replyMessage: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Индексы для быстрого поиска
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

// Виртуальное поле для проверки, прочитано ли сообщение
contactSchema.virtual('isRead').get(function() {
  return this.status !== 'new';
});

// Статический метод для получения статистики
contactSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  return stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, { new: 0, read: 0, replied: 0, closed: 0 });
};

module.exports = mongoose.model('Contact', contactSchema);
