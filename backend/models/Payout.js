const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'UZS',
    enum: ['UZS', 'USD', 'EUR']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'card', 'cash', 'crypto'],
    default: 'bank_transfer'
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountHolder: String,
    swiftCode: String
  },
  cardDetails: {
    cardNumber: String,
    expiryDate: String,
    cardHolder: String
  },
  reference: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  failureReason: String,
  // Orders that this payout covers
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  // Commission deducted
  commission: {
    type: Number,
    default: 0
  },
  // Net amount after commission
  netAmount: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
payoutSchema.index({ seller: 1, status: 1, createdAt: -1 });
payoutSchema.index({ status: 1, createdAt: -1 });
payoutSchema.index({ reference: 1 });

// Pre-save middleware to generate reference
payoutSchema.pre('save', function(next) {
  if (!this.reference) {
    this.reference = `PYT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

// Virtual for formatted amount
payoutSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${this.amount.toLocaleString()}`;
});

// Method to calculate commission
payoutSchema.methods.calculateCommission = function() {
  // Default commission rate is 5%
  const commissionRate = 0.05;
  this.commission = this.amount * commissionRate;
  this.netAmount = this.amount - this.commission;
  return this.commission;
};

module.exports = mongoose.model('Payout', payoutSchema);




