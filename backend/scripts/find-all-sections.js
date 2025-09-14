const mongoose = require('mongoose');
const HomeSection = require('../models/HomeSection');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tendomarketuz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const findAllSections = async () => {
  try {
    const sections = await HomeSection.find({}).sort({ order: 1 });
    
    console.log('📋 All Homepage Sections in Database:');
    console.log('====================================');
    
    sections.forEach((section, index) => {
      console.log(`${index + 1}. ${section.title}`);
      console.log(`   ID: ${section._id}`);
      console.log(`   Key: ${section.key || 'None'}`);
      console.log(`   Type: ${section.type}`);
      console.log(`   Status: ${section.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   Order: ${section.order}`);
      console.log(`   Description: ${section.description || 'None'}`);
      console.log(`   Product IDs: ${section.productIds ? section.productIds.length : 0} items`);
      if (section.query) {
        console.log(`   Query: ${JSON.stringify(section.query)}`);
      }
      console.log('------------------------');
    });
    
    console.log(`\n🎉 Total sections: ${sections.length}`);
    
    // Test the API logic
    console.log('\n🔍 Testing API Logic:');
    console.log('====================');
    
    for (const s of sections) {
      console.log(`\nSection: ${s.title}`);
      if (s.type === 'manual' && Array.isArray(s.productIds) && s.productIds.length) {
        console.log(`  Manual section with ${s.productIds.length} product IDs`);
      } else if (s.type === 'dynamic' && s.query) {
        console.log(`  Dynamic section with query: ${JSON.stringify(s.query)}`);
        
        // Test the query
        const Product = require('../models/Product');
        const q = { isActive: true };
        if (s.query.categoryId) q.category = s.query.categoryId;
        if (typeof s.query.isFeatured === 'boolean') q.isFeatured = s.query.isFeatured;
        if (typeof s.query.isOnSale === 'boolean') q.isOnSale = s.query.isOnSale;
        if (s.query.tag) q.tags = s.query.tag;

        const sort = s.query.sort || '-createdAt';
        const limit = Math.max(1, Math.min(48, s.query.limit || 12));

        console.log(`  Query: ${JSON.stringify(q)}`);
        console.log(`  Sort: ${sort}`);
        console.log(`  Limit: ${limit}`);
        
        try {
          const products = await Product.find(q).sort(sort).limit(limit).lean();
          console.log(`  Found ${products.length} products`);
        } catch (err) {
          console.log(`  Error querying products: ${err.message}`);
        }
      } else {
        console.log(`  No products or query defined`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error listing sections:', error);
    process.exit(1);
  }
};

findAllSections();