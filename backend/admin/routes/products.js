const express = require('express');
const Product = require('../../models/Product');
const { protect, logAdminAction } = require('../middleware/auth');

const router = express.Router();

/**
 * 📦 АДМИНСКИЕ МАРШРУТЫ ТОВАРОВ
 */

// Получить все товары для админа
router.get('/', protect, logAdminAction('VIEW_PRODUCTS'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      brand,
      status,
      lowStock,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Фильтры
    if (search) {
      query.$or = [
        { 'name.ru': { $regex: search, $options: 'i' } },
        { 'name.uz': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (status) query.status = status;
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('createdBy', 'firstName lastName email')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения товаров'
    });
  }
});

// Получить статистику товаров
router.get('/stats', protect, logAdminAction('VIEW_PRODUCT_STATS'), async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
          draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
          lowStock: { $sum: { $cond: [{ $lte: ['$stock', '$lowStockThreshold'] }, 1, 0] } }
        }
      }
    ]);

    const brandStats = await Product.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          active: 0,
          inactive: 0,
          draft: 0,
          totalStock: 0,
          totalValue: 0,
          lowStock: 0
        },
        byBrand: brandStats
      }
    });

  } catch (error) {
    console.error('Product Stats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения статистики товаров'
    });
  }
});

module.exports = router;
