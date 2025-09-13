const { ObjectId, MongoClient } = require('mongodb');

// Заглушки для других функций
const getMe = (req, res) => res.json({ success: true, data: { message: 'Profile function' } });
const getSellerProducts = (req, res) => res.json({ success: true, data: [] });
const getDashboard = (req, res) => res.json({ success: true, data: { message: 'Dashboard' } });
const getFinance = (req, res) => res.json({ success: true, data: { message: 'Finance' } });
const createSellerProduct = (req, res) => res.json({ success: true, message: 'Product created' });
const updateSellerProduct = (req, res) => res.json({ success: true, message: 'Product updated' });
const deleteSellerProduct = (req, res) => res.json({ success: true, message: 'Product deleted' });
const getSellerProfile = (req, res) => res.json({ success: true, data: { message: 'Seller profile' } });

// ГЛАВНАЯ ФУНКЦИЯ - получение заказов продавца
const getOrders = async (req, res) => {
  try {
    console.log('📋 GET SELLER ORDERS START');
    console.log('👤 Seller ID:', req.user?._id);
    
    const client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017/tendo');
    await client.connect();
    const db = client.db('tendo');
    
    const sellerOrders = await db.collection('seller_orders')
      .find({ seller: new ObjectId(req.user._id) })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    
    console.log('📦 Found seller orders:', sellerOrders.length);
    
    await client.close();
    
    res.json({
      success: true,
      data: sellerOrders,
      total: sellerOrders.length
    });
    
  } catch (error) {
    console.log('❌ GET SELLER ORDERS ERROR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Обновить статус заказа продавца
const updateOrderStatus = async (req, res) => {
  try {
    console.log('📝 UPDATE ORDER STATUS');
    console.log('👤 Seller ID:', req.user?._id);
    console.log('🆔 Order ID:', req.params.id);
    console.log('📊 New Status:', req.body.status);
    
    const client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017/tendo');
    await client.connect();
    const db = client.db('tendo');
    
    // Обновляем статус заказа продавца
    const result = await db.collection('seller_orders').updateOne(
      { 
        _id: new ObjectId(req.params.id),
        seller: new ObjectId(req.user._id)
      },
      {
        $set: {
          status: req.body.status,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      await client.close();
      return res.status(404).json({ success: false, message: 'Заказ не найден' });
    }
    
    console.log('✅ Order status updated');
    
    await client.close();
    
    res.json({
      success: true,
      message: 'Статус заказа обновлен'
    });
    
  } catch (error) {
    console.log('❌ UPDATE ORDER STATUS ERROR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getMe,
  getSellerProducts,
  getDashboard,
  getFinance,
  getOrders,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerProfile,
  updateOrderStatus
};
