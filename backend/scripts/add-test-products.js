const mongoose = require('mongoose');
const Product = require('../models/Product');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tendomarketuz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const addTestProducts = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    
    // Create test products
    const products = [
      {
        name: {
          ru: 'Смартфон Apple iPhone 14 Pro',
          uz: 'Apple iPhone 14 Pro smartfoni',
          en: 'Apple iPhone 14 Pro Smartphone'
        },
        description: {
          ru: 'Смартфон Apple iPhone 14 Pro с 6.1" дисплеем Super Retina XDR',
          uz: '6.1" Super Retina XDR displey bilan Apple iPhone 14 Pro smartfoni',
          en: 'Apple iPhone 14 Pro smartphone with 6.1" Super Retina XDR display'
        },
        price: 15000000,
        originalPrice: 16000000,
        images: [{ url: '/uploads/iphone14pro.jpg' }],
        stock: 25,
        isActive: true,
        isFeatured: true,
        isOnSale: true,
        brand: 'Apple',
        model: 'iPhone 14 Pro',
        material: 'glass',
        rating: {
          average: 4.8,
          count: 124
        },
        createdBy: '68c66a8c16394bd8613d7940' // Example user ID
      },
      {
        name: {
          ru: 'Смартфон Samsung Galaxy S23',
          uz: 'Samsung Galaxy S23 smartfoni',
          en: 'Samsung Galaxy S23 Smartphone'
        },
        description: {
          ru: 'Смартфон Samsung Galaxy S23 с 6.1" дисплеем Dynamic AMOLED 2X',
          uz: '6.1" Dynamic AMOLED 2X displey bilan Samsung Galaxy S23 smartfoni',
          en: 'Samsung Galaxy S23 smartphone with 6.1" Dynamic AMOLED 2X display'
        },
        price: 12000000,
        originalPrice: 13000000,
        images: [{ url: '/uploads/galaxys23.jpg' }],
        stock: 15,
        isActive: true,
        isFeatured: true,
        isOnSale: false,
        brand: 'Samsung',
        model: 'Galaxy S23',
        material: 'glass',
        rating: {
          average: 4.6,
          count: 89
        },
        createdBy: '68c66a8c16394bd8613d7940'
      },
      {
        name: {
          ru: 'Наушники Apple AirPods Pro',
          uz: 'Apple AirPods Pro quloqchinlari',
          en: 'Apple AirPods Pro Headphones'
        },
        description: {
          ru: 'Беспроводные наушники Apple AirPods Pro с активным шумоподавлением',
          uz: 'Faol shovqin kamaytirish bilan Apple AirPods Pro simsiz quloqchinlari',
          en: 'Wireless Apple AirPods Pro headphones with active noise cancellation'
        },
        price: 5000000,
        originalPrice: 5500000,
        images: [{ url: '/uploads/airpodspro.jpg' }],
        stock: 30,
        isActive: true,
        isFeatured: false,
        isOnSale: true,
        brand: 'Apple',
        model: 'AirPods Pro',
        material: 'plastic',
        rating: {
          average: 4.7,
          count: 203
        },
        createdBy: '68c66a8c16394bd8613d7940'
      }
    ];

    // Insert products
    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
      console.log(`✅ Created product: ${product.name.ru}`);
    }

    console.log('🎉 All test products created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test products:', error);
    process.exit(1);
  }
};

addTestProducts();