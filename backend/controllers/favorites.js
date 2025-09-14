const Favorite = require('../models/Favorite');
const Product = require('../models/Product');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Add product to favorites
exports.addToFavorites = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const { tags, priority, notes } = req.body;

    // Validate product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Товар недоступен'
      });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      user: userId,
      product: productId
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Товар уже в избранном',
        favorite: existingFavorite
      });
    }

    // Validate tags if provided
    if (tags) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({
          success: false,
          message: 'Теги должны быть массивом'
        });
      }
      
      // Validate each tag
      for (const tag of tags) {
        if (typeof tag !== 'string' || tag.trim().length === 0 || tag.trim().length > 50) {
          return res.status(400).json({
            success: false,
            message: 'Каждый тег должен быть строкой от 1 до 50 символов'
          });
        }
      }
    }

    // Validate priority if provided
    if (priority !== undefined) {
      const priorityNum = parseInt(priority);
      if (isNaN(priorityNum) || priorityNum < 1 || priorityNum > 5) {
        return res.status(400).json({
          success: false,
          message: 'Приоритет должен быть целым числом от 1 до 5'
        });
      }
    }

    // Validate notes if provided
    if (notes !== undefined) {
      if (typeof notes !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Примечания должны быть строкой'
        });
      }
      
      if (notes.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Примечания не должны превышать 500 символов'
        });
      }
    }

    // Create new favorite
    const favoriteData = {
      user: userId,
      product: productId,
      priceWhenAdded: product.price
    };

    if (tags) favoriteData.tags = tags.map(tag => tag.trim());
    if (priority) favoriteData.priority = parseInt(priority);
    if (notes) favoriteData.notes = notes.trim();

    const favorite = new Favorite(favoriteData);
    await favorite.save();

    // Populate the favorite with product and user details
    await favorite.populate([
      {
        path: 'product',
        populate: {
          path: 'category seller',
          select: 'name businessName'
        }
      },
      {
        path: 'user',
        select: 'firstName lastName email'
      }
    ]);

    // Update user's favorite count
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.favoritesCount': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Товар добавлен в избранное',
      favorite
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера',
      error: error.message
    });
  }
};

// Remove product from favorites
exports.removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOneAndDelete({
      user: userId,
      product: productId
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден в избранном'
      });
    }

    // Update user's favorite count
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.favoritesCount': -1 }
    });

    res.json({
      success: true,
      message: 'Товар удален из избранного'
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера',
      error: error.message
    });
  }
};

// Get user's favorites with advanced filtering
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
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
      inStock,
      search
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      tags: tags ? tags.split(',') : undefined,
      priority: priority ? parseInt(priority) : undefined,
      inStock: inStock !== undefined ? inStock === 'true' : undefined
    };

    let favorites;
    
    if (search) {
      // Use text search if search term provided
      favorites = await Favorite.find({ user: userId })
        .populate({
          path: 'product',
          match: {
            isActive: true,
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
              { 'specifications.brand': { $regex: search, $options: 'i' } }
            ]
          },
          populate: {
            path: 'category seller',
            select: 'name businessName'
          }
        })
        .populate({
          path: 'user',
          select: 'firstName lastName'
        })
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      
      // Filter out favorites where product was not found due to search
      favorites = favorites.filter(fav => fav.product);
    } else {
      favorites = await Favorite.getUserFavorites(userId, options);
    }

    // Get total count for pagination
    const totalFavorites = await Favorite.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalFavorites / limit);

    res.json({
      success: true,
      data: {
        favorites,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalFavorites,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера',
      error: error.message
    });
  }
};

// Check if product is in user's favorites
exports.checkFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOne({
      user: userId,
      product: productId
    });

    res.json({
      success: true,
      isFavorite: !!favorite,
      favorite: favorite || null
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера',
      error: error.message
    });
  }
};

// Update favorite metadata (tags, priority, notes)
exports.updateFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const { tags, priority, notes, notifications } = req.body;

    // Validate that favorite exists
    const existingFavorite = await Favorite.findOne({ user: userId, product: productId });
    if (!existingFavorite) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден в избранном'
      });
    }

    const updateData = {};

    // Validate and process tags if provided
    if (tags !== undefined) {
      if (tags === null) {
        updateData.tags = [];
      } else if (Array.isArray(tags)) {
        // Validate each tag
        for (const tag of tags) {
          if (typeof tag !== 'string' || tag.trim().length === 0 || tag.trim().length > 50) {
            return res.status(400).json({
              success: false,
              message: 'Каждый тег должен быть строкой от 1 до 50 символов'
            });
          }
        }
        updateData.tags = tags.map(tag => tag.trim());
      } else {
        return res.status(400).json({
          success: false,
          message: 'Теги должны быть массивом'
        });
      }
    }

    // Validate and process priority if provided
    if (priority !== undefined) {
      if (priority === null) {
        updateData.priority = 1;
      } else {
        const priorityNum = parseInt(priority);
        if (isNaN(priorityNum) || priorityNum < 1 || priorityNum > 5) {
          return res.status(400).json({
            success: false,
            message: 'Приоритет должен быть целым числом от 1 до 5'
          });
        }
        updateData.priority = priorityNum;
      }
    }

    // Validate and process notes if provided
    if (notes !== undefined) {
      if (notes === null) {
        updateData.notes = '';
      } else if (typeof notes !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Примечания должны быть строкой'
        });
      } else if (notes.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Примечания не должны превышать 500 символов'
        });
      } else {
        updateData.notes = notes.trim();
      }
    }

    // Validate and process notifications if provided
    if (notifications !== undefined) {
      if (notifications === null) {
        updateData.notifications = {
          priceDropEnabled: true,
          backInStockEnabled: true
        };
      } else if (typeof notifications === 'object' && notifications !== null) {
        const notificationUpdates = {};
        
        if (notifications.priceDropEnabled !== undefined) {
          if (typeof notifications.priceDropEnabled !== 'boolean') {
            return res.status(400).json({
              success: false,
              message: 'Настройка уведомлений о снижении цены должна быть булевым значением'
            });
          }
          notificationUpdates.priceDropEnabled = notifications.priceDropEnabled;
        }
        
        if (notifications.backInStockEnabled !== undefined) {
          if (typeof notifications.backInStockEnabled !== 'boolean') {
            return res.status(400).json({
              success: false,
              message: 'Настройка уведомлений о поступлении товара должна быть булевым значением'
            });
          }
          notificationUpdates.backInStockEnabled = notifications.backInStockEnabled;
        }
        
        updateData.notifications = { ...existingFavorite.notifications, ...notificationUpdates };
      } else {
        return res.status(400).json({
          success: false,
          message: 'Настройки уведомлений должны быть объектом'
        });
      }
    }

    const favorite = await Favorite.findOneAndUpdate(
      { user: userId, product: productId },
      updateData,
      { new: true, runValidators: true }
    ).populate([
      {
        path: 'product',
        populate: {
          path: 'category seller',
          select: 'name businessName'
        }
      }
    ]);

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден в избранном'
      });
    }

    res.json({
      success: true,
      message: 'Избранное обновлено',
      favorite
    });
  } catch (error) {
    console.error('Update favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера',
      error: error.message
    });
  }
};

// Get favorite statistics
exports.getFavoriteStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Favorite.getUserFavoriteStats(userId);

    // Get additional insights
    const recentFavorites = await Favorite.find({ user: userId })
      .populate('product', 'name price images')
      .sort({ addedAt: -1 })
      .limit(5);

    const categoriesStats = await Favorite.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
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
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category._id',
          categoryName: { $first: '$category.name' },
          count: { $sum: 1 },
          totalValue: { $sum: '$product.price' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        recentFavorites,
        topCategories: categoriesStats
      }
    });
  } catch (error) {
    console.error('Get favorite stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера',
      error: error.message
    });
  }
};

