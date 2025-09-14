const mongoose = require('mongoose');
const HomeSection = require('../models/HomeSection');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tendomarketuz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createDefaultSections = async () => {
  try {
    // Clear existing sections
    await HomeSection.deleteMany({});
    
    // Create default sections
    const sections = [
      {
        title: 'Рекомендуемые товары',
        key: 'recommended',
        type: 'dynamic',
        description: 'Лучшие товары, подобранные специально для вас',
        order: 1,
        isActive: true,
        query: {
          isFeatured: true,
          limit: 12,
          sort: '-rating.average'
        }
      },
      {
        title: 'Новинки',
        key: 'new-arrivals',
        type: 'dynamic',
        description: 'Самые свежие поступления',
        order: 2,
        isActive: true,
        query: {
          limit: 12,
          sort: '-createdAt'
        }
      },
      {
        title: 'Распродажа',
        key: 'on-sale',
        type: 'dynamic',
        description: 'Товары со скидкой',
        order: 3,
        isActive: true,
        query: {
          isOnSale: true,
          limit: 12,
          sort: '-createdAt'
        }
      },
      {
        title: 'Популярные категории',
        key: 'popular-categories',
        type: 'manual',
        description: 'Часто просматриваемые категории',
        order: 4,
        isActive: true,
        productIds: []
      }
    ];

    // Insert sections
    for (const section of sections) {
      await HomeSection.create(section);
      console.log(`✅ Created section: ${section.title}`);
    }

    console.log('🎉 All default sections created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating default sections:', error);
    process.exit(1);
  }
};

createDefaultSections();