const { validationResult } = require('express-validator');
const Category = require('../models/Category');
const Product = require('../models/Product');

/**
 * 📂 КОНТРОЛЛЕР КАТЕГОРИЙ
 * CRUD операции с категориями, древо категорий
 */

// @desc    Получить все категории
// @route   GET /api/v1/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const { parent, level, featured } = req.query;

    const query = { isActive: true };
    
    if (parent) query.parent = parent;
    if (level !== undefined) query.level = parseInt(level);
    if (featured === 'true') query.isFeatured = true;

    const categories = await Category.find(query)
      .populate('parent', 'name slug')
      .sort({ sortOrder: 1, 'name.ru': 1 })
      .select('-createdBy -updatedBy -__v');

    res.status(200).json({
      success: true,
      count: categories.length,
      categories: categories,
      data: categories
    });

  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения категорий'
    });
  }
};

// @desc    Получить категорию по ID или slug
// @route   GET /api/v1/categories/:id
// @access  Public
const getCategory = async (req, res) => {
  try {
    let query = { isActive: true, isVisible: true };
    
    // Проверяем, является ли параметр ObjectId или slug
    const { id } = req.params;
    
    // Если параметр выглядит как ObjectId (24 символа hex), ищем по _id
    // Иначе ищем по slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = id;
    } else {
      query.slug = id;
    }

    const category = await Category.findOne(query)
      .populate('parent', 'name slug')
      .populate({
        path: 'children',
        select: 'name slug icon'
      });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Категория не найдена'
      });
    }

    // Получаем дочерние категории
    const children = await Category.find({
      parent: category._id,
      isActive: true,
      isVisible: true
    }).select('name slug icon productCount').sort({ sortOrder: 1 });

    // Получаем товары категории (первые 12)
    const products = await Product.find({
      category: category._id,
      status: 'active',
      isActive: true
    })
      .select('name images price rating isOnSale originalPrice')
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(12);

    // Обновляем счетчик просмотров
    category.viewCount += 1;
    await category.save();

    res.status(200).json({
      success: true,
      data: {
        category,
        children,
        products,
        productCount: category.productCount
      }
    });

  } catch (error) {
    console.error('Get Category Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения категории'
    });
  }
};

// @desc    Создать категорию
// @route   POST /api/v1/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    // Проверяем родительскую категорию
    if (req.body.parent) {
      const parentCategory = await Category.findById(req.body.parent);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          error: 'Родительская категория не найдена'
        });
      }
    }

    // Добавляем создателя
    req.body.createdBy = req.user._id;

    const category = new Category(req.body);
    await category.save();

    await category.populate('parent', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Категория успешно создана',
      data: category
    });

  } catch (error) {
    console.error('Create Category Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания категории'
    });
  }
};

// @desc    Обновить категорию
// @route   PUT /api/v1/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Категория не найдена'
      });
    }

    // Проверяем родительскую категорию
    if (req.body.parent) {
      const parentCategory = await Category.findById(req.body.parent);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          error: 'Родительская категория не найдена'
        });
      }

      // Проверяем, что категория не становится родителем самой себе
      if (req.body.parent === req.params.id) {
        return res.status(400).json({
          success: false,
          error: 'Категория не может быть родителем самой себе'
        });
      }
    }

    // Добавляем обновителя
    req.body.updatedBy = req.user._id;

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('parent', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Категория успешно обновлена',
      data: updatedCategory
    });

  } catch (error) {
    console.error('Update Category Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления категории'
    });
  }
};

// @desc    Удалить категорию
// @route   DELETE /api/v1/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Категория не найдена'
      });
    }

    // Проверяем наличие дочерних категорий
    const childrenCount = await Category.countDocuments({ parent: category._id });
    if (childrenCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Нельзя удалить категорию с подкатегориями'
      });
    }

    // Проверяем наличие товаров
    const productsCount = await Product.countDocuments({ category: category._id });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Нельзя удалить категорию с товарами'
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Категория успешно удалена'
    });

  } catch (error) {
    console.error('Delete Category Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления категории'
    });
  }
};

// @desc    Получить древо категорий
// @route   GET /api/v1/categories/tree
// @access  Public
const getCategoryTree = async (req, res) => {
  try {
    const buildTree = async (parentId = null, depth = 0) => {
      if (depth > 3) return []; // Максимальная глубина

      const categories = await Category.find({
        parent: parentId,
        isActive: true,
        isVisible: true
      })
        .sort({ order: 1, 'name.ru': 1 })
        .select('name slug icon image color order productCount isFeatured');

      const tree = [];
      for (const category of categories) {
        const children = await buildTree(category._id, depth + 1);
        tree.push({
          ...category.toObject(),
          children
        });
      }

      return tree;
    };

    const tree = await buildTree();

    res.status(200).json({
      success: true,
      data: tree
    });

  } catch (error) {
    console.error('Get Category Tree Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения древа категорий'
    });
  }
};

// @desc    Получить рекомендуемые категории
// @route   GET /api/v1/categories/featured
// @access  Public
const getFeaturedCategories = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const categories = await Category.find({
      isFeatured: true,
      isActive: true,
      isVisible: true
    })
      .sort({ order: 1, productCount: -1 })
      .limit(parseInt(limit))
      .select('name slug icon image color productCount');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });

  } catch (error) {
    console.error('Get Featured Categories Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения рекомендуемых категорий'
    });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getFeaturedCategories
};

