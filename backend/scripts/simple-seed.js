/**
 * 🌱 ПРОСТОЙ СКРИПТ ЗАПОЛНЕНИЯ БАЗЫ ДАННЫХ
 * Создает минимальные данные для работы админ панели
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

// Создание простых документов
const createSimpleData = async () => {
  try {
    // Создаем тестового админа
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = new User({
      firstName: 'Test',
      lastName: 'Admin',
      email: 'admin@chexol.uz',
      phone: '+998901234567',
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
    console.log('👤 Админ создан:', admin.email);

    // Создаем простые категории
    const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
    
    const testUser = admin._id; // Используем ID админа как createdBy

    const categories = [
      {
        name: { ru: 'iPhone чехлы', uz: 'iPhone g\'iloflari', en: 'iPhone cases' },
        slug: 'iphone-cases',
        description: { ru: 'Чехлы для iPhone', uz: 'iPhone uchun g\'iloflar', en: 'Cases for iPhone' },
        icon: '📱',
        isActive: true,
        isPopular: true,
        createdBy: testUser
      },
      {
        name: { ru: 'Samsung чехлы', uz: 'Samsung g\'iloflari', en: 'Samsung cases' },
        slug: 'samsung-cases',
        description: { ru: 'Чехлы для Samsung', uz: 'Samsung uchun g\'iloflar', en: 'Cases for Samsung' },
        icon: '📲',
        isActive: true,
        isPopular: true,
        createdBy: testUser
      },
      {
        name: { ru: 'Xiaomi чехлы', uz: 'Xiaomi g\'iloflari', en: 'Xiaomi cases' },
        slug: 'xiaomi-cases',
        description: { ru: 'Чехлы для Xiaomi', uz: 'Xiaomi uchun g\'iloflar', en: 'Cases for Xiaomi' },
        icon: '📳',
        isActive: true,
        isPopular: true,
        createdBy: testUser
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log(`📂 Категории созданы: ${createdCategories.length}`);

    // Создаем простые товары
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    
    const products = [
      {
        name: { ru: 'Силиконовый чехол iPhone 15', uz: 'iPhone 15 silikon g\'ilof', en: 'iPhone 15 Silicone Case' },
        slug: 'iphone-15-silicone-case',
        description: { ru: 'Качественный силиконовый чехол', uz: 'Sifatli silikon g\'ilof', en: 'High-quality silicone case' },
        brand: 'Apple',
        model: 'iPhone 15',
        material: 'Silicone',
        price: 85000,
        originalPrice: 120000,
        inStock: true,
        stockQuantity: 50,
        category: createdCategories[0]._id,
        images: [
          { url: '/images/products/iphone-15-silicone-1.jpg', alt: 'iPhone 15 Silicone Case', isPrimary: true }
        ],
        features: ['drop_protection', 'precise_cutouts', 'wireless_charging', 'lightweight'],
        specifications: [
          {
            name: { ru: 'Материал', uz: 'Material', en: 'Material' },
            value: { ru: 'Силикон', uz: 'Silikon', en: 'Silicone' }
          },
          {
            name: { ru: 'Цвет', uz: 'Rang', en: 'Color' },
            value: { ru: 'Черный', uz: 'Qora', en: 'Black' }
          },
          {
            name: { ru: 'Вес', uz: 'Og\'irlik', en: 'Weight' },
            value: { ru: '35г', uz: '35g', en: '35g' }
          }
        ],
        isActive: true,
        isFeatured: true,
        isPopular: true,
        rating: 4.8,
        reviewCount: 124,
        createdBy: testUser
      },
      {
        name: { ru: 'Защитный чехол Samsung S24', uz: 'Samsung S24 himoya g\'ilof', en: 'Samsung S24 Protective Case' },
        slug: 'samsung-s24-protective-case',
        description: { ru: 'Усиленный защитный чехол', uz: 'Kuchaytirilgan himoya g\'ilof', en: 'Enhanced protective case' },
        brand: 'Samsung',
        model: 'Galaxy S24',
        material: 'TPU + PC',
        price: 95000,
        originalPrice: 130000,
        inStock: true,
        stockQuantity: 35,
        category: createdCategories[1]._id,
        images: [
          { url: '/images/products/samsung-s24-protective-1.jpg', alt: 'Samsung S24 Protective Case', isPrimary: true }
        ],
        features: ['military_grade', 'shock_proof', 'screen_protection', 'kickstand'],
        specifications: [
          {
            name: { ru: 'Материал', uz: 'Material', en: 'Material' },
            value: { ru: 'TPU + Поликарбонат', uz: 'TPU + Polikarbonat', en: 'TPU + Polycarbonate' }
          },
          {
            name: { ru: 'Цвет', uz: 'Rang', en: 'Color' },
            value: { ru: 'Черный', uz: 'Qora', en: 'Black' }
          },
          {
            name: { ru: 'Вес', uz: 'Og\'irlik', en: 'Weight' },
            value: { ru: '55г', uz: '55g', en: '55g' }
          }
        ],
        isActive: true,
        isFeatured: true,
        rating: 4.7,
        reviewCount: 78,
        createdBy: testUser
      },
      {
        name: { ru: 'Прозрачный чехол Xiaomi 14', uz: 'Xiaomi 14 shaffof g\'ilof', en: 'Xiaomi 14 Clear Case' },
        slug: 'xiaomi-14-clear-case',
        description: { ru: 'Ультратонкий прозрачный чехол', uz: 'Ultraingichka shaffof g\'ilof', en: 'Ultra-thin clear case' },
        brand: 'Xiaomi',
        model: 'Xiaomi 14',
        material: 'TPU Clear',
        price: 45000,
        originalPrice: 65000,
        inStock: true,
        stockQuantity: 80,
        category: createdCategories[2]._id,
        images: [
          { url: '/images/products/xiaomi-14-clear-1.jpg', alt: 'Xiaomi 14 Clear Case', isPrimary: true }
        ],
        features: ['transparent', 'anti_yellow', 'wireless_charging', 'ultra_thin'],
        specifications: [
          {
            name: { ru: 'Материал', uz: 'Material', en: 'Material' },
            value: { ru: 'Прозрачный TPU', uz: 'Shaffof TPU', en: 'Clear TPU' }
          },
          {
            name: { ru: 'Цвет', uz: 'Rang', en: 'Color' },
            value: { ru: 'Прозрачный', uz: 'Shaffof', en: 'Clear' }
          },
          {
            name: { ru: 'Вес', uz: 'Og\'irlik', en: 'Weight' },
            value: { ru: '25г', uz: '25g', en: '25g' }
          }
        ],
        isActive: true,
        isFeatured: true,
        rating: 4.6,
        reviewCount: 156,
        createdBy: testUser
      }
    ];

    await Product.insertMany(products);
    console.log(`🛍️ Товары созданы: ${products.length}`);

    return { admin, categories: createdCategories, products };
    
  } catch (error) {
    console.error('❌ Ошибка создания данных:', error);
    throw error;
  }
};

// Главная функция
const seedSimpleData = async () => {
  try {
    console.log('🌱 Создаем минимальные данные для работы...');
    
    await connectDB();
    
    // Очищаем коллекции
    await mongoose.connection.db.collection('users').deleteMany({});
    await mongoose.connection.db.collection('categories').deleteMany({});
    await mongoose.connection.db.collection('products').deleteMany({});
    console.log('🗑️ База данных очищена');
    
    const result = await createSimpleData();
    
    console.log('✅ Данные успешно созданы!');
    console.log('');
    console.log('🔑 Данные для входа в админ панель:');
    console.log('   Email: admin@chexol.uz');
    console.log('   Password: admin123');
    console.log('');
    console.log('📊 Создано данных:');
    console.log(`   👤 Админов: 1`);
    console.log(`   📂 Категорий: ${result.categories.length}`);
    console.log(`   🛍️ Товаров: ${result.products.length}`);
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
};

// Запуск скрипта
seedSimpleData();
