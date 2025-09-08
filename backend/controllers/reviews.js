const { validationResult } = require('express-validator');
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * ⭐ КОНТРОЛЛЕР ОТЗЫВОВ
 * Управление отзывами (для админов и модераторов)
 */

// @desc    Получить все отзывы (админ)
// @route   GET /api/v1/reviews
// @access  Private (Admin/Moderator)
const getReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      rating,
      isApproved,
      product,
      user,
      dateFrom,
      dateTo,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (rating) query.rating = parseInt(rating);
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    if (product) query.product = product;
    if (user) query.user = user;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName email avatar')
      .populate('product', 'name images price')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: reviews
    });

  } catch (error) {
    console.error('Get Reviews Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения отзывов'
    });
  }
};

// @desc    Получить отзыв по ID
// @route   GET /api/v1/reviews/:id
// @access  Private (Admin/Moderator)
const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'firstName lastName email avatar phone')
      .populate('product', 'name images price brand model')
      .populate('responses.user', 'firstName lastName role');

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Отзыв не найден'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Get Review Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения отзыва'
    });
  }
};

// @desc    Одобрить отзыв
// @route   PATCH /api/v1/reviews/:id/approve
// @access  Private (Admin/Moderator)
const approveReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Отзыв не найден'
      });
    }

    review.isApproved = true;
    review.approvedBy = req.user._id;
    review.approvedAt = new Date();
    await review.save();

    // Обновляем рейтинг товара
    const product = await Product.findById(review.product);
    if (product) {
      await product.updateRating();
    }

    res.status(200).json({
      success: true,
      message: 'Отзыв одобрен',
      data: review
    });

  } catch (error) {
    console.error('Approve Review Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка одобрения отзыва'
    });
  }
};

// @desc    Отклонить отзыв
// @route   PATCH /api/v1/reviews/:id/reject
// @access  Private (Admin/Moderator)
const rejectReview = async (req, res) => {
  try {
    const { reason } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Отзыв не найден'
      });
    }

    review.isApproved = false;
    review.rejectedBy = req.user._id;
    review.rejectedAt = new Date();
    review.rejectionReason = reason;
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Отзыв отклонен',
      data: review
    });

  } catch (error) {
    console.error('Reject Review Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка отклонения отзыва'
    });
  }
};

// @desc    Удалить отзыв
// @route   DELETE /api/v1/reviews/:id
// @access  Private (Admin/Super Admin)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Отзыв не найден'
      });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    // Обновляем рейтинг товара
    const product = await Product.findById(productId);
    if (product) {
      await product.updateRating();
    }

    res.status(200).json({
      success: true,
      message: 'Отзыв удален'
    });

  } catch (error) {
    console.error('Delete Review Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления отзыва'
    });
  }
};

// @desc    Ответить на отзыв
// @route   POST /api/v1/reviews/:id/respond
// @access  Private (Admin/Moderator/Seller)
const respondToReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    const { content } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Отзыв не найден'
      });
    }

    const response = {
      user: req.user._id,
      content,
      createdAt: new Date()
    };

    review.responses.push(response);
    await review.save();

    await review.populate('responses.user', 'firstName lastName role');

    res.status(201).json({
      success: true,
      message: 'Ответ добавлен',
      data: review
    });

  } catch (error) {
    console.error('Respond to Review Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка добавления ответа'
    });
  }
};

// @desc    Получить статистику отзывов
// @route   GET /api/v1/reviews/stats
// @access  Private (Admin)
const getReviewStats = async (req, res) => {
  try {
    // Общая статистика
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          approved: { $sum: { $cond: ['$isApproved', 1, 0] } },
          pending: { $sum: { $cond: ['$isApproved', 0, 1] } },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    // Статистика по рейтингам
    const ratingStats = await Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);

    // Статистика по дням (последние 30 дней)
    const dailyStats = await Review.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Топ товары по количеству отзывов
    const topProducts = await Review.aggregate([
      { $group: { _id: '$product', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productName: '$product.name',
          count: 1,
          avgRating: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          approved: 0,
          pending: 0,
          avgRating: 0
        },
        byRating: ratingStats,
        daily: dailyStats,
        topProducts
      }
    });

  } catch (error) {
    console.error('Review Stats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения статистики отзывов'
    });
  }
};

// @desc    Массовые операции с отзывами
// @route   POST /api/v1/reviews/bulk
// @access  Private (Admin)
const bulkReviewOperations = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    const { action, reviewIds, reason } = req.body;

    let result;

    switch (action) {
      case 'approve':
        result = await Review.updateMany(
          { _id: { $in: reviewIds } },
          {
            isApproved: true,
            approvedBy: req.user._id,
            approvedAt: new Date()
          }
        );
        break;

      case 'reject':
        result = await Review.updateMany(
          { _id: { $in: reviewIds } },
          {
            isApproved: false,
            rejectedBy: req.user._id,
            rejectedAt: new Date(),
            rejectionReason: reason
          }
        );
        break;

      case 'delete':
        result = await Review.deleteMany({ _id: { $in: reviewIds } });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Неверное действие'
        });
    }

    // Обновляем рейтинги всех затронутых товаров
    const reviews = await Review.find({ _id: { $in: reviewIds } }).distinct('product');
    for (const productId of reviews) {
      const product = await Product.findById(productId);
      if (product) {
        await product.updateRating();
      }
    }

    res.status(200).json({
      success: true,
      message: `Массовая операция "${action}" выполнена`,
      modified: result.modifiedCount || result.deletedCount
    });

  } catch (error) {
    console.error('Bulk Review Operations Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка массовой операции'
    });
  }
};

module.exports = {
  getReviews,
  getReview,
  approveReview,
  rejectReview,
  deleteReview,
  respondToReview,
  getReviewStats,
  bulkReviewOperations
};