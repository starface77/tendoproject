/**
 * 🌱 СКРИПТ ЗАПОЛНЕНИЯ БАЗЫ ДАННЫХ ТЕСТОВЫМИ ДАННЫМИ
 * Запуск: node scripts/seed-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Импорт моделей
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const City = require('../models/City');

// Подключение к базе данных
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB подключена');
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

// Данные городов
const cities = [
  { name: 'Ташкент', slug: 'tashkent', isActive: true, deliveryTime: '1-2 дня' },
  { name: 'Самарканд', slug: 'samarkand', isActive: true, deliveryTime: '2-3 дня' },
  { name: 'Бухара', slug: 'bukhara', isActive: true, deliveryTime: '3-4 дня' },
  { name: 'Андижан', slug: 'andijan', isActive: true, deliveryTime: '3-5 дней' },
  { name: 'Наманган', slug: 'namangan', isActive: true, deliveryTime: '3-5 дней' },
  { name: 'Фергана', slug: 'fergana', isActive: true, deliveryTime: '3-5 дней' }
];

// Данные категорий
const categories = [
  {
    name: 'Чехлы для iPhone',
    slug: 'iphone-cases',
    description: 'Качественные чехлы для всех моделей iPhone',
    icon: '📱',
    isActive: true,
    isPopular: true
  },
  {
    name: 'Чехлы для Samsung',
    slug: 'samsung-cases',
    description: 'Стильные чехлы для смартфонов Samsung',
    icon: '📲',
    isActive: true,
    isPopular: true
  },
  {
    name: 'Чехлы для Xiaomi',
    slug: 'xiaomi-cases',
    description: 'Защитные чехлы для телефонов Xiaomi',
    icon: '📳',
    isActive: true,
    isPopular: true
  },
  {
    name: 'Силиконовые чехлы',
    slug: 'silicone-cases',
    description: 'Мягкие силиконовые чехлы для защиты',
    icon: '🔰',
    isActive: true
  },
  {
    name: 'Кожаные чехлы',
    slug: 'leather-cases',
    description: 'Премиальные кожаные чехлы',
    icon: '👜',
    isActive: true
  },
  {
    name: 'Прозрачные чехлы',
    slug: 'transparent-cases',
    description: 'Прозрачные чехлы, сохраняющие дизайн телефона',
    icon: '🔍',
    isActive: true
  }
];

// Данные товаров
const products = [
  // iPhone чехлы
  {
    name: 'Силиконовый чехол для iPhone 15 Pro',
    slug: 'iphone-15-pro-silicone-case',
    description: 'Премиальный силиконовый чехол с защитой от падений и царапин',
    brand: 'iPhone 15 Pro',
    price: 85000,
    originalPrice: 120000,
    inStock: true,
    stockQuantity: 50,
    images: ['/images/products/iphone-15-pro-silicone-1.jpg'],
    features: ['Силиконовый материал', 'Защита от падений', 'Точные вырезы', 'Легкий вес'],
    specifications: {
      material: 'Премиальный силикон',
      color: 'Черный',
      weight: '35г',
      compatibility: 'iPhone 15 Pro'
    },
    isActive: true,
    isFeatured: true,
    isPopular: true,
    rating: 4.8,
    reviewCount: 124,
    metaTitle: 'Силиконовый чехол для iPhone 15 Pro - Chexol.uz',
    metaDescription: 'Купить силиконовый чехол для iPhone 15 Pro в Ташкенте. Быстрая доставка по Узбекистану.'
  },
  {
    name: 'Кожаный чехол для iPhone 14 Pro Max',
    slug: 'iphone-14-pro-max-leather-case',
    description: 'Роскошный кожаный чехол из натуральной кожи высшего качества',
    brand: 'iPhone 14 Pro Max',
    price: 180000,
    originalPrice: 250000,
    inStock: true,
    stockQuantity: 25,
    images: ['/images/products/iphone-14-leather-1.jpg'],
    features: ['Натуральная кожа', 'Ручная отделка', 'Карманы для карт', 'Подставка'],
    specifications: {
      material: 'Натуральная кожа',
      color: 'Коричневый',
      weight: '65г',
      compatibility: 'iPhone 14 Pro Max'
    },
    isActive: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 89,
    metaTitle: 'Кожаный чехол для iPhone 14 Pro Max - Chexol.uz',
    metaDescription: 'Премиальный кожаный чехол для iPhone 14 Pro Max. Натуральная кожа, стильный дизайн.'
  },
  {
    name: 'Прозрачный чехол для iPhone 13',
    slug: 'iphone-13-transparent-case',
    description: 'Ультратонкий прозрачный чехол с anti-yellow покрытием',
    brand: 'iPhone 13',
    price: 45000,
    originalPrice: 65000,
    inStock: true,
    stockQuantity: 100,
    images: ['/images/products/iphone-13-transparent-1.jpg'],
    features: ['Прозрачный материал', 'Anti-yellow покрытие', 'Ультратонкий', 'Беспроводная зарядка'],
    specifications: {
      material: 'Прозрачный TPU',
      color: 'Прозрачный',
      weight: '25г',
      compatibility: 'iPhone 13'
    },
    isActive: true,
    isFeatured: true,
    rating: 4.6,
    reviewCount: 156,
    metaTitle: 'Прозрачный чехол для iPhone 13 - Chexol.uz',
    metaDescription: 'Прозрачный защитный чехол для iPhone 13. Сохраняет оригинальный дизайн телефона.'
  },

  // Samsung чехлы
  {
    name: 'Защитный чехол для Samsung Galaxy S24 Ultra',
    slug: 'samsung-s24-ultra-protective-case',
    description: 'Усиленный защитный чехол с военной сертификацией',
    brand: 'Samsung Galaxy S24 Ultra',
    price: 95000,
    originalPrice: 130000,
    inStock: true,
    stockQuantity: 35,
    images: ['/images/products/samsung-s24-protective-1.jpg'],
    features: ['Военная защита', 'Ударопрочный', 'Защита экрана', 'Подставка'],
    specifications: {
      material: 'Армированный пластик + TPU',
      color: 'Черный',
      weight: '55г',
      compatibility: 'Samsung Galaxy S24 Ultra'
    },
    isActive: true,
    isFeatured: true,
    rating: 4.7,
    reviewCount: 78,
    metaTitle: 'Защитный чехол для Samsung Galaxy S24 Ultra - Chexol.uz',
    metaDescription: 'Военная защита для Samsung Galaxy S24 Ultra. Ударопрочный чехол с сертификацией.'
  },
  {
    name: 'Флип-чехол для Samsung Galaxy A54',
    slug: 'samsung-a54-flip-case',
    description: 'Элегантный флип-чехол с функцией Smart View',
    brand: 'Samsung Galaxy A54',
    price: 65000,
    originalPrice: 90000,
    inStock: true,
    stockQuantity: 60,
    images: ['/images/products/samsung-a54-flip-1.jpg'],
    features: ['Smart View окно', 'Автосон/пробуждение', 'Карманы для карт', 'Подставка'],
    specifications: {
      material: 'Искусственная кожа',
      color: 'Синий',
      weight: '75г',
      compatibility: 'Samsung Galaxy A54'
    },
    isActive: true,
    rating: 4.5,
    reviewCount: 92,
    metaTitle: 'Флип-чехол для Samsung Galaxy A54 - Chexol.uz',
    metaDescription: 'Умный флип-чехол для Samsung Galaxy A54 с функцией Smart View.'
  },

  // Xiaomi чехлы
  {
    name: 'Гибридный чехол для Xiaomi 14',
    slug: 'xiaomi-14-hybrid-case',
    description: 'Гибридный чехол с металлическими вставками',
    brand: 'Xiaomi 14',
    price: 55000,
    originalPrice: 80000,
    inStock: true,
    stockQuantity: 40,
    images: ['/images/products/xiaomi-14-hybrid-1.jpg'],
    features: ['Металлические вставки', 'Двойная защита', 'Стильный дизайн', 'Точные вырезы'],
    specifications: {
      material: 'TPU + Металл',
      color: 'Серый',
      weight: '45г',
      compatibility: 'Xiaomi 14'
    },
    isActive: true,
    isFeatured: true,
    rating: 4.6,
    reviewCount: 67,
    metaTitle: 'Гибридный чехол для Xiaomi 14 - Chexol.uz',
    metaDescription: 'Стильный гибридный чехол для Xiaomi 14 с металлическими вставками.'
  },
  {
    name: 'Магнитный чехол для Xiaomi Redmi Note 13',
    slug: 'redmi-note-13-magnetic-case',
    description: 'Чехол с магнитным креплением для аксессуаров',
    brand: 'Xiaomi Redmi Note 13',
    price: 40000,
    originalPrice: 60000,
    inStock: true,
    stockQuantity: 80,
    images: ['/images/products/redmi-note-13-magnetic-1.jpg'],
    features: ['Магнитное крепление', 'MagSafe совместимость', 'Беспроводная зарядка', 'Тонкий профиль'],
    specifications: {
      material: 'Силикон с магнитами',
      color: 'Фиолетовый',
      weight: '38г',
      compatibility: 'Xiaomi Redmi Note 13'
    },
    isActive: true,
    rating: 4.4,
    reviewCount: 103,
    metaTitle: 'Магнитный чехол для Xiaomi Redmi Note 13 - Chexol.uz',
    metaDescription: 'Магнитный чехол для Redmi Note 13 с поддержкой MagSafe аксессуаров.'
  },

  // Универсальные чехлы
  {
    name: 'Водонепроницаемый чехол Universal',
    slug: 'universal-waterproof-case',
    description: 'Универсальный водонепроницаемый чехол до 30 метров',
    brand: 'Universal',
    price: 25000,
    originalPrice: 40000,
    inStock: true,
    stockQuantity: 150,
    images: ['/images/products/universal-waterproof-1.jpg'],
    features: ['Водонепроницаемость IPX8', 'Глубина до 30м', 'Универсальный размер', 'Плавающий ремешок'],
    specifications: {
      material: 'Водонепроницаемый пластик',
      color: 'Прозрачный',
      weight: '50г',
      compatibility: 'Универсальный (до 6.8")'
    },
    isActive: true,
    rating: 4.3,
    reviewCount: 234,
    metaTitle: 'Водонепроницаемый чехол Universal - Chexol.uz',
    metaDescription: 'Универсальный водонепроницаемый чехол для телефонов. Защита IPX8.'
  }
];

// Функция очистки базы данных
const clearDatabase = async () => {
  try {
    await User.deleteMany({ role: { $ne: 'super-admin' } });
    await Category.deleteMany({});
    await Product.deleteMany({});
    await City.deleteMany({});
    console.log('🗑️ База данных очищена');
  } catch (error) {
    console.error('❌ Ошибка очистки базы данных:', error);
  }
};

// Функция создания тестового админа
const createTestAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = new User({
      firstName: 'Test',
      lastName: 'Admin',
      email: 'admin@chexol.uz',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      permissions: [
        'read_products', 'create_products', 'update_products', 'delete_products',
        'read_orders', 'create_orders', 'update_orders', 'delete_orders',
        'read_users', 'create_users', 'update_users', 'delete_users',
        'moderate_reviews', 'manage_categories', 'view_analytics'
      ]
    });

    await admin.save();
    console.log('👤 Тестовый админ создан:', admin.email);
  } catch (error) {
    console.error('❌ Ошибка создания админа:', error);
  }
};

// Функция создания городов
const createCities = async () => {
  try {
    await City.insertMany(cities);
    console.log(`🏙️ Создано ${cities.length} городов`);
  } catch (error) {
    console.error('❌ Ошибка создания городов:', error);
  }
};

// Функция создания категорий
const createCategories = async () => {
  try {
    const createdCategories = await Category.insertMany(categories);
    console.log(`📂 Создано ${createdCategories.length} категорий`);
    return createdCategories;
  } catch (error) {
    console.error('❌ Ошибка создания категорий:', error);
    return [];
  }
};

// Функция создания товаров
const createProducts = async (createdCategories) => {
  try {
    const categoryMap = {
      'iphone': createdCategories.find(cat => cat.slug === 'iphone-cases')?._id,
      'samsung': createdCategories.find(cat => cat.slug === 'samsung-cases')?._id,
      'xiaomi': createdCategories.find(cat => cat.slug === 'xiaomi-cases')?._id,
      'silicone': createdCategories.find(cat => cat.slug === 'silicone-cases')?._id,
      'leather': createdCategories.find(cat => cat.slug === 'leather-cases')?._id,
      'transparent': createdCategories.find(cat => cat.slug === 'transparent-cases')?._id
    };

    // Привязываем товары к категориям
    const productsWithCategories = products.map(product => {
      let categoryId;
      
      if (product.brand.includes('iPhone')) {
        categoryId = categoryMap.iphone;
      } else if (product.brand.includes('Samsung')) {
        categoryId = categoryMap.samsung;
      } else if (product.brand.includes('Xiaomi')) {
        categoryId = categoryMap.xiaomi;
      } else {
        categoryId = categoryMap.silicone; // Universal товары в силиконовые
      }

      // Дополнительные категории по типу
      const additionalCategories = [];
      if (product.name.includes('Силиконовый')) additionalCategories.push(categoryMap.silicone);
      if (product.name.includes('Кожаный')) additionalCategories.push(categoryMap.leather);
      if (product.name.includes('Прозрачный')) additionalCategories.push(categoryMap.transparent);

      return {
        ...product,
        category: categoryId,
        additionalCategories: additionalCategories.filter(cat => cat && cat !== categoryId)
      };
    });

    await Product.insertMany(productsWithCategories);
    console.log(`🛍️ Создано ${productsWithCategories.length} товаров`);
  } catch (error) {
    console.error('❌ Ошибка создания товаров:', error);
  }
};

// Главная функция
const seedDatabase = async () => {
  try {
    console.log('🌱 Начинаем заполнение базы данных...');
    
    await connectDB();
    await clearDatabase();
    
    await createTestAdmin();
    await createCities();
    const createdCategories = await createCategories();
    await createProducts(createdCategories);
    
    console.log('✅ База данных успешно заполнена!');
    console.log('');
    console.log('🔑 Данные для входа в админ панель:');
    console.log('   Email: admin@chexol.uz');
    console.log('   Password: admin123');
    console.log('');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка заполнения базы данных:', error);
    process.exit(1);
  }
};

// Запуск скрипта
seedDatabase();
