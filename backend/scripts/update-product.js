const mongoose = require('mongoose');
const Product = require('../models/Product');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tendomarketuz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateProduct = async () => {
  try {
    // Find the existing product
    const product = await Product.findOne({});
    
    if (!product) {
      console.log('No product found to update');
      process.exit(1);
    }
    
    // Update the product with proper data
    product.name = {
      ru: 'Смартфон Apple iPhone 14 Pro',
      uz: 'Apple iPhone 14 Pro smartfoni',
      en: 'Apple iPhone 14 Pro Smartphone'
    };
    
    product.description = {
      ru: 'Смартфон Apple iPhone 14 Pro с 6.1" дисплеем Super Retina XDR, процессором A16 Bionic, 128 ГБ памяти',
      uz: '6.1" Super Retina XDR displey, A16 Bionic protsessor, 128 GB xotira bilan Apple iPhone 14 Pro smartfoni',
      en: 'Apple iPhone 14 Pro smartphone with 6.1" Super Retina XDR display, A16 Bionic processor, 128 GB storage'
    };
    
    product.price = 15000000; // 15,000,000 UZS
    product.originalPrice = 16000000; // 16,000,000 UZS (on sale)
    product.category = '68c66a8c16394bd8613d793f'; // Example category ID
    product.brand = 'Apple';
    product.model = 'iPhone 14 Pro';
    product.images = ['/uploads/iphone14pro.jpg'];
    product.stock = 25;
    product.isActive = true;
    product.isFeatured = true;
    product.isOnSale = true;
    product.rating = {
      average: 4.8,
      count: 124
    };
    
    await product.save();
    
    console.log('✅ Product updated successfully:');
    console.log(`ID: ${product._id}`);
    console.log(`Name: ${product.name.ru}`);
    console.log(`Price: ${product.price}`);
    console.log(`Featured: ${product.isFeatured}`);
    console.log(`On Sale: ${product.isOnSale}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating product:', error);
    process.exit(1);
  }
};

updateProduct();