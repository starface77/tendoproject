const mongoose = require('mongoose');

/**
 * 📬 Webhook Event Model
 * Дедупликация и трекинг обработки событий вебхуков (Payme/Click)
 */
const webhookEventSchema = new mongoose.Schema({
  provider: { type: String, enum: ['payme', 'click'], required: true, index: true },
  eventId: { type: String, required: true },
  hash: { type: String, index: true },
  status: { type: String, enum: ['pending', 'processing', 'processed', 'failed', 'dlq'], default: 'pending', index: true },
  retries: { type: Number, default: 0 },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  lastError: { type: String },
  related: {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }
  }
}, {
  timestamps: true
});

webhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);


