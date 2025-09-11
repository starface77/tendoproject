const express = require('express');
const router = express.Router();
const {
  advancedSearch,
  searchAutocomplete,
  getSearchFilters,
  logSearchQuery
} = require('../controllers/search');

/**
 * 🔍 МАРШРУТЫ ДЛЯ ПРОДВИНУТОГО ПОИСКА
 */

// @desc    Продвинутый поиск товаров
// @route   POST /api/v1/search
// @access  Public
router.post('/', advancedSearch);

// @desc    Автодополнение поиска
// @route   GET /api/v1/search/autocomplete
// @access  Public
router.get('/autocomplete', searchAutocomplete);

// @desc    Получить доступные фильтры
// @route   GET /api/v1/search/filters
// @access  Public
router.get('/filters', async (req, res) => {
  try {
    const { getSearchFilters } = require('../controllers/search');
    const filters = await getSearchFilters();
    
    res.json({
      success: true,
      data: filters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка получения фильтров'
    });
  }
});

// @desc    Логирование поисковых запросов
// @route   POST /api/v1/search/analytics
// @access  Public
router.post('/analytics', logSearchQuery);

module.exports = router;