// Bulk operations for favorites
exports.bulkUpdateFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { action, productIds, updateData } = req.body;

    // Validate action
    if (!['remove', 'update'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Неверное действие. Допустимые значения: remove, update'
      });
    }

    // Validate productIds
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Не указаны товары. Массив productIds не должен быть пустым'
      });
    }

    // Validate each productId
    for (const productId of productIds) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: `Неверный ID товара: ${productId}`
        });
      }
    }

    let result;
    
    if (action === 'remove') {
      // For remove action, we don't need updateData
      result = await Favorite.deleteMany({
        user: userId,
        product: { $in: productIds }
      });
      
      // Update user's favorite count
      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.favoritesCount': -result.deletedCount }
      });
      
      res.json({
        success: true,
        message: `Удалено ${result.deletedCount} товаров из избранного`,
        deletedCount: result.deletedCount
      });
    } else if (action === 'update') {
      // For update action, validate updateData
      if (!updateData || typeof updateData !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Для действия update необходимо предоставить данные обновления'
        });
      }
      
      // Validate updateData fields
      const validFields = ['tags', 'priority', 'notes', 'notifications'];
      const updateFields = Object.keys(updateData);
      
      for (const field of updateFields) {
        if (!validFields.includes(field)) {
          return res.status(400).json({
            success: false,
            message: `Недопустимое поле для обновления: ${field}. Допустимые поля: ${validFields.join(', ')}`
          });
        }
      }
      
      // Apply additional validation for each field
      const validatedUpdateData = {};
      
      if (updateData.tags !== undefined) {
        if (updateData.tags === null) {
          validatedUpdateData.tags = [];
        } else if (Array.isArray(updateData.tags)) {
          // Validate each tag
          for (const tag of updateData.tags) {
            if (typeof tag !== 'string' || tag.trim().length === 0 || tag.trim().length > 50) {
              return res.status(400).json({
                success: false,
                message: 'Каждый тег должен быть строкой от 1 до 50 символов'
              });
            }
          }
          validatedUpdateData.tags = updateData.tags.map(tag => tag.trim());
        } else {
          return res.status(400).json({
            success: false,
            message: 'Теги должны быть массивом'
          });
        }
      }
      
      if (updateData.priority !== undefined) {
        if (updateData.priority === null) {
          validatedUpdateData.priority = 1;
        } else {
          const priorityNum = parseInt(updateData.priority);
          if (isNaN(priorityNum) || priorityNum < 1 || priorityNum > 5) {
            return res.status(400).json({
              success: false,
              message: 'Приоритет должен быть целым числом от 1 до 5'
            });
          }
          validatedUpdateData.priority = priorityNum;
        }
      }
      
      if (updateData.notes !== undefined) {
        if (updateData.notes === null) {
          validatedUpdateData.notes = '';
        } else if (typeof updateData.notes !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'Примечания должны быть строкой'
          });
        } else if (updateData.notes.length > 500) {
          return res.status(400).json({
            success: false,
            message: 'Примечания не должны превышать 500 символов'
          });
        } else {
          validatedUpdateData.notes = updateData.notes.trim();
        }
      }
      
      if (updateData.notifications !== undefined) {
        if (updateData.notifications === null) {
          validatedUpdateData.notifications = {
            priceDropEnabled: true,
            backInStockEnabled: true
          };
        } else if (typeof updateData.notifications === 'object' && updateData.notifications !== null) {
          const notificationUpdates = {};
          
          if (updateData.notifications.priceDropEnabled !== undefined) {
            if (typeof updateData.notifications.priceDropEnabled !== 'boolean') {
              return res.status(400).json({
                success: false,
                message: 'Настройка уведомлений о снижении цены должна быть булевым значением'
              });
            }
            notificationUpdates.priceDropEnabled = updateData.notifications.priceDropEnabled;
          }
          
          if (updateData.notifications.backInStockEnabled !== undefined) {
            if (typeof updateData.notifications.backInStockEnabled !== 'boolean') {
              return res.status(400).json({
                success: false,
                message: 'Настройка уведомлений о поступлении товара должна быть булевым значением'
              });
            }
            notificationUpdates.backInStockEnabled = updateData.notifications.backInStockEnabled;
          }
          
          validatedUpdateData.notifications = notificationUpdates;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Настройки уведомлений должны быть объектом'
          });
        }
      }
      
      result = await Favorite.updateMany(
        {
          user: userId,
          product: { $in: productIds }
        },
        validatedUpdateData,
        { runValidators: true }
      );
      
      res.json({
        success: true,
        message: `Обновлено ${result.modifiedCount} товаров`,
        modifiedCount: result.modifiedCount
      });
    }
  } catch (error) {
    console.error('Bulk update favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера',
      error: error.message
    });
  }
};

// Get products with price drops for user's favorites
exports.getPriceDrops = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const priceDrops = await Favorite.find({
      user: userId,
      'notifications.priceDropEnabled': true
    })
    .populate('product')
    .then(favorites => {
      return favorites.filter(fav => 
        fav.product && 
        fav.product.price < fav.priceWhenAdded
      ).map(fav => ({
        ...fav.toObject(),
        priceChange: fav.product.price - fav.priceWhenAdded,
        priceChangePercent: ((fav.product.price - fav.priceWhenAdded) / fav.priceWhenAdded) * 100
      }));
    });

    res.json({
      success: true,
      data: priceDrops
    });
  } catch (error) {
    console.error('Get price drops error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера',
      error: error.message
    });
  }
};

// Get back in stock items for user's favorites
exports.getBackInStock = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const backInStock = await Favorite.find({
      user: userId,
      'notifications.backInStockEnabled': true
    })
    .populate('product')
    .then(favorites => {
      return favorites.filter(fav => 
        fav.product && 
        fav.product.stock > 0 && 
        fav.product.wasOutOfStock // Now using the new field
      );
    });

    res.json({
      success: true,
      data: backInStock
    });
  } catch (error) {
    console.error('Get back in stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера',
      error: error.message
    });
  }
};
