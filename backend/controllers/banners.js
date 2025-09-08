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
    const { imageUrl, targetUrl, order, isActive, validFrom, validTo, title, subtitle, badgeText, bgColor, bgGradient } = req.body;
    if (!imageUrl || typeof imageUrl !== 'string') return res.status(400).json({ success: false, error: 'imageUrl is required' });
    const banner = await Banner.create({ imageUrl, targetUrl, order, isActive, validFrom, validTo, title, subtitle, badgeText, bgColor, bgGradient, createdBy: req.user?._id });
    res.status(201).json({ success: true, data: banner });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to create banner' });
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







