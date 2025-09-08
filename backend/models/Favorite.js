const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  // Additional metadata for better user experience
  priceWhenAdded: {
    type: Number,
    required: true
  },
  notifications: {
    priceDropEnabled: {
      type: Boolean,
      default: true
    },
    backInStockEnabled: {
      type: Boolean,
      default: true
    }
  },
  tags: [{
    type: String,
    trim: true
  }], // User can tag favorites (e.g., "birthday gift", "wishlist")
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  }, // 1-5 priority system
  notes: {
    type: String,
    maxlength: 500,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to prevent duplicate favorites
favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

// Index for efficient queries
favoriteSchema.index({ user: 1, addedAt: -1 });
favoriteSchema.index({ product: 1 });
favoriteSchema.index({ 'notifications.priceDropEnabled': 1 });
favoriteSchema.index({ 'notifications.backInStockEnabled': 1 });

// Virtual for price change calculation
favoriteSchema.virtual('priceChange').get(function() {
  if (this.populated('product') && this.product.price) {
    return this.product.price - this.priceWhenAdded;
  }
  return 0;
});

// Virtual for price change percentage
favoriteSchema.virtual('priceChangePercent').get(function() {
  if (this.populated('product') && this.product.price && this.priceWhenAdded > 0) {
    return ((this.product.price - this.priceWhenAdded) / this.priceWhenAdded) * 100;
  }
  return 0;
});

// Static method to get user's favorites with advanced filtering
favoriteSchema.statics.getUserFavorites = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = 'addedAt',
    sortOrder = 'desc',
    category,
    minPrice,
    maxPrice,
    tags,
    priority,
    inStock
  } = options;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  let pipeline = [
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $match: {
        'product.isActive': true
      }
    }
  ];

  // Add filters
  const filters = {};
  if (category) filters['product.category'] = mongoose.Types.ObjectId(category);
  if (minPrice) filters['product.price'] = { $gte: minPrice };
  if (maxPrice) filters['product.price'] = { ...filters['product.price'], $lte: maxPrice };
  if (tags && tags.length > 0) filters.tags = { $in: tags };
  if (priority) filters.priority = priority;
  if (inStock !== undefined) filters['product.stock'] = inStock ? { $gt: 0 } : 0;

  if (Object.keys(filters).length > 0) {
    pipeline.push({ $match: filters });
  }

  // Add sorting and pagination
  pipeline.push(
    { $sort: sort },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'categories',
        localField: 'product.category',
        foreignField: '_id',
        as: 'product.category'
      }
    },
    {
      $unwind: {
        path: '$product.category',
        preserveNullAndEmptyArrays: true
      }
    }
  );

  return this.aggregate(pipeline);
};

// Static method to get favorite statistics
favoriteSchema.statics.getUserFavoriteStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $group: {
        _id: null,
        totalFavorites: { $sum: 1 },
        totalValue: { $sum: '$product.price' },
        averagePrice: { $avg: '$product.price' },
        inStockCount: {
          $sum: {
            $cond: [{ $gt: ['$product.stock', 0] }, 1, 0]
          }
        },
        outOfStockCount: {
          $sum: {
            $cond: [{ $eq: ['$product.stock', 0] }, 1, 0]
          }
        },
        priceDropCount: {
          $sum: {
            $cond: [{ $lt: ['$product.price', '$priceWhenAdded'] }, 1, 0]
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalFavorites: 0,
    totalValue: 0,
    averagePrice: 0,
    inStockCount: 0,
    outOfStockCount: 0,
    priceDropCount: 0
  };
};

// Instance method to check if price dropped
favoriteSchema.methods.hasPriceDropped = function() {
  return this.populated('product') && this.product.price < this.priceWhenAdded;
};

// Instance method to check if back in stock
favoriteSchema.methods.isBackInStock = function() {
  return this.populated('product') && this.product.stock > 0;
};

// Pre-save middleware to update priceWhenAdded
favoriteSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Product = mongoose.model('Product');
      const product = await Product.findById(this.product);
      if (product) {
        this.priceWhenAdded = product.price;
      }
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Post-save middleware for notifications
favoriteSchema.post('save', async function() {
  if (this.isNew) {
    // Send notification about new favorite added
    try {
      const Notification = mongoose.model('Notification');
      await Notification.create({
        recipient: this.user,
        type: 'favorite_added',
        title: 'Товар добавлен в избранное',
        message: 'Товар успешно добавлен в ваш список избранного',
        data: {
          productId: this.product,
          favoriteId: this._id
        }
      });
    } catch (error) {
      console.error('Error creating favorite notification:', error);
    }
  }
});

module.exports = mongoose.model('Favorite', favoriteSchema);