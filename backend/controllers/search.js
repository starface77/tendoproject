const Product = require('../models/Product')
const Category = require('../models/Category')

/**
 * 🔍 КОНТРОЛЛЕР ПОИСКА
 * Продвинутый поиск товаров с фильтрами, автодополнением и аналитикой
 */

// @desc    Продвинутый поиск товаров
// @route   POST /api/v1/search
// @access  Public
const advancedSearch = async (req, res) => {
  try {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      inStock,
      sortBy,
      page = 1,
      limit = 20,
      tags,
      seller,
      rating
    } = req.body

    // Построение поискового запроса
    let searchQuery = {}

    // Текстовый поиск по названию, описанию и тегам
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    }

    // Фильтр по категории
    if (category) {
      searchQuery.category = category
    }

    // Фильтр по цене
    if (minPrice || maxPrice) {
      searchQuery.price = {}
      if (minPrice) searchQuery.price.$gte = parseFloat(minPrice)
      if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice)
    }

    // Фильтр по наличию
    if (inStock !== undefined) {
      searchQuery.stock = { $gt: 0 }
    }

    // Фильтр по продавцу
    if (seller) {
      searchQuery.seller = seller
    }

    // Фильтр по рейтингу
    if (rating) {
      searchQuery.averageRating = { $gte: parseFloat(rating) }
    }

    // Фильтр по тегам
    if (tags && tags.length > 0) {
      searchQuery.tags = { $in: tags }
    }

    // Сортировка
    let sortOptions = {}
    switch (sortBy) {
      case 'price_asc':
        sortOptions.price = 1
        break
      case 'price_desc':
        sortOptions.price = -1
        break
      case 'rating':
        sortOptions.averageRating = -1
        break
      case 'newest':
        sortOptions.createdAt = -1
        break
      case 'sales':
        sortOptions.soldCount = -1
        break
      default:
        sortOptions.createdAt = -1
    }

    // Выполнение поиска
    const products = await Product
      .find(searchQuery)
      .populate('category', 'name slug')
      .populate('seller', 'name rating')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    // Подсчет общего количества
    const total = await Product.countDocuments(searchQuery)

    // Статистика поиска
    const searchStats = {
      totalResults: total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
      hasPrev: parseInt(page) > 1
    }

    res.json({
      success: true,
      data: products,
      pagination: searchStats,
      query: {
        searchTerm: query,
        appliedFilters: {
          category,
          priceRange: { min: minPrice, max: maxPrice },
          inStock,
          seller,
          rating,
          tags
        }
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка поиска'
    })
  }
}

// @desc    Автодополнение поиска
// @route   GET /api/v1/search/autocomplete
// @access  Public
const searchAutocomplete = async (req, res) => {
  try {
    const { q } = req.query

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: {
          products: [],
          categories: [],
          suggestions: []
        }
      })
    }

    // Поиск товаров
    const products = await Product
      .find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } }
        ]
      })
      .select('name price images category')
      .populate('category', 'name')
      .limit(5)

    // Поиск категорий
    const categories = await Category
      .find({ name: { $regex: q, $options: 'i' } })
      .select('name slug icon')
      .limit(3)

    // Генерация предложений
    const suggestions = [
      `${q} купить`,
      `${q} цена`,
      `${q} отзывы`,
      `лучший ${q}`,
      `дешевый ${q}`
    ]

    res.json({
      success: true,
      data: {
        products,
        categories,
        suggestions
      }
    })
  } catch (error) {
    console.error('Autocomplete error:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка автодополнения'
    })
  }
}

// @desc    Получить доступные фильтры
// @route   GET /api/v1/search/filters
// @access  Public
const getSearchFilters = async () => {
  try {
    // Получаем все категории
    const categories = await Category.find({}).select('name slug')

    // Получаем диапазон цен
    const priceRange = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ])

    // Получаем популярные теги
    const tags = await Product.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ])

    return {
      categories,
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000000 },
      popularTags: tags.map(tag => tag._id),
      sortOptions: [
        { value: 'newest', label: 'Сначала новые' },
        { value: 'price_asc', label: 'Цена: по возрастанию' },
        { value: 'price_desc', label: 'Цена: по убыванию' },
        { value: 'rating', label: 'По рейтингу' },
        { value: 'sales', label: 'По популярности' }
      ]
    }
  } catch (error) {
    console.error('Get filters error:', error)
    throw error
  }
}

// @desc    Логирование поисковых запросов
// @route   POST /api/v1/search/analytics
// @access  Public
const logSearchQuery = async (req, res) => {
  try {
    const { query, results, userId } = req.body

    // Здесь можно добавить логику сохранения аналитики поиска
    // Например, в отдельную коллекцию SearchAnalytics

    res.json({
      success: true,
      message: 'Поисковый запрос зарегистрирован'
    })
  } catch (error) {
    console.error('Log search error:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка логирования'
    })
  }
}

module.exports = {
  advancedSearch,
  searchAutocomplete,
  getSearchFilters,
  logSearchQuery
}