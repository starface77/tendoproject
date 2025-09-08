const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');

// Демо хранилище для демо режима
// demoStorage отключен - используем только MongoDB

/**
 * 📱 КОНТРОЛЛЕР ТОВАРОВ
 * CRUD операции с товарами, поиск, фильтрация
 */

// @desc    Получить все товары
// @route   GET /api/v1/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      sort = '-createdAt',
      featured,
      inStock
    } = req.query;

    // Enforce reasonable limits to prevent timeouts
    const limitNum = Math.min(parseInt(limit), 50); // Max 50 items per request
    const pageNum = parseInt(page);

    // Построение запроса
    const query = { status: 'active', isActive: true };
    
    console.log('🔍 Product query:', JSON.stringify(query));

    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (featured === 'true') query.isFeatured = true;
    if (inStock === 'true') query.isInStock = true;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      // Simplified search to prevent timeout
      query.$or = [
        { 'name.ru': { $regex: search, $options: 'i' } },
        { 'name.uz': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } }
      ];
    }

    let products, total;

    // Используем только MongoDB with timeout protection
    const productsPromise = Product.find(query)
      // .populate('category', 'name slug') // Временно отключено для тестирования
      .sort(sort)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .select('-__v')
      .maxTimeMS(5000); // 5 second timeout
      
    console.log('🔍 Executing query with limit:', limitNum, 'skip:', (pageNum - 1) * limitNum);

    const countPromise = Product.countDocuments(query).maxTimeMS(3000); // 3 second timeout

    [products, total] = await Promise.all([productsPromise, countPromise]);

    console.log('📊 Found products:', products.length, 'total:', total);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      },
      data: products
    });

  } catch (error) {
    console.error('Get Products Error:', error);
    
    // Handle timeout errors specifically
    if (error.name === 'MongooseError' && error.message.includes('timeout')) {
      return res.status(503).json({
        success: false,
        error: 'Запрос занял слишком много времени, попробуйте упростить фильтры'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Ошибка получения товаров'
    });
  }
};

// @desc    Получить товар по ID
// @route   GET /api/v1/products/:id
// @access  Public
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный формат ID товара'
      });
    }

    const product = await Product.findOne({
      _id: id,
      status: 'active',
      isActive: true
    })
      .populate('category', 'name slug')
      .populate('createdBy', 'firstName lastName')
      .populate('seller', 'firstName lastName name storeName verified rating');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Товар не найден'
      });
    }

    // Увеличиваем счетчик просмотров
    try {
      await product.incrementViews();
    } catch (viewError) {
      console.warn('Failed to increment product views:', viewError.message);
    }

    // Получаем похожие товары
    const similarProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'active',
      isActive: true
    })
      .limit(4)
      .select('name images price rating')
      .lean();

    console.log('📦 Отправляем данные товара:', {
      id: product._id,
      name: product.name,
      images: product.images?.length || 0,
      seller: product.seller?._id || 'no seller'
    });

    res.status(200).json({
      success: true,
      data: {
        product,
        similarProducts
      }
    });

  } catch (error) {
    console.error('Get Product Error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Некорректный формат ID товара'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Ошибка получения товара'
    });
  }
};

// @desc    Создать товар
// @route   POST /api/v1/products
// @access  Private (Admin)
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    // Проверяем существование категории
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          error: 'Категория не найдена'
        });
      }
    }

    // Адаптируем данные для правильной структуры
    const productData = {
      name: typeof req.body.name === 'string' ? {
        ru: req.body.name,
        uz: req.body.name,
        en: req.body.name
      } : req.body.name,
      description: typeof req.body.description === 'string' ? {
        ru: req.body.description || 'Описание товара',
        uz: req.body.description || 'Mahsulot tavsifi',
        en: req.body.description || 'Product description'
      } : req.body.description || {
        ru: 'Описание товара',
        uz: 'Mahsulot tavsifi',
        en: 'Product description'
      },
      price: Number(req.body.price),
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : undefined,
      category: req.body.category,
      brand: req.body.brand || 'Other',
      model: req.body.model || 'Generic',
      material: req.body.material || 'silicone',
      images: Array.isArray(req.body.images) ? req.body.images : [],
      image: req.body.image || (req.body.images && req.body.images[0]) || null,
      isActive: req.body.isActive !== false,
      inStock: req.body.inStock !== false,
      isNew: req.body.isNew || false,
      featured: req.body.featured || false,
      status: 'active',
      stock: req.body.stock || 1,
      createdBy: req.user._id,
      // SEO данные
      slug: req.body.slug,
      metaTitle: req.body.metaTitle ? {
        ru: req.body.metaTitle,
        uz: req.body.metaTitle,
        en: req.body.metaTitle
      } : undefined,
      metaDescription: req.body.metaDescription ? {
        ru: req.body.metaDescription,
        uz: req.body.metaDescription,
        en: req.body.metaDescription
      } : undefined,
      // Дополнительные поля
      shortDescription: req.body.shortDescription ? {
        ru: req.body.shortDescription,
        uz: req.body.shortDescription,
        en: req.body.shortDescription
      } : undefined,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      features: Array.isArray(req.body.features) ? req.body.features : [],
      specifications: Array.isArray(req.body.specifications) ? req.body.specifications : [],
      variants: Array.isArray(req.body.variants) ? req.body.variants : []
    };

    const product = new Product(productData);
    await product.save();

    await product.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Товар успешно создан',
      data: product
    });

  } catch (error) {
    console.error('Create Product Error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации данных',
        details: errors
      });
    }
    res.status(500).json({
      success: false,
      error: 'Ошибка создания товара: ' + error.message
    });
  }
};

// @desc    Обновить товар
// @route   PUT /api/v1/products/:id
// @access  Private (Admin)
const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Товар не найден'
      });
    }

    // Проверяем категорию если она обновляется
    if (req.body.category && req.body.category !== product.category.toString()) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          error: 'Категория не найдена'
        });
      }
    }

    // Добавляем обновителя
    req.body.updatedBy = req.user._id;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Товар успешно обновлен',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления товара'
    });
  }
};

// @desc    Удалить товар
// @route   DELETE /api/v1/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Товар не найден'
      });
    }

    // Мягкое удаление - меняем статус
    product.status = 'discontinued';
    product.isActive = false;
    product.discontinuedDate = new Date();
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Товар успешно удален'
    });

  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления товара'
    });
  }
};

// @desc    Получить товары по категории
// @route   GET /api/v1/products/category/:categoryId
// @access  Public
const getProductsByCategory = async (req, res) => {
  try {
    const { page = 1, limit = 12, sort = '-createdAt' } = req.query;

    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Категория не найдена'
      });
    }

    const products = await Product.find({
      category: req.params.categoryId,
      status: 'active',
      isActive: true
    })
      .populate('category', 'name slug')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments({
      category: req.params.categoryId,
      status: 'active',
      isActive: true
    });

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: {
        category: {
          id: category._id,
          name: category.name,
          slug: category.slug
        },
        products
      }
    });

  } catch (error) {
    console.error('Get Products By Category Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения товаров категории'
    });
  }
};

// @desc    Получить рекомендуемые товары
// @route   GET /api/v1/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      isFeatured: true,
      status: 'active',
      isActive: true
    })
      .populate('category', 'name slug')
      .sort({ purchases: -1, 'rating.average': -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    console.error('Get Featured Products Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения рекомендуемых товаров'
    });
  }
};

// @desc    Поиск товаров
// @route   GET /api/v1/products/search
// @access  Public
const searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 12, sort = 'relevance' } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Поисковый запрос обязателен'
      });
    }

    // Текстовый поиск
    const searchQuery = {
      $and: [
        {
          $or: [
            { 'name.ru': { $regex: q, $options: 'i' } },
            { 'name.uz': { $regex: q, $options: 'i' } },
            { 'name.en': { $regex: q, $options: 'i' } },
            { 'description.ru': { $regex: q, $options: 'i' } },
            { 'description.uz': { $regex: q, $options: 'i' } },
            { 'description.en': { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } },
            { brand: { $regex: q, $options: 'i' } },
            { model: { $regex: q, $options: 'i' } }
          ]
        },
        {
          status: 'active',
          isActive: true
        }
      ]
    };

    let sortOptions = {};
    if (sort === 'relevance') {
      sortOptions = { score: { $meta: 'textScore' } };
    } else {
      sortOptions = { [sort.replace('-', '')]: sort.startsWith('-') ? -1 : 1 };
    }

    const products = await Product.find(searchQuery)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      query: q,
      count: products.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: products
    });

  } catch (error) {
    console.error('Search Products Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка поиска товаров'
    });
  }
};

// @desc    Получить отзывы товара
// @route   GET /api/v1/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, rating, sort = '-createdAt' } = req.query;

    const query = {
      product: req.params.id,
      isApproved: true
    };

    if (rating) {
      query.rating = parseInt(rating);
    }

    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName avatar')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments(query);

    // Статистика рейтингов
    const ratingStats = await Review.getProductRating(req.params.id);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      stats: ratingStats,
      data: reviews
    });

  } catch (error) {
    console.error('Get Product Reviews Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения отзывов'
    });
  }
};

// @desc    Добавить отзыв к товару
// @route   POST /api/v1/products/:id/reviews
// @access  Private
const addProductReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Товар не найден'
      });
    }

    // Проверяем, не оставлял ли пользователь уже отзыв
    const existingReview = await Review.findOne({
      product: req.params.id,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'Вы уже оставляли отзыв на этот товар'
      });
    }

    const reviewData = {
      ...req.body,
      product: req.params.id,
      user: req.user._id,
      language: req.user.language || 'ru'
    };

    const review = new Review(reviewData);
    await review.save();

    await review.populate('user', 'firstName lastName avatar');

    // Обновляем рейтинг товара
    await product.updateRating();

    res.status(201).json({
      success: true,
      message: 'Отзыв успешно добавлен',
      data: review
    });

  } catch (error) {
    console.error('Add Product Review Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка добавления отзыва'
    });
  }
};

// Удаляем дубликат

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
  getProductReviews,
  addProductReview
};
