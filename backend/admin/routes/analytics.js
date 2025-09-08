const express = require('express');
const { protect, logAdminAction } = require('../middleware/auth');

const router = express.Router();

// Заглушка для аналитики
router.get('/', protect, logAdminAction('VIEW_ANALYTICS'), async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Аналитика будет добавлена позже',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка получения аналитики'
    });
  }
});

module.exports = router;
