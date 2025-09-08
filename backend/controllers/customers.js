const User = require('../models/User');
const Order = require('../models/Order');

/**
 * 📊 CUSTOMERS CONTROLLER
 * Customer management for admin panel
 */

// @desc    Get all customers
// @route   GET /api/v1/customers
// @access  Private (Admin)
const getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    const sortBy = req.query.sortBy || 'name';

    // Build query
    const query = { role: { $ne: 'admin' } }; // Exclude admin users

    // Add search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== 'all') {
      query.isActive = status === 'active';
      if (status === 'blocked') {
        query.isBlocked = true;
      }
    }

    // Build sort object
    let sortObj = {};
    switch (sortBy) {
      case 'name':
        sortObj = { firstName: 1, lastName: 1 };
        break;
      case 'email':
        sortObj = { email: 1 };
        break;
      case 'orders':
        sortObj = { orderCount: -1 };
        break;
      case 'spent':
        sortObj = { totalSpent: -1 };
        break;
      case 'lastOrder':
        sortObj = { lastOrderDate: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    // Get customers with aggregation to include order stats
    const customers = await User.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'orders',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$customer', '$$userId'] } } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                totalSpent: { $sum: '$pricing.total' },
                lastOrderDate: { $max: '$createdAt' }
              }
            }
          ],
          as: 'orderStats'
        }
      },
      {
        $addFields: {
          orderCount: { $ifNull: [{ $arrayElemAt: ['$orderStats.count', 0] }, 0] },
          totalSpent: { $ifNull: [{ $arrayElemAt: ['$orderStats.totalSpent', 0] }, 0] },
          lastOrderDate: { $ifNull: [{ $arrayElemAt: ['$orderStats.lastOrderDate', 0] }, null] }
        }
      },
      {
        $project: {
          password: 0,
          orderStats: 0
        }
      },
      { $sort: sortObj },
      { $skip: skip },
      { $limit: limit }
    ]);

    // Get total count for pagination
    const totalCount = await User.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: customers.map(customer => ({
        id: customer._id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phone,
        status: customer.isBlocked ? 'blocked' : (customer.isActive ? 'active' : 'inactive'),
        totalOrders: customer.orderCount,
        totalSpent: customer.totalSpent,
        lastOrder: customer.lastOrderDate,
        createdAt: customer.createdAt
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
    console.error('Get Customers Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers'
    });
  }
};

// @desc    Get single customer
// @route   GET /api/v1/customers/:id
// @access  Private (Admin)
const getCustomer = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id)
      .select('-password')
      .populate('favorites', 'name price');

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Get customer's order statistics
    const orderStats = await Order.aggregate([
      { $match: { customer: customer._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
          avgOrderValue: { $avg: '$pricing.total' },
          lastOrderDate: { $max: '$createdAt' }
        }
      }
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      avgOrderValue: 0,
      lastOrderDate: null
    };

    res.status(200).json({
      success: true,
      data: {
        customer: {
          id: customer._id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          status: customer.isBlocked ? 'blocked' : (customer.isActive ? 'active' : 'inactive'),
          createdAt: customer.createdAt,
          lastLogin: customer.lastLogin
        },
        stats: {
          totalOrders: stats.totalOrders,
          totalSpent: stats.totalSpent,
          avgOrderValue: stats.avgOrderValue,
          lastOrderDate: stats.lastOrderDate
        }
      }
    });

  } catch (error) {
    console.error('Get Customer Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer'
    });
  }
};

// @desc    Update customer
// @route   PUT /api/v1/customers/:id
// @access  Private (Admin)
const updateCustomer = async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const customer = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Update Customer Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update customer'
    });
  }
};

// @desc    Update customer status
// @route   PATCH /api/v1/customers/:id/status
// @access  Private (Admin)
const updateCustomerStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updateData = {};
    switch (status) {
      case 'active':
        updateData.isActive = true;
        updateData.isBlocked = false;
        break;
      case 'inactive':
        updateData.isActive = false;
        updateData.isBlocked = false;
        break;
      case 'blocked':
        updateData.isActive = false;
        updateData.isBlocked = true;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid status'
        });
    }

    const customer = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Update Customer Status Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update customer status'
    });
  }
};

// @desc    Get customer statistics
// @route   GET /api/v1/customers/stats
// @access  Private (Admin)
const getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: { $ne: 'admin' } });
    const activeCustomers = await User.countDocuments({ role: { $ne: 'admin' }, isActive: true });
    const blockedCustomers = await User.countDocuments({ role: { $ne: 'admin' }, isBlocked: true });

    // Get customer growth over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newCustomers = await User.countDocuments({
      role: { $ne: 'admin' },
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get top customers by spending
    const topCustomers = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      {
        $lookup: {
          from: 'orders',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$customer', '$$userId'] } } },
            {
              $group: {
                _id: null,
                totalSpent: { $sum: '$pricing.total' },
                orderCount: { $sum: 1 }
              }
            }
          ],
          as: 'orderStats'
        }
      },
      {
        $addFields: {
          totalSpent: { $ifNull: [{ $arrayElemAt: ['$orderStats.totalSpent', 0] }, 0] },
          orderCount: { $ifNull: [{ $arrayElemAt: ['$orderStats.orderCount', 0] }, 0] }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: { $concat: ['$firstName', ' ', '$lastName'] },
          email: 1,
          totalSpent: 1,
          orderCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        blockedCustomers,
        newCustomers,
        topCustomers
      }
    });

  } catch (error) {
    console.error('Get Customer Stats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer statistics'
    });
  }
};

module.exports = {
  getCustomers,
  getCustomer,
  updateCustomer,
  updateCustomerStatus,
  getCustomerStats
};




