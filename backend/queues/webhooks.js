const Queue = require('bull');
const crypto = require('crypto');
const WebhookEvent = require('../models/WebhookEvent');
const Payment = require('../models/Payment');
const paymentServiceModule = require('../services/paymentService');

// Redis connection
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Bull queue
const webhookQueue = new Queue('webhooks', redisUrl);

// Producer helper
const enqueueWebhook = async (provider, payload) => {
  const eventId = String(payload?.params?.id || payload?.click_trans_id || payload?.transaction_id || payload?.id || payload?.request_id || Date.now());
  const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');

  // Upsert event to deduplicate
  const event = await WebhookEvent.findOneAndUpdate(
    { provider, eventId },
    { provider, eventId, hash, payload, status: 'pending' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Add to queue with dedupe key
  await webhookQueue.add({ provider, eventId }, { jobId: `${provider}:${eventId}`, attempts: 5, backoff: { type: 'exponential', delay: 2000 } });
  return event;
};

// Consumer
webhookQueue.process(async (job) => {
  const { provider, eventId } = job.data;
  const event = await WebhookEvent.findOne({ provider, eventId });
  if (!event) return;

  if (event.status === 'processed') return; // already done

  event.status = 'processing';
  await event.save();

  try {
    const { PaymentService } = paymentServiceModule;
    const paymentService = new PaymentService();

    // Use existing service logic
    let result;
    if (provider === 'payme') {
      result = await paymentService.processPaymeWebhook(event.payload);
    } else if (provider === 'click') {
      result = await paymentService.processClickWebhook(event.payload);
    } else {
      throw new Error('Unknown provider');
    }

    // TODO: Extract payment/order ids from result if available and update event.related

    event.status = 'processed';
    await event.save();
    return result;

  } catch (error) {
    event.retries += 1;
    event.lastError = error.message;
    event.status = job.attemptsMade + 1 >= job.opts.attempts ? 'dlq' : 'failed';
    await event.save();
    throw error; // let Bull handle retry
  }
});

module.exports = { webhookQueue, enqueueWebhook };


