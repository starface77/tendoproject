const mongoose = require('mongoose');
const HomeSection = require('../models/HomeSection');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tendomarketuz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const listSections = async () => {
  try {
    const sections = await HomeSection.find({}).sort({ order: 1 });
    
    console.log('📋 All Homepage Sections:');
    console.log('========================');
    
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
    process.exit(0);
  } catch (error) {
    console.error('❌ Error listing sections:', error);
    process.exit(1);
  }
};

listSections();