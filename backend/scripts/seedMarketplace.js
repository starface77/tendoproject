/**
 * 🌱 MARKETPLACE DATABASE SEEDING SCRIPT
 * Populates database with real Uzbekistan marketplace categories and products
 */

const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/marketplace', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Real Uzbekistan marketplace categories
const marketplaceCategories = [
  {
    name: {
      ru: 'Электроника',
      uz: 'Elektronika',
      en: 'Electronics'
    },
    slug: 'electronics',
    icon: '📱',
    isFeatured: true,
    isActive: true,
    isVisible: true,
    order: 1,
    children: [
      {
        name: {
          ru: 'Смартфоны',
          uz: 'Smartfonlar',
          en: 'Smartphones'
        },
        slug: 'smartphones',
        icon: '📱'
      },
      {
        name: {
          ru: 'Ноутбуки',
          uz: 'Noutbuklar',
          en: 'Laptops'
        },
        slug: 'laptops',
        icon: '💻'
      },
      {
        name: {
          ru: 'Планшеты',
          uz: 'Planshetlar',
          en: 'Tablets'
        },
        slug: 'tablets',
        icon: '📲'
      }
    ]
  },
  {
    name: {
      ru: 'Одежда и обувь',
      uz: 'Kiyim va poyafzal',
      en: 'Clothing & Shoes'
    },
    slug: 'clothing-shoes',
    icon: '👔',
    isFeatured: true,
    isActive: true,
    isVisible: true,
    order: 2,
    children: [
      {
        name: {
          ru: 'Мужская одежда',
          uz: 'Erkaklar kiyimi',
          en: 'Men\'s Clothing'
        },
        slug: 'mens-clothing',
        icon: '👔'
      },
      {
        name: {
          ru: 'Женская одежда',
          uz: 'Ayollar kiyimi',
          en: 'Women\'s Clothing'
        },
        slug: 'womens-clothing',
        icon: '👗'
      },
      {
        name: {
          ru: 'Обувь',
          uz: 'Poyafzal',
          en: 'Shoes'
        },
        slug: 'shoes',
        icon: '👠'
      }
    ]
  },
  {
    name: {
      ru: 'Дом и сад',
      uz: 'Uy va bog\'',
      en: 'Home & Garden'
    },
    slug: 'home-garden',
    icon: '🏠',
    isFeatured: true,
    isActive: true,
    isVisible: true,
    order: 3,
    children: [
      {
        name: {
          ru: 'Мебель',
          uz: 'Mebel',
          en: 'Furniture'
        },
        slug: 'furniture',
        icon: '🪑'
      },
      {
        name: {
          ru: 'Бытовая техника',
          uz: 'Maishiy texnika',
          en: 'Home Appliances'
        },
        slug: 'appliances',
        icon: '🔌'
      }
    ]
  },
  {
    name: {
      ru: 'Красота и здоровье',
      uz: 'Go\'zallik va salomatlik',
      en: 'Beauty & Health'
    },
    slug: 'beauty-health',
    icon: '💄',
    isFeatured: true,
    isActive: true,
    isVisible: true,
    order: 4,
    children: [
      {
        name: {
          ru: 'Косметика',
          uz: 'Kosmetika',
          en: 'Cosmetics'
        },
        slug: 'cosmetics',
        icon: '💄'
      },
      {
        name: {
          ru: 'Парфюмерия',
          uz: 'Parfyumeriya',
          en: 'Perfumes'
        },
        slug: 'perfumes',
        icon: '🌸'
      }
    ]
  },
  {
    name: {
      ru: 'Спорт и отдых',
      uz: 'Sport va dam olish',
      en: 'Sports & Recreation'
    },
    slug: 'sports-recreation',
    icon: '⚽',
    isFeatured: false,
    isActive: true,
    isVisible: true,
    order: 5,
    children: [
      {
        name: {
          ru: 'Спортивная одежда',
          uz: 'Sport kiyimi',
          en: 'Sportswear'
        },
        slug: 'sportswear',
        icon: '👕'
      }
    ]
  }
];

// Sample products for testing
const sampleProducts = [
  {
    name: {
      ru: 'Samsung Galaxy A54',
      uz: 'Samsung Galaxy A54',
      en: 'Samsung Galaxy A54'
    },
    description: {
      ru: 'Современный смартфон с отличной камерой',
      uz: 'Zamonaviy smartphone ajoyib kamera bilan',
      en: 'Modern smartphone with excellent camera'
    },
    price: 4500000,
    images: [{
      url: '/images/products/samsung-a54.jpg',
      alt: { ru: 'Samsung Galaxy A54', uz: 'Samsung Galaxy A54', en: 'Samsung Galaxy A54' },
      isPrimary: true,
      order: 0
    }],
    material: 'plastic',
    brand: 'Samsung',
    model: 'Galaxy A54',
    isActive: true,
    status: 'active',
    isFeatured: true,
    isInStock: true,
    stock: 50,
    rating: { average: 4.5, count: 120 },
    tags: ['samsung', 'android', 'smartphone'],
    specifications: [{
      name: { ru: 'Экран', uz: 'Ekran', en: 'Display' },
      value: { ru: '6.4 дюйма', uz: '6.4 dyuym', en: '6.4 inch' },
      order: 0
    }]
  },
  {
    name: {
      ru: 'iPhone 14',
      uz: 'iPhone 14',
      en: 'iPhone 14'
    },
    description: {
      ru: 'Флагманский смартфон от Apple',
      uz: 'Apple flagman smartfoni',
      en: 'Flagship smartphone from Apple'
    },
    price: 12000000,
    images: [{
      url: '/images/products/iphone-14.jpg',
      alt: { ru: 'iPhone 14', uz: 'iPhone 14', en: 'iPhone 14' },
      isPrimary: true,
      order: 0
    }],
    material: 'metal',
    brand: 'Apple',
    model: 'iPhone 14',
    isActive: true,
    status: 'active',
    isFeatured: true,
    isInStock: true,
    stock: 25,
    rating: { average: 4.8, count: 89 },
    tags: ['apple', 'ios', 'smartphone'],
    specifications: [{
      name: { ru: 'Экран', uz: 'Ekran', en: 'Display' },
      value: { ru: '6.1 дюйма', uz: '6.1 dyuym', en: '6.1 inch' },
      order: 0
    }]
  }
];

// Main seeding function
const seedMarketplace = async () => {
  try {
    console.log('🌱 Starting marketplace seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Create a system user for seeding (in real app this would be actual admin user)
    const User = require('../models/User');
    let systemUser;
    try {
      systemUser = await User.findOne({ email: 'system@marketplace.uz' });
      if (!systemUser) {
        systemUser = await User.create({
          firstName: 'System',
          lastName: 'Admin',
          email: 'system@marketplace.uz',
          password: 'temp123',
          role: 'admin'
        });
      }
    } catch (error) {
      console.log('⚠️  Using default ObjectId for createdBy');
      systemUser = { _id: '000000000000000000000000' };
    }

    // Create categories
    console.log('📂 Creating categories...');
    let categoryCount = 0;
    const categoryMap = new Map();

    for (const categoryData of marketplaceCategories) {
      // Create parent category
      const { children, ...parentData } = categoryData;
      const parentCategory = new Category({
        ...parentData,
        level: 0,
        productCount: 0,
        createdBy: systemUser._id
      });
      await parentCategory.save();
      categoryMap.set(parentData.slug, parentCategory._id);
      categoryCount++;

      // Create child categories
      if (children && children.length > 0) {
        for (const childData of children) {
          const childCategory = new Category({
            ...childData,
            parent: parentCategory._id,
            level: 1,
            isActive: true,
            isVisible: true,
            order: 1,
            productCount: 0,
            createdBy: systemUser._id
          });
          await childCategory.save();
          categoryMap.set(childData.slug, childCategory._id);
          categoryCount++;
        }
      }
    }

    console.log(`✅ Created ${categoryCount} categories`);

    // Create products
    console.log('📦 Creating products...');
    let productCount = 0;

    for (const productData of sampleProducts) {
      // Assign to smartphones category
      const smartphonesCategoryId = categoryMap.get('smartphones');
      if (smartphonesCategoryId) {
        const product = new Product({
          ...productData,
          category: smartphonesCategoryId,
          createdBy: systemUser._id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        await product.save();
        productCount++;

        // Update category product count
        await Category.findByIdAndUpdate(
          smartphonesCategoryId,
          { $inc: { productCount: 1 } }
        );
      }
    }

    console.log(`✅ Created ${productCount} products`);

    // Summary
    console.log('\n📋 SEEDING SUMMARY:');
    console.log(`   Categories created: ${categoryCount}`);
    console.log(`   Products created: ${productCount}`);
    console.log('✅ Marketplace seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
};

// Run the seeding
const run = async () => {
  await connectDB();
  await seedMarketplace();
  await mongoose.connection.close();
  console.log('🔌 Database connection closed');
  process.exit(0);
};

// Execute if called directly
if (require.main === module) {
  run().catch(console.error);
}

module.exports = { seedMarketplace };