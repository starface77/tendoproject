const express = require('express');
const Category = require('../../models/Category');
const { protect, logAdminAction } = require('../middleware/auth');

const router = express.Router();

// Получить все категории для админа
router.get('/', protect, logAdminAction('VIEW_CATEGORIES'), async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parent', 'name')
      .populate('createdBy', 'firstName lastName')
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения категорий'
    });
  }
});

module.exports = router;
