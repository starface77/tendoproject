const Payout = require('../models/Payout');
const User = require('../models/User');
const Order = require('../models/Order');

/**
 * 💰 PAYOUTS CONTROLLER
 * Payout management for admin panel
 */

// @desc    Get all payouts
// @route   GET /api/v1/payouts
// @access  Private (Admin)
const getPayouts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    const sort = req.query.sort || 'createdAt';

    // Build query
    const query = {};

    // Add search filter
    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== 'all') {
      query.status = status;
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'amount':
        sortObj = { amount: -1 };
        break;
      case 'seller':
        sortObj = { 'seller.firstName': 1, 'seller.lastName': 1 };
        break;
      case 'status':
        sortObj = { status: 1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const payouts = await Payout.find(query)
      .populate('seller', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName')
      .populate('orders', 'orderNumber pricing.total')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const totalCount = await Payout.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: payouts.map(payout => ({
        id: payout._id,
        reference: payout.reference,
        seller: {
          id: payout.seller._id,
          name: `${payout.seller.firstName} ${payout.seller.lastName}`,
          email: payout.seller.email
        },
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        paymentMethod: payout.paymentMethod,
        description: payout.description,
        orders: payout.orders.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          amount: order.pricing.total
        })),
        commission: payout.commission,
        netAmount: payout.netAmount,
        processedBy: payout.processedBy ? `${payout.processedBy.firstName} ${payout.processedBy.lastName}` : null,
        processedAt: payout.processedAt,
        failureReason: payout.failureReason,
        createdAt: payout.createdAt
      })),
      pagination: {
        page,
        limit,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get Payouts Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payouts'
    });
  }
};

// @desc    Get single payout
// @route   GET /api/v1/payouts/:id
// @access  Private (Admin)
const getPayout = async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id)
      .populate('seller', 'firstName lastName email phone')
      .populate('processedBy', 'firstName lastName')
      .populate('orders', 'orderNumber pricing.total status createdAt');

    if (!payout) {
      return res.status(404).json({
        success: false,
        error: 'Payout not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: payout._id,
        reference: payout.reference,
        seller: {
          id: payout.seller._id,
          name: `${payout.seller.firstName} ${payout.seller.lastName}`,
          email: payout.seller.email,
          phone: payout.seller.phone
        },
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        paymentMethod: payout.paymentMethod,
        bankDetails: payout.bankDetails,
        cardDetails: payout.cardDetails,
        description: payout.description,
        orders: payout.orders.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          amount: order.pricing.total,
          status: order.status,
          createdAt: order.createdAt
        })),
        commission: payout.commission,
        netAmount: payout.netAmount,
        processedBy: payout.processedBy ? `${payout.processedBy.firstName} ${payout.processedBy.lastName}` : null,
        processedAt: payout.processedAt,
        failureReason: payout.failureReason,
        createdAt: payout.createdAt,
        updatedAt: payout.updatedAt
      }
    });

  } catch (error) {
    console.error('Get Payout Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payout'
    });
  }
};

// @desc    Create payout
// @route   POST /api/v1/payouts
// @access  Private (Admin)
const createPayout = async (req, res) => {
  try {
    const payoutData = {
      ...req.body,
      netAmount: req.body.amount // Will be recalculated with commission
    };

    // Calculate commission
    const payout = new Payout(payoutData);
    payout.calculateCommission();

    await payout.save();
    await payout.populate('seller', 'firstName lastName email');
    await payout.populate('orders', 'orderNumber pricing.total');

    res.status(201).json({
      success: true,
      data: {
        id: payout._id,
        reference: payout.reference,
        seller: {
          id: payout.seller._id,
          name: `${payout.seller.firstName} ${payout.seller.lastName}`,
          email: payout.seller.email
        },
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        paymentMethod: payout.paymentMethod,
        commission: payout.commission,
        netAmount: payout.netAmount,
        createdAt: payout.createdAt
      }
    });

  } catch (error) {
    console.error('Create Payout Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create payout'
    });
  }
};

// @desc    Update payout status
// @route   PATCH /api/v1/payouts/:id/status
// @access  Private (Admin)
const updatePayoutStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updateData = {
      status,
      processedBy: req.user.id
    };

    if (status === 'completed' || status === 'failed') {
      updateData.processedAt = new Date();
    }

    const payout = await Payout.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('seller', 'firstName lastName email')
     .populate('processedBy', 'firstName lastName');

    if (!payout) {
      return res.status(404).json({
        success: false,
        error: 'Payout not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payout
    });

  } catch (error) {
    console.error('Update Payout Status Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payout status'
    });
  }
};

// @desc    Process payout
// @route   POST /api/v1/payouts/:id/process
// @access  Private (Admin)
const processPayout = async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      return res.status(404).json({
        success: false,
        error: 'Payout not found'
      });
    }

    if (payout.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Payout is not in pending status'
      });
    }

    // Update status to processing
    payout.status = 'processing';
    payout.processedBy = req.user.id;
    await payout.save();

    await payout.populate('seller', 'firstName lastName email');
    await payout.populate('processedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: payout,
      message: 'Payout processing started'
    });

  } catch (error) {
    console.error('Process Payout Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payout'
    });
  }
};

// @desc    Bulk update payouts
// @route   POST /api/v1/payouts/bulk-update
// @access  Private (Admin)
const bulkUpdatePayouts = async (req, res) => {
  try {
    const { ids, status } = req.body;

    const updateData = {
      status,
      processedBy: req.user.id
    };

    if (status === 'completed' || status === 'failed') {
      updateData.processedAt = new Date();
    }

    const result = await Payout.updateMany(
      { _id: { $in: ids }, status: { $ne: status } },
      updateData
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} payouts updated successfully`,
      data: {
        updated: result.modifiedCount,
        matched: result.matchedCount
      }
    });

  } catch (error) {
    console.error('Bulk Update Payouts Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update payouts'
    });
  }
};

module.exports = {
  getPayouts,
  getPayout,
  createPayout,
  updatePayoutStatus,
  bulkUpdatePayouts,
  processPayout
};




