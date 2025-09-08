/**
 * 🏪 СКРИПТ ЗАПОЛНЕНИЯ КАТЕГОРИЙ
 * Создает реальные категории для маркетплейса в Узбекистане
 */

const mongoose = require('mongoose');
const Category = require('../models/Category');

// Подключение к базе данных
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/marketplace', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB подключен');
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

// Реальные категории для маркетплейса в Узбекистане
const realMarketplaceCategories = [
  // 📱 ЭЛЕКТРОНИКА И ТЕХНИКА
  {
    name: {
      ru: 'Электроника и техника',
      uz: 'Elektronika va texnika',
      en: 'Electronics & Tech'
    },
    description: {
      ru: 'Смартфоны, компьютеры, бытовая техника',
      uz: 'Smartfonlar, kompyuterlar, maishiy texnika',
      en: 'Smartphones, computers, home appliances'
    },
    slug: 'electronics',
    icon: '📱',
    color: '#3B82F6',
    isFeatured: true,
    sortOrder: 1,
    children: [
      {
        name: {
          ru: 'Смартфоны',
          uz: 'Smartfonlar',
          en: 'Smartphones'
        },
        slug: 'smartphones',
        icon: '📱',
        color: '#3B82F6',
        isFeatured: true,
        sortOrder: 1
      },
      {
        name: {
          ru: 'Ноутбуки',
          uz: 'Noutbuklar',
          en: 'Laptops'
        },
        slug: 'laptops',
        icon: '💻',
        color: '#6366F1',
        sortOrder: 2
      },
      {
        name: {
          ru: 'Телевизоры',
          uz: 'Televizorlar',
          en: 'TVs'
        },
        slug: 'tvs',
        icon: '📺',
        color: '#8B5CF6',
        sortOrder: 3
      },
      {
        name: {
          ru: 'Бытовая техника',
          uz: 'Maishiy texnika',
          en: 'Home Appliances'
        },
        slug: 'appliances',
        icon: '🏠',
        color: '#EC4899',
        sortOrder: 4
      }
    ]
  },
  
  // 👕 ОДЕЖДА И ОБУВЬ
  {
    name: {
      ru: 'Одежда и обувь',
      uz: 'Kiyim va poyafzal',
      en: 'Clothing & Shoes'
    },
    description: {
      ru: 'Мужская, женская и детская одежда',
      uz: 'Erkaklar, ayollar va bolalar kiyimi',
      en: 'Men\'s, women\'s and children\'s clothing'
    },
    slug: 'clothing',
    icon: '👕',
    color: '#EF4444',
    isFeatured: true,
    sortOrder: 2,
    children: [
      {
        name: {
          ru: 'Мужская одежда',
          uz: 'Erkaklar kiyimi',
          en: 'Men\'s Clothing'
        },
        slug: 'mens-clothing',
        icon: '👔',
        color: '#1F2937',
        sortOrder: 1
      },
      {
        name: {
          ru: 'Женская одежда',
          uz: 'Ayollar kiyimi',
          en: 'Women\'s Clothing'
        },
        slug: 'womens-clothing',
        icon: '👗',
        color: '#EC4899',
        sortOrder: 2
      },
      {
        name: {
          ru: 'Детская одежда',
          uz: 'Bolalar kiyimi',
          en: 'Kids\' Clothing'
        },
        slug: 'kids-clothing',
        icon: '👶',
        color: '#F59E0B',
        sortOrder: 3
      }
    ]
  },

  // 🏠 ДОМ И САД
  {
    name: {
      ru: 'Дом и сад',
      uz: 'Uy va bog\'',
      en: 'Home & Garden'
    },
    description: {
      ru: 'Мебель, декор, товары для дома',
      uz: 'Mebel, dekor, uy uchun tovarlar',
      en: 'Furniture, decor, home goods'
    },
    slug: 'home-garden',
    icon: '🏠',
    color: '#10B981',
    isFeatured: true,
    sortOrder: 3,
    children: [
      {
        name: {
          ru: 'Мебель',
          uz: 'Mebel',
          en: 'Furniture'
        },
        slug: 'furniture',
        icon: '🪑',
        color: '#92400E',
        sortOrder: 1
      },
      {
        name: {
          ru: 'Декор',
          uz: 'Dekor',
          en: 'Home Decor'
        },
        slug: 'home-decor',
        icon: '🖼️',
        color: '#7C3AED',
        sortOrder: 2
      }
    ]
  },

  // 🚗 АВТОТОВАРЫ
  {
    name: {
      ru: 'Автотовары',
      uz: 'Avto tovarlari',
      en: 'Auto & Transport'
    },
    description: {
      ru: 'Запчасти, аксессуары, инструменты',
      uz: 'Ehtiyot qismlar, aksessuarlar, asboblar',
      en: 'Parts, accessories, tools'
    },
    slug: 'auto',
    icon: '🚗',
    color: '#374151',
    sortOrder: 4,
    children: [
      {
        name: {
          ru: 'Запчасти',
          uz: 'Ehtiyot qismlar',
          en: 'Auto Parts'
        },
        slug: 'auto-parts',
        icon: '🔧',
        color: '#374151',
        sortOrder: 1
      }
    ]
  },

  // 💄 КРАСОТА И ЗДОРОВЬЕ
  {
    name: {
      ru: 'Красота и здоровье',
      uz: 'Go\'zallik va salomatlik',
      en: 'Beauty & Health'
    },
    description: {
      ru: 'Косметика, парфюмерия, товары для здоровья',
      uz: 'Kosmetika, parfyumeriya, salomatlik tovarlari',
      en: 'Cosmetics, perfume, health products'
    },
    slug: 'beauty-health',
    icon: '💄',
    color: '#EC4899',
    sortOrder: 5,
    children: [
      {
        name: {
          ru: 'Косметика',
          uz: 'Kosmetika',
          en: 'Cosmetics'
        },
        slug: 'cosmetics',
        icon: '💄',
        color: '#EC4899',
        sortOrder: 1
      }
    ]
  },

  // 🏃‍♂️ СПОРТ И ОТДЫХ
  {
    name: {
      ru: 'Спорт и отдых',
      uz: 'Sport va dam olish',
      en: 'Sports & Recreation'
    },
    description: {
      ru: 'Спортивные товары, туризм, хобби',
      uz: 'Sport tovarlari, turizm, sevimli mashg\'ulotlar',
      en: 'Sports equipment, tourism, hobbies'
    },
    slug: 'sports',
    icon: '🏃‍♂️',
    color: '#059669',
    sortOrder: 6,
    children: [
      {
        name: {
          ru: 'Фитнес',
          uz: 'Fitnes',
          en: 'Fitness'
        },
        slug: 'fitness',
        icon: '💪',
        color: '#059669',
        sortOrder: 1
      }
    ]
  },

  // 📚 КНИГИ И КАНЦЕЛЯРИЯ
  {
    name: {
      ru: 'Книги и канцелярия',
      uz: 'Kitoblar va kantselyariya',
      en: 'Books & Stationery'
    },
    description: {
      ru: 'Книги, учебники, канцелярские товары',
      uz: 'Kitoblar, darsliklar, kantselyariya tovarlari',
      en: 'Books, textbooks, office supplies'
    },
    slug: 'books-stationery',
    icon: '📚',
    color: '#7C2D12',
    sortOrder: 7
  },

  // 🎮 ИГРУШКИ И ИГРЫ
  {
    name: {
      ru: 'Игрушки и игры',
      uz: 'O\'yinchoqlar va o\'yinlar',
      en: 'Toys & Games'
    },
    description: {
      ru: 'Детские игрушки, настольные игры',
      uz: 'Bolalar o\'yinchoqlari, stol o\'yinlari',
      en: 'Children\'s toys, board games'
    },
    slug: 'toys-games',
    icon: '🎮',
    color: '#DC2626',
    sortOrder: 8
  }
];

// Функция создания категории с детьми
const createCategoryWithChildren = async (categoryData, parentId = null, createdByUserId) => {
  const { children, ...categoryFields } = categoryData;
  
  const category = new Category({
    ...categoryFields,
    parent: parentId,
    createdBy: createdByUserId,
    updatedBy: createdByUserId
  });

  await category.save();
  console.log(`✅ Создана категория: ${category.name.ru}`);

  // Создаем дочерние категории
  if (children && children.length > 0) {
    for (const childData of children) {
      await createCategoryWithChildren(childData, category._id, createdByUserId);
    }
  }

  return category;
};

// Основная функция
const populateCategories = async () => {
  try {
    console.log('🏪 Начинаем заполнение категорий...');

    // Очищаем существующие категории
    await Category.deleteMany({});
    console.log('🗑️ Старые категории удалены');

    // Создаем системного пользователя (заглушка)
    const systemUserId = new mongoose.Types.ObjectId();

    // Создаем все категории
    for (const categoryData of realMarketplaceCategories) {
      await createCategoryWithChildren(categoryData, null, systemUserId);
    }

    console.log('✅ Все категории созданы успешно!');
    
    // Выводим статистику
    const totalCategories = await Category.countDocuments();
    const topLevelCategories = await Category.countDocuments({ parent: null });
    
    console.log(`📊 Статистика:`);
    console.log(`   Всего категорий: ${totalCategories}`);
    console.log(`   Основных категорий: ${topLevelCategories}`);
    console.log(`   Подкategorий: ${totalCategories - topLevelCategories}`);

  } catch (error) {
    console.error('❌ Ошибка при создании категорий:', error);
  }
};

// Запуск скрипта
const run = async () => {
  await connectDB();
  await populateCategories();
  await mongoose.connection.close();
  console.log('🔌 Соединение с базой данных закрыто');
  process.exit(0);
};

// Запускаем, если файл вызван напрямую
if (require.main === module) {
  run().catch(console.error);
}

module.exports = { populateCategories };