const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const Banner = require('../models/Banner');

async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tendo_market');
    console.log('MongoDB подключен');
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
}

async function seedData() {
  try {
    // Очищаем существующие данные
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Banner.deleteMany({});
    
    console.log('Старые данные удалены');

    // Создаем тестового пользователя-продавца
    let seller = await User.findOne({ email: 'seller@test.com' });
    if (!seller) {
      seller = await User.create({
        firstName: 'Тест',
        lastName: 'Продавец',
        email: 'seller@test.com',
        password: '$2a$10$dummyhashedpassword',
        phone: '+998901234567',
        city: 'tashkent',
        role: 'seller',
        isVerified: true
      });
    }

    // Создаем категории
    const categories = await Category.create([
      {
        name: { ru: 'Электроника', uz: 'Elektronika', en: 'Electronics' },
        description: { ru: 'Электронные устройства', uz: 'Elektron qurilmalar', en: 'Electronic devices' },
        slug: 'electronics',
        icon: '📱',
        createdBy: seller._id,
        isActive: true
      },
      {
        name: { ru: 'Одежда и обувь', uz: 'Kiyim va poyafzal', en: 'Clothing & Shoes' },
        description: { ru: 'Мужская и женская одежда', uz: 'Erkaklar va ayollar kiyimi', en: 'Men and women clothing' },
        slug: 'clothing',
        icon: '👔',
        createdBy: seller._id,
        isActive: true
      },
      {
        name: { ru: 'Аксессуары', uz: 'Aksessuarlar', en: 'Accessories' },
        description: { ru: 'Различные аксессуары', uz: 'Turli aksessuarlar', en: 'Various accessories' },
        slug: 'accessories',
        icon: '👜',
        createdBy: seller._id,
        isActive: true
      },
      {
        name: { ru: 'Дом и сад', uz: 'Uy va bog\'', en: 'Home & Garden' },
        description: { ru: 'Товары для дома и сада', uz: 'Uy va bog\' uchun mahsulotlar', en: 'Home and garden products' },
        slug: 'home',
        icon: '🏠',
        createdBy: seller._id,
        isActive: true
      }
    ]);

    console.log('Категории созданы:', categories.length);

    // Создаем товары
    const products = await Product.create([
      {
        name: { ru: 'iPhone 15 Pro Max', uz: 'iPhone 15 Pro Max', en: 'iPhone 15 Pro Max' },
        description: { ru: 'Новейший флагманский смартфон Apple', uz: 'Apple ning eng yangi smartfoni', en: 'Latest Apple flagship smartphone' },
        category: categories[0]._id,
        price: 1200000,
        originalPrice: 1400000,
        stock: 50,
        images: [
          { url: '/images/iphone15.jpg', isPrimary: true, order: 0 }
        ],
        seller: seller._id,
        createdBy: seller._id,
        material: 'metal',
        specifications: [
          { name: { ru: 'Экран', uz: 'Ekran', en: 'Display' }, value: { ru: '6.7 дюймов', uz: '6.7 dyuym', en: '6.7 inches' } },
          { name: { ru: 'Память', uz: 'Xotira', en: 'Storage' }, value: { ru: '256 ГБ', uz: '256 GB', en: '256 GB' } }
        ],
        rating: 4.8,
        isActive: true,
        status: 'active'
      },
      {
        name: { ru: 'Samsung Galaxy S24', uz: 'Samsung Galaxy S24', en: 'Samsung Galaxy S24' },
        description: { ru: 'Мощный Android смартфон', uz: 'Kuchli Android smartfon', en: 'Powerful Android smartphone' },
        category: categories[0]._id,
        price: 900000,
        originalPrice: 1000000,
        stock: 30,
        images: [
          { url: '/images/galaxy-s24.jpg', isPrimary: true, order: 0 }
        ],
        seller: seller._id,
        createdBy: seller._id,
        material: 'glass',
        specifications: [
          { name: { ru: 'Экран', uz: 'Ekran', en: 'Display' }, value: { ru: '6.2 дюйма', uz: '6.2 dyuym', en: '6.2 inches' } },
          { name: { ru: 'Память', uz: 'Xotira', en: 'Storage' }, value: { ru: '128 ГБ', uz: '128 GB', en: '128 GB' } }
        ],
        rating: 4.6,
        isActive: true,
        status: 'active'
      },
      {
        name: { ru: 'Nike Air Max 270', uz: 'Nike Air Max 270', en: 'Nike Air Max 270' },
        description: { ru: 'Стильные спортивные кроссовки', uz: 'Zamonaviy sport poyafzali', en: 'Stylish sports sneakers' },
        category: categories[1]._id,
        price: 150000,
        originalPrice: 200000,
        stock: 100,
        images: [
          { url: '/images/nike-air-max.jpg', isPrimary: true, order: 0 }
        ],
        seller: seller._id,
        createdBy: seller._id,
        material: 'fabric',
        specifications: [
          { name: { ru: 'Размер', uz: 'O\'lcham', en: 'Size' }, value: { ru: '42', uz: '42', en: '42' } },
          { name: { ru: 'Цвет', uz: 'Rang', en: 'Color' }, value: { ru: 'Черный', uz: 'Qora', en: 'Black' } }
        ],
        rating: 4.5,
        isActive: true,
        status: 'active'
      },
      {
        name: { ru: 'Кожаная сумка', uz: 'Charm sumka', en: 'Leather Bag' },
        description: { ru: 'Элегантная кожаная сумка', uz: 'Nafis charm sumka', en: 'Elegant leather bag' },
        category: categories[2]._id,
        price: 80000,
        stock: 25,
        images: [
          { url: '/images/leather-bag.jpg', isPrimary: true, order: 0 }
        ],
        seller: seller._id,
        createdBy: seller._id,
        material: 'leather',
        specifications: [
          { name: { ru: 'Материал', uz: 'Material', en: 'Material' }, value: { ru: 'Натуральная кожа', uz: 'Tabiiy charm', en: 'Genuine leather' } }
        ],
        rating: 4.7,
        isActive: true,
        status: 'active'
      },
      {
        name: { ru: 'Комнатное растение', uz: 'Xonaki o\'simlik', en: 'House Plant' },
        description: { ru: 'Красивое декоративное растение', uz: 'Chiroyli bezak o\'simligi', en: 'Beautiful decorative plant' },
        category: categories[3]._id,
        price: 35000,
        stock: 15,
        images: [
          { url: '/images/house-plant.jpg', isPrimary: true, order: 0 }
        ],
        seller: seller._id,
        createdBy: seller._id,
        material: 'wood',
        specifications: [
          { name: { ru: 'Высота', uz: 'Balandlik', en: 'Height' }, value: { ru: '30 см', uz: '30 sm', en: '30 cm' } }
        ],
        rating: 4.3,
        isActive: true,
        status: 'active'
      }
    ]);

    console.log('Товары созданы:', products.length);

    // Создаем баннеры
    const banners = await Banner.create([
      {
        title: 'Скидки до 50%',
        subtitle: 'Специальные предложения на электронику',
        imageUrl: '/images/banner-electronics.jpg',
        targetUrl: '/category/electronics',
        createdBy: seller._id,
        isActive: true,
        order: 1
      },
      {
        title: 'Новая коллекция',
        subtitle: 'Модная одежда сезона',
        imageUrl: '/images/banner-clothing.jpg',
        targetUrl: '/category/clothing',
        createdBy: seller._id,
        isActive: true,
        order: 2
      }
    ]);

    console.log('Баннеры созданы:', banners.length);
    console.log('✅ Тестовые данные успешно добавлены!');

  } catch (error) {
    console.error('Ошибка при создании тестовых данных:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Отключено от MongoDB');
  }
}

async function main() {
  await connectDB();
  await seedData();
}

main();
