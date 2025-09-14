const mongoose = require('mongoose');
const Product = require('../models/Product');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tendomarketuz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const listProducts = async () => {
  try {
    const products = await Product.find({}).limit(10);
    
    console.log('📦 Products in Database:');
    console.log('========================');
    
    if (products.length === 0) {
      console.log('No products found in database');
    } else {
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name?.ru || product.name?.uz || product.name?.en || 'Unnamed Product'}`);
        console.log(`   ID: ${product._id}`);
        console.log(`   Price: ${product.price}`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Featured: ${product.isFeatured ? 'Yes' : 'No'}`);
        console.log(`   On Sale: ${product.isOnSale ? 'Yes' : 'No'}`);
        console.log('------------------------');
      });
      
      const total = await Product.countDocuments();
      console.log(`\n🎉 Total products: ${total}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error listing products:', error);
    process.exit(1);
  }
};

listProducts();