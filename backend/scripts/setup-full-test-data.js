const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tendomarketuz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const setupFullTestData = async () => {
  try {
    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({ email: 'test@test.com' });
    
    // Create a test user
    const testUser = new User({
      email: 'test@test.com',
      password: 'test123456',
      firstName: 'Test',
      lastName: 'User',
      phone: '+998901234567',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });
    
    // Save the user
    await testUser.save();
    console.log(`✅ Created test user: ${testUser.email}`);
    
    // Create categories
    const categories = [
      {
        name: {
          ru: 'Электроника',
          uz: 'Elektronika',
          en: 'Electronics'
        },
        description: {
          ru: 'Электронные устройства и гаджеты',
          uz: 'Elektron qurilmalar va gadjetlar',
          en: 'Electronic devices and gadgets'
        },
        slug: 'electronics',
        icon: '📱',
        isActive: true,
        isVisible: true,
        createdBy: testUser._id
      },
      {
        name: {
          ru: 'Смартфоны',
          uz: 'Smartfonlar',
          en: 'Smartphones'
        },
        description: {
          ru: 'Смартфоны и мобильные телефоны',
          uz: 'Smartfonlar va mobil telefonlar',
          en: 'Smartphones and mobile phones'
        },
        slug: 'smartphones',
        icon: '📱',
        isActive: true,
        isVisible: true,
        createdBy: testUser._id
      },
      {
        name: {
          ru: 'Аудио',
          uz: 'Audio',
          en: 'Audio'
        },
        description: {
          ru: 'Наушники, колонки и аудиоустройства',
          uz: 'Quloqchinlar, karnaylar va audio qurilmalar',
          en: 'Headphones, speakers and audio devices'
        },
        slug: 'audio',
        icon: '🎵',
        isActive: true,
        isVisible: true,
        createdBy: testUser._id
      }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const category = new Category(categoryData);
      await category.save();
      createdCategories.push(category);
      console.log(`✅ Created category: ${category.name.ru}`);
    }

    // Create products
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
        category: createdCategories[1]._id, // Smartphones
        rating: {
          average: 4.8,
          count: 124
        },
        createdBy: testUser._id
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
        category: createdCategories[1]._id, // Smartphones
        rating: {
          average: 4.6,
          count: 89
        },
        createdBy: testUser._id
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
        category: createdCategories[2]._id, // Audio
        rating: {
          average: 4.7,
          count: 203
        },
        createdBy: testUser._id
      }
    ];

    // Insert products
    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
      console.log(`✅ Created product: ${product.name.ru}`);
    }

    console.log('🎉 All test data created successfully!');
    console.log(`User: 1`);
    console.log(`Categories: ${createdCategories.length}`);
    console.log(`Products: ${products.length}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    process.exit(1);
  }
};

setupFullTestData();