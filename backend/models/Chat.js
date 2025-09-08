const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    enum: ['customer', 'seller'] // Кто отправил сообщение
  },
  senderName: {
    type: String,
    required: true // Имя отправителя для отображения
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  attachments: [{
    type: String, // URL файла
    name: String  // Имя файла
  }]
});

const chatSchema = new mongoose.Schema({
  // Участники чата
  customer: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  seller: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true
    },
    businessName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  
  // Товар по которому идет чат (опционально)
  product: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    image: String
  },
  
  // Сообщения
  messages: [messageSchema],
  
  // Метаданные
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active'
  },
  
  lastMessage: {
    content: String,
    timestamp: Date,
    sender: String
  },
  
  unreadCount: {
    customer: { type: Number, default: 0 },
    seller: { type: Number, default: 0 }
  },
  
  // Временные метки
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Последняя активность участников
  lastActivity: {
    customer: Date,
    seller: Date
  }
}, {
  timestamps: true
});

// Индексы для быстрого поиска
chatSchema.index({ 'customer.id': 1, status: 1 });
chatSchema.index({ 'seller.id': 1, status: 1 });
chatSchema.index({ 'product.id': 1 });
chatSchema.index({ updatedAt: -1 });

// Методы схемы
chatSchema.methods.addMessage = function(senderType, senderName, content, attachments = []) {
  const message = {
    sender: senderType,
    senderName: senderName,
    content: content,
    timestamp: new Date(),
    attachments: attachments
  };
  
  this.messages.push(message);
  
  // Обновляем последнее сообщение
  this.lastMessage = {
    content: content,
    timestamp: message.timestamp,
    sender: senderType
  };
  
  // Увеличиваем счетчик непрочитанных для получателя
  if (senderType === 'customer') {
    this.unreadCount.seller += 1;
    this.lastActivity.customer = new Date();
  } else {
    this.unreadCount.customer += 1;
    this.lastActivity.seller = new Date();
  }
  
  this.updatedAt = new Date();
  
  return this.save();
};

chatSchema.methods.markAsRead = function(readerType) {
  // Отмечаем все сообщения как прочитанные для указанного типа пользователя
  this.messages.forEach(message => {
    if (message.sender !== readerType && !message.read) {
      message.read = true;
    }
  });
  
  // Сбрасываем счетчик непрочитанных
  if (readerType === 'customer') {
    this.unreadCount.customer = 0;
    this.lastActivity.customer = new Date();
  } else {
    this.unreadCount.seller = 0;
    this.lastActivity.seller = new Date();
  }
  
  return this.save();
};

// Статические методы
chatSchema.statics.findChatByParticipants = function(customerId, sellerId, productId = null) {
  const query = {
    'customer.id': customerId,
    'seller.id': sellerId,
    status: { $ne: 'archived' }
  };
  
  if (productId) {
    query['product.id'] = productId;
  }
  
  return this.findOne(query);
};

chatSchema.statics.getCustomerChats = function(customerId, page = 1, limit = 20) {
  return this.find({ 
    'customer.id': customerId,
    status: { $ne: 'archived' }
  })
  .sort({ updatedAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit)
  .select('-messages'); // Исключаем сообщения для списка чатов
};

chatSchema.statics.getSellerChats = function(sellerId, page = 1, limit = 20) {
  return this.find({ 
    'seller.id': sellerId,
    status: { $ne: 'archived' }
  })
  .sort({ updatedAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit)
  .select('-messages'); // Исключаем сообщения для списка чатов
};

module.exports = mongoose.model('Chat', chatSchema);



