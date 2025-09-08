const Product = require('../models/Product');

/**
 * 📦 INVENTORY CONTROLLER
 * Inventory management for admin panel
 */

// @desc    Get inventory
// @route   GET /api/v1/inventory
// @access  Private (Admin)
const getInventory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    const sort = req.query.sort || 'name';

    // Build query
    const query = {};

    // Add search filter
    if (search) {
      query.$or = [
        { 'name.ru': { $regex: search, $options: 'i' } },
        { 'name.uz': { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== 'all') {
      query.status = status;
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'name':
        sortObj = { 'name.ru': 1 };
        break;
      case 'stock':
        sortObj = { stock: -1 };
        break;
      case 'price':
        sortObj = { price: -1 };
        break;
      case 'status':
        sortObj = { status: 1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('category', 'name.ru')
      .populate('seller', 'firstName lastName')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: products.map(product => ({
        id: product._id,
        name: product.name.ru,
        sku: product.sku,
        price: product.price,
        stock: product.stock || 0,
        status: product.status,
        category: product.category ? product.category.name.ru : 'N/A',
        seller: product.seller ? `${product.seller.firstName} ${product.seller.lastName}` : 'N/A',
        images: product.images,
        createdAt: product.createdAt
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
    console.error('Get Inventory Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory'
    });
  }
};

// @desc    Adjust stock
// @route   POST /api/v1/inventory/:id/adjust
// @access  Private (Admin)
const adjustStock = async (req, res) => {
  try {
    const { quantity, reason } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Update stock
    const newStock = (product.stock || 0) + quantity;
    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        error: 'Stock cannot be negative'
      });
    }

    product.stock = newStock;
    await product.save();

    res.status(200).json({
      success: true,
      data: {
        id: product._id,
        name: product.name.ru,
        previousStock: product.stock - quantity,
        newStock: product.stock,
        adjustment: quantity,
        reason
      }
    });

  } catch (error) {
    console.error('Adjust Stock Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to adjust stock'
    });
  }
};

// @desc    Export inventory
// @route   POST /api/v1/inventory/export
// @access  Private (Admin)
const exportInventory = async (req, res) => {
  try {
    const { ids } = req.body;

    let query = {};
    if (ids && ids.length > 0) {
      query = { _id: { $in: ids } };
    }

    const products = await Product.find(query)
      .populate('category', 'name.ru')
      .populate('seller', 'firstName lastName')
      .select('name sku price stock status category seller createdAt');

    // Create CSV content
    const csvHeaders = 'Name,SKU,Price,Stock,Status,Category,Seller,Created At\n';
    const csvRows = products.map(product => {
      return `"${product.name.ru}","${product.sku || ''}",${product.price},${product.stock || 0},"${product.status}","${product.category?.name.ru || ''}","${product.seller ? `${product.seller.firstName} ${product.seller.lastName}` : ''}","${product.createdAt.toISOString()}"`;
    }).join('\n');

    const csvContent = csvHeaders + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory_export.csv"');
    res.send(csvContent);

  } catch (error) {
    console.error('Export Inventory Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export inventory'
    });
  }
};

// @desc    Bulk update inventory status
// @route   POST /api/v1/inventory/bulk-update
// @access  Private (Admin)
const bulkUpdateInventoryStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    const result = await Product.updateMany(
      { _id: { $in: ids } },
      { status }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} products updated successfully`,
      data: {
        updated: result.modifiedCount,
        matched: result.matchedCount
      }
    });

  } catch (error) {
    console.error('Bulk Update Inventory Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update inventory'
    });
  }
};

module.exports = {
  getInventory,
  adjustStock,
  exportInventory,
  bulkUpdateInventoryStatus
};




