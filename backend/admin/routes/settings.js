const express = require('express');
const { protect, logAdminAction, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Заглушка для настроек
router.get('/', protect, requireSuperAdmin, logAdminAction('VIEW_SETTINGS'), async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Настройки будут добавлены позже',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка получения настроек'
    });
  }
});

module.exports = router;
