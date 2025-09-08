const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderType: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number
  }],
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const supportSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['order', 'payment', 'product', 'account', 'technical', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messages: [messageSchema],
  tags: [String],
  resolution: {
    type: String,
    maxlength: [1000, 'Resolution cannot exceed 1000 characters']
  },
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
supportSchema.index({ customer: 1, status: 1, createdAt: -1 });
supportSchema.index({ status: 1, priority: -1, createdAt: -1 });
supportSchema.index({ ticketNumber: 1 });
supportSchema.index({ assignedTo: 1, status: 1 });

// Pre-save middleware to generate ticket number
supportSchema.pre('save', function(next) {
  if (!this.ticketNumber) {
    this.ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

// Virtual for unread messages count
supportSchema.virtual('unreadCount').get(function() {
  return this.messages.filter(msg => !msg.isRead && msg.senderType === 'user').length;
});

// Method to add message
supportSchema.methods.addMessage = function(sender, senderType, message, attachments = []) {
  this.messages.push({
    sender,
    senderType,
    message,
    attachments
  });
  return this.save();
};

module.exports = mongoose.model('Support', supportSchema);




