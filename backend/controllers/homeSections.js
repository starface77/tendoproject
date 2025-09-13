const HomeSection = require('../models/HomeSection');
const Product = require('../models/Product');

// Public: list active sections with resolved products
const getPublicSections = async (req, res) => {
  try {
    const sections = await HomeSection.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    const results = [];
    for (const s of sections) {
      let products = [];
      if (s.type === 'manual' && Array.isArray(s.productIds) && s.productIds.length) {
        products = await Product.find({ _id: { $in: s.productIds }, isActive: true })
          .sort({ createdAt: -1 })
          .limit(48)
          .lean();
      } else if (s.type === 'dynamic' && s.query) {
        const q = { isActive: true };
        if (s.query.categoryId) q.category = s.query.categoryId;
        if (typeof s.query.isFeatured === 'boolean') q.isFeatured = s.query.isFeatured;
        if (typeof s.query.isOnSale === 'boolean') q.isOnSale = s.query.isOnSale;
        if (s.query.tag) q.tags = s.query.tag;

        const sort = s.query.sort || '-createdAt';
        const limit = Math.max(1, Math.min(48, s.query.limit || 12));

        products = await Product.find(q).sort(sort).limit(limit).lean();
      }

      results.push({
        id: s._id,
        title: s.title,
        key: s.key || undefined,
        description: s.description || '',
        order: s.order || 0,
        products: products.map(p => ({
          id: p._id,
          _id: p._id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice,
          images: p.images,
          rating: p.rating?.average || 0,
          seller: p.seller
        }))
      });
    }

    res.json({ success: true, data: results });
  } catch (e) {
    console.error('getPublicSections error', e);
    res.status(500).json({ success: false, error: 'Failed to load sections' });
  }
};

// Admin: CRUD
const getAdminSections = async (req, res) => {
  try {
    const sections = await HomeSection.find({}).sort({ order: 1, createdAt: -1 }).lean();
    res.json({ success: true, data: sections });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to load sections' });
  }
};

const createSection = async (req, res) => {
  try {
    const { title, type, productIds, query, order, isActive, key, description } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, error: 'Title is required' });

    const section = await HomeSection.create({
      title: title.trim(),
      key: key || undefined,
      type: type || 'manual',
      productIds: Array.isArray(productIds) ? productIds : [],
      query: query || {},
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      description: description || '',
      createdBy: req.user?._id
    });

    res.status(201).json({ success: true, data: section });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to create section' });
  }
};

const updateSection = async (req, res) => {
  try {
    const updated = await HomeSection.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, error: 'Section not found' });
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to update section' });
  }
};

const deleteSection = async (req, res) => {
  try {
    const found = await HomeSection.findById(req.params.id);
    if (!found) return res.status(404).json({ success: false, error: 'Section not found' });
    await HomeSection.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Section deleted' });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to delete section' });
  }
};

module.exports = {
  getPublicSections,
  getAdminSections,
  createSection,
  updateSection,
  deleteSection
};


