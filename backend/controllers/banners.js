const Banner = require('../models/Banner');

// Public: Get active banners
const getPublicBanners = async (req, res) => {
  try {
    const now = new Date();
    const query = {
      isActive: true,
      $and: [
        { $or: [{ validFrom: { $exists: false } }, { validFrom: { $lte: now } }] },
        { $or: [{ validTo: { $exists: false } }, { validTo: { $gte: now } }] }
      ]
    };

    const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 }).lean();

    res.json({
      success: true,
      data: banners.map(b => ({
        id: b._id,
        title: b.title || '',
        description: b.description || '',
        imageUrl: b.imageUrl,
        targetUrl: b.targetUrl || '',
        order: b.order || 0
      }))
    });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to load banners' });
  }
};

// Admin: list all banners
const getAdminBanners = async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ order: 1, createdAt: -1 }).lean();
    res.json({ success: true, data: banners });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to load banners' });
  }
};

// Admin: create banner
const createBanner = async (req, res) => {
  try {
    console.log('🎨 Creating banner with data:', req.body);
    
    const { imageUrl, targetUrl, order, isActive, validFrom, validTo } = req.body;
    
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'URL изображения обязателен' 
      });
    }

    const bannerData = {
      imageUrl,
      targetUrl: targetUrl || '',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validTo: validTo ? new Date(validTo) : null,
      createdBy: req.user?._id
    };

    const banner = await Banner.create(bannerData);
    
    console.log('✅ Banner created:', banner._id);
    
    res.status(201).json({ 
      success: true, 
      message: 'Баннер создан',
      data: banner 
    });
  } catch (error) {
    console.error('❌ Create Banner Error:', error);
    
    // Обработка ошибок валидации Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Ошибка создания баннера' 
    });
  }
};

// Admin: update banner
const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!banner) return res.status(404).json({ success: false, error: 'Banner not found' });
    res.json({ success: true, data: banner });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to update banner' });
  }
};

// Admin: delete banner
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, error: 'Banner not found' });
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to delete banner' });
  }
};

module.exports = {
  getPublicBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner
};







