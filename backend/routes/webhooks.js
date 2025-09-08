const express = require('express');
const WebhookController = require('../controllers/webhookController');

const router = express.Router();

// 🔗 WEBHOOK МАРШРУТЫ
// Эти маршруты не требуют аутентификации, так как они вызываются внешними системами

// 📊 Статус webhook системы
router.get('/status', WebhookController.getWebhookStatus);

// 💳 Webhook для платежных систем
router.post('/payment', WebhookController.handlePaymentWebhook);

// 🛒 Webhook для заказов (если понадобится)
router.post('/order', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Order webhook endpoint ready'
  });
});

// 🔔 Webhook для уведомлений (если понадобится)
router.post('/notification', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notification webhook endpoint ready'
  });
});

// 🧪 Тестовый webhook для разработки
router.post('/test', (req, res) => {
  console.log('🧪 Тестовый webhook получен:', req.body);
  
  res.status(200).json({
    success: true,
    message: 'Test webhook received successfully',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

