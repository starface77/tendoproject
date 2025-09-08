const mongoose = require('mongoose');

/**
 * 🔔 МОДЕЛЬ УВЕДОМЛЕНИЙ
 * Система уведомлений для маркетплейса (продавцы, админы, покупатели)
 */

const notificationSchema = new mongoose.Schema({
  // 👤 ПОЛУЧАТЕЛЬ
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // 🏷️ ТИП УВЕДОМЛЕНИЯ
  type: {
    type: String,
    required: true,
    enum: [
      // Заказы
      'order_created',           // Новый заказ создан
      'order_confirmed',         // Заказ подтвержден
      'order_shipped',           // Заказ отправлен
      'order_delivered',         // Заказ доставлен
      'order_cancelled',         // Заказ отменен
      
      // Платежи
      'payment_received',        // Платеж получен
      'payment_failed',          // Платеж не прошел
      'payment_refunded',        // Возврат средств
      
      // Продавцы
      'seller_order_received',   // Продавцу: новый заказ
      'seller_payment_received', // Продавцу: получен платеж
      'seller_product_low_stock', // Продавцу: низкий остаток
      
      // Админы
      'admin_new_seller',        // Админу: новая заявка продавца
      'admin_order_issue',       // Админу: проблема с заказом
      'admin_payment_issue',     // Админу: проблема с платежом
      'admin_system_alert',      // Админу: системное уведомление
      
      // Покупатели
      'customer_order_update',   // Покупателю: обновление заказа
      'customer_payment_success', // Покупателю: успешная оплата
      'customer_delivery_update', // Покупателю: обновление доставки
      'customer_support_reply'   // Покупателю: ответ поддержки
    ]
  },

  // 📋 ЗАГОЛОВОК
  title: {
    ru: { type: String, required: true },
    uz: { type: String, required: true },
    en: { type: String, required: true }
  },

  // 📝 СОДЕРЖАНИЕ
  message: {
    ru: { type: String, required: true },
    uz: { type: String, required: true },
    en: { type: String, required: true }
  },

  // 🔗 СВЯЗАННЫЕ ДАННЫЕ
  relatedData: {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },

  // 🎯 ПРИОРИТЕТ
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },

  // 📱 КАНАЛЫ ДОСТАВКИ
  channels: [{
    type: String,
    enum: ['in_app', 'email', 'sms', 'telegram', 'push'],
    default: ['in_app']
  }],

  // 📊 СТАТУС
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },

  // 📅 ВРЕМЕННЫЕ МЕТКИ
  scheduledAt: Date,        // Когда отправить
  sentAt: Date,             // Когда отправлено
  deliveredAt: Date,        // Когда доставлено
  readAt: Date,             // Когда прочитано

  // 🔄 ПОПЫТКИ ОТПРАВКИ
  deliveryAttempts: [{
    attempt: { type: Number, default: 1 },
    timestamp: { type: Date, default: Date.now },
    channel: String,
    success: Boolean,
    error: String
  }],

  // 🎨 ДОПОЛНИТЕЛЬНЫЕ ДАННЫЕ
  metadata: {
    icon: String,           // Иконка для UI
    color: String,          // Цвет для UI
    actionUrl: String,      // URL для действия
    actionText: String      // Текст кнопки действия
  },

  // 🔒 НАСТРОЙКИ
  isRead: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  expiresAt: Date,          // Когда уведомление устаревает

  // 📊 АНАЛИТИКА
  analytics: {
    openRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔍 ВИРТУАЛЬНЫЕ ПОЛЯ
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && new Date() > this.expiresAt;
});

notificationSchema.virtual('isScheduled').get(function() {
  return this.scheduledAt && new Date() < this.scheduledAt;
});

notificationSchema.virtual('canSend').get(function() {
  return this.status === 'pending' && !this.isExpired && !this.isScheduled;
});

