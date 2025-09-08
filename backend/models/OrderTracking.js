/**
 * 📦 ORDER TRACKING MODEL
 * Полноценная система отслеживания заказов как в современных маркетплейсах
 */

const mongoose = require('mongoose');

const orderTrackingSchema = new mongoose.Schema({
  // Связь с заказом
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },

  // Трекинг номер
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },

  // Информация о доставке
  delivery: {
    // Служба доставки
    service: {
      type: String,
      enum: ['yandex', 'express24', 'uzpost', 'dostavka', 'courier', 'pickup'],
      required: true
    },

    // ID в системе службы доставки
    externalTrackingId: String,

    // Тип доставки
    type: {
      type: String,
      enum: ['standard', 'express', 'same_day', 'pickup'],
      default: 'standard'
    },

    // Курьер (если есть)
    courier: {
      name: String,
      phone: String,
      photo: String,
      rating: Number
    },

    // Адрес доставки
    address: {
      city: { type: String, required: true },
      district: String,
      street: { type: String, required: true },
      house: { type: String, required: true },
      apartment: String,
      floor: String,
      entrance: String,
      landmark: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },

    // Временные рамки
    estimatedDelivery: {
      from: Date,
      to: Date
    },
    actualDelivery: Date,

    // Стоимость доставки
    cost: {
      type: Number,
      default: 0
    },

    // Дополнительные услуги
    services: [{
      type: {
        type: String,
        enum: ['insurance', 'fragile', 'express', 'weekend']
      },
      cost: Number,
      description: String
    }]
  },

  // История статусов
  statusHistory: [{
    status: {
      type: String,
      enum: [
        'created',        // Заказ создан
        'confirmed',      // Подтвержден продавцом
        'packed',         // Упакован
        'picked_up',      // Забран курьером
        'in_transit',     // В пути
        'out_for_delivery', // На доставке
        'delivered',      // Доставлен
        'failed_delivery', // Неудачная доставка
        'returned',       // Возвращен
        'cancelled'       // Отменен
      ],
      required: true
    },
    
    timestamp: {
      type: Date,
      default: Date.now
    },
    
    location: {
      name: String,
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    
    note: String,
    
    // Кто обновил статус
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Автоматическое обновление или ручное
    isAutomatic: {
      type: Boolean,
      default: false
    },

    // Доказательства (фото доставки и т.д.)
    proof: [{
      type: {
        type: String,
        enum: ['photo', 'signature', 'document']
      },
      url: String,
      description: String
    }]
  }],

  // Текущий статус (для быстрого поиска)
  currentStatus: {
    type: String,
    enum: [
      'created', 'confirmed', 'packed', 'picked_up', 
      'in_transit', 'out_for_delivery', 'delivered', 
      'failed_delivery', 'returned', 'cancelled'
    ],
    default: 'created'
  },

  // Уведомления
  notifications: {
    // SMS уведомления
    sms: {
      enabled: { type: Boolean, default: true },
      phone: String,
      lastSent: Date,
      sentStatuses: [String] // Статусы, для которых уже отправлены SMS
    },

    // Email уведомления
    email: {
      enabled: { type: Boolean, default: true },
      address: String,
      lastSent: Date,
      sentStatuses: [String]
    },

    // Push уведомления
    push: {
      enabled: { type: Boolean, default: true },
      deviceTokens: [String],
      lastSent: Date
    }
  },

  // Проблемы с доставкой
  issues: [{
    type: {
      type: String,
      enum: ['address_incorrect', 'customer_unavailable', 'damaged_package', 'lost_package', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: Date,
    resolution: String
  }],

  // Дополнительная информация
  metadata: {
    // Вес и размеры
    weight: Number, // в граммах
    dimensions: {
      length: Number, // в см
      width: Number,
      height: Number
    },

    // Особенности доставки
    isFragile: { type: Boolean, default: false },
    requiresSignature: { type: Boolean, default: false },
    ageRestricted: { type: Boolean, default: false },

    // Временные ограничения
    deliveryTimeRestriction: {
      from: String, // "09:00"
      to: String    // "18:00"
    },

    // Предпочтения покупателя
    deliveryPreferences: {
      preferredTime: String,
      leaveAtDoor: { type: Boolean, default: false },
      callBeforeDelivery: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true
});

// Индексы для производительности
orderTrackingSchema.index({ order: 1 });
orderTrackingSchema.index({ trackingNumber: 1 });
orderTrackingSchema.index({ currentStatus: 1 });
orderTrackingSchema.index({ 'delivery.service': 1 });
orderTrackingSchema.index({ createdAt: -1 });

// Виртуальные поля
orderTrackingSchema.virtual('isDelivered').get(function() {
  return this.currentStatus === 'delivered';
});

orderTrackingSchema.virtual('isInProgress').get(function() {
  return ['confirmed', 'packed', 'picked_up', 'in_transit', 'out_for_delivery'].includes(this.currentStatus);
});

orderTrackingSchema.virtual('estimatedDeliveryText').get(function() {
  if (!this.delivery.estimatedDelivery.from) return 'Уточняется';
  
  const fromDate = new Date(this.delivery.estimatedDelivery.from);
  const toDate = new Date(this.delivery.estimatedDelivery.to);
  
  if (fromDate.toDateString() === toDate.toDateString()) {
    return fromDate.toLocaleDateString('ru-RU');
  }
  
  return `${fromDate.toLocaleDateString('ru-RU')} - ${toDate.toLocaleDateString('ru-RU')}`;
});

// Статические методы
orderTrackingSchema.statics.generateTrackingNumber = function() {
  const prefix = 'TM'; // Tendo Market
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

orderTrackingSchema.statics.findByTrackingNumber = function(trackingNumber) {
  return this.findOne({ trackingNumber })
    .populate('order')
    .populate('statusHistory.updatedBy', 'firstName lastName');
};

orderTrackingSchema.statics.findActiveDeliveries = function() {
  return this.find({
    currentStatus: { $in: ['confirmed', 'packed', 'picked_up', 'in_transit', 'out_for_delivery'] }
  }).populate('order', 'orderNumber customer pricing');
};

// Методы экземпляра
orderTrackingSchema.methods.updateStatus = function(newStatus, location = null, note = '', updatedBy = null, proof = []) {
  // Добавляем новый статус в историю
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    location,
    note,
    updatedBy,
    proof,
    isAutomatic: !updatedBy
  });

  // Обновляем текущий статус
  this.currentStatus = newStatus;

  return this.save();
};

orderTrackingSchema.methods.addIssue = function(issueType, description) {
  this.issues.push({
    type: issueType,
    description,
    reportedAt: new Date()
  });

  return this.save();
};

orderTrackingSchema.methods.resolveIssue = function(issueId, resolution) {
  const issue = this.issues.id(issueId);
  if (issue) {
    issue.resolvedAt = new Date();
    issue.resolution = resolution;
  }

  return this.save();
};

orderTrackingSchema.methods.sendNotification = function(type, status) {
  const notificationConfig = this.notifications[type];
  
  if (notificationConfig.enabled && !notificationConfig.sentStatuses.includes(status)) {
    notificationConfig.sentStatuses.push(status);
    notificationConfig.lastSent = new Date();
    
    // TODO: Здесь будет интеграция с SMS/Email/Push сервисами
    console.log(`Sending ${type} notification for status: ${status}`);
    
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Middleware для автоматических уведомлений
orderTrackingSchema.post('save', async function(doc) {
  if (doc.isModified('currentStatus')) {
    // Отправляем уведомления при изменении статуса
    try {
      await doc.sendNotification('sms', doc.currentStatus);
      await doc.sendNotification('email', doc.currentStatus);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }
});

module.exports = mongoose.model('OrderTracking', orderTrackingSchema);

