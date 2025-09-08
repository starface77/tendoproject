const mongoose = require('mongoose');

/**
 * 🧱 Idempotency Key Model
 * Хранит состояние обработки запросов для предотвращения дубликатов
 */
const idempotencyKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  method: {
    type: String,
    required: true
  },

  path: {
    type: String,
    required: true
  },

  action: {
    type: String
  },

  requestHash: {
    type: String,
    index: true
  },

  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },

  responseStatus: Number,
  responseBody: mongoose.Schema.Types.Mixed,

  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: '2d' } // TTL: автоматическое удаление через 2 дня
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

idempotencyKeySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('IdempotencyKey', idempotencyKeySchema);