// 📊 ИНДЕКСЫ
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ status: 1, scheduledAt: 1 });
notificationSchema.index({ 'relatedData.order': 1 });
notificationSchema.index({ 'relatedData.payment': 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 🔧 MIDDLEWARE
notificationSchema.pre('save', function(next) {
  // Автоматически устанавливаем время истечения для старых уведомлений
  if (!this.expiresAt && this.createdAt) {
    this.expiresAt = new Date(this.createdAt.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 дней
  }
  
  next();
});

// 📈 МЕТОДЫ
notificationSchema.methods.markAsSent = function(channel) {
  this.status = 'sent';
  this.sentAt = new Date();
  
  this.deliveryAttempts.push({
    attempt: this.deliveryAttempts.length + 1,
    timestamp: new Date(),
    channel: channel,
    success: true
  });
  
  return this.save();
};

notificationSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsFailed = function(channel, error) {
  this.deliveryAttempts.push({
    attempt: this.deliveryAttempts.length + 1,
    timestamp: new Date(),
    channel: channel,
    success: false,
    error: error
  });
  
  // Если много неудачных попыток, помечаем как failed
  if (this.deliveryAttempts.filter(attempt => !attempt.success).length >= 3) {
    this.status = 'failed';
  }
  
  return this.save();
};

// Статические методы
notificationSchema.statics.createOrderNotification = async function(orderData, type) {
  const notifications = [];
  
  // Уведомление для покупателя
  const customerNotification = {
    recipient: orderData.customer,
    type: `customer_${type}`,
    title: this.getNotificationTitle(type, 'customer'),
    message: this.getNotificationMessage(type, 'customer', orderData),
    relatedData: { order: orderData._id },
    priority: this.getNotificationPriority(type),
    channels: ['in_app', 'email']
  };
  
  notifications.push(customerNotification);
  
  // Уведомление для продавца (если есть)
  if (orderData.seller) {
    const sellerNotification = {
      recipient: orderData.seller,
      type: `seller_${type}`,
      title: this.getNotificationTitle(type, 'seller'),
      message: this.getNotificationMessage(type, 'seller', orderData),
      relatedData: { order: orderData._id },
      priority: this.getNotificationPriority(type),
      channels: ['in_app', 'email', 'telegram']
    };
    
    notifications.push(sellerNotification);
  }
  
  // Уведомление для админов
  const adminNotification = {
    recipient: null, // Будет отправлено всем админам
    type: `admin_${type}`,
    title: this.getNotificationTitle(type, 'admin'),
    message: this.getNotificationMessage(type, 'admin', orderData),
    relatedData: { order: orderData._id },
    priority: this.getNotificationPriority(type),
    channels: ['in_app', 'email']
  };
  
  notifications.push(adminNotification);
  
  // Создаем все уведомления
  return await this.insertMany(notifications);
};

notificationSchema.statics.getNotificationTitle = function(type, recipient) {
  const titles = {
    order_created: {
      customer: { ru: 'Заказ создан', uz: 'Buyurtma yaratildi', en: 'Order created' },
      seller: { ru: 'Новый заказ', uz: 'Yangi buyurtma', en: 'New order' },
      admin: { ru: 'Новый заказ в системе', uz: 'Tizimda yangi buyurtma', en: 'New order in system' }
    },
    payment_received: {
      customer: { ru: 'Оплата получена', uz: 'To\'lov qabul qilindi', en: 'Payment received' },
      seller: { ru: 'Получен платеж', uz: 'To\'lov qabul qilindi', en: 'Payment received' },
      admin: { ru: 'Платеж обработан', uz: 'To\'lov qayta ishlangan', en: 'Payment processed' }
    },
    customer_support_reply: {
      customer: { ru: 'Ответ поддержки', uz: 'Qo\'llab-quvvatlash javobi', en: 'Support reply' }
    }
  };
  
  return titles[type]?.[recipient] || { ru: 'Уведомление', uz: 'Xabar', en: 'Notification' };
};

notificationSchema.statics.getNotificationMessage = function(type, recipient, data) {
  const messages = {
    order_created: {
      customer: {
        ru: `Ваш заказ #${data.orderNumber} успешно создан. Ожидайте подтверждения.`,
        uz: `Sizning #${data.orderNumber} buyurtmangiz muvaffaqiyatli yaratildi. Tasdiqlanishini kuting.`,
        en: `Your order #${data.orderNumber} has been created successfully. Wait for confirmation.`
      },
      seller: {
        ru: `Получен новый заказ #${data.orderNumber} на сумму ${data.pricing.total} сум.`,
        uz: `${data.pricing.total} so'm miqdorida #${data.orderNumber} raqamli yangi buyurtma qabul qilindi.`,
        en: `New order #${data.orderNumber} received for ${data.pricing.total} UZS.`
      },
      admin: {
        ru: `В системе создан новый заказ #${data.orderNumber} от ${data.customerInfo.firstName} ${data.customerInfo.lastName}.`,
        uz: `Tizimda ${data.customerInfo.firstName} ${data.customerInfo.lastName} tomonidan #${data.orderNumber} raqamli yangi buyurtma yaratildi.`,
        en: `New order #${data.orderNumber} created in system by ${data.customerInfo.firstName} ${data.customerInfo.lastName}.`
      }
    },
    customer_support_reply: {
      customer: {
        ru: `Получен ответ на ваше сообщение "${data.subject}". Проверьте в разделе сообщений.`,
        uz: `Sizning "${data.subject}" mavzudagi xabaringizga javob keldi. Xabarlar bo'limida tekshiring.`,
        en: `Reply received for your message "${data.subject}". Check in messages section.`
      }
    }
  };
  
  return messages[type]?.[recipient] || { 
    ru: 'У вас новое уведомление', 
    uz: 'Sizda yangi xabar bor', 
    en: 'You have a new notification' 
  };
};

notificationSchema.statics.getNotificationPriority = function(type) {
  const priorities = {
    order_created: 'normal',
    payment_received: 'high',
    order_cancelled: 'high',
    payment_failed: 'urgent',
    admin_system_alert: 'urgent'
  };
  
  return priorities[type] || 'normal';
};

module.exports = mongoose.model('Notification', notificationSchema);

