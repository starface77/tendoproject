const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { connectDB } = require('../config/database');

/**
 * 🌱 СИДЕР ДЛЯ ЗАПОЛНЕНИЯ БАЗЫ ДАННЫХ
 * Создает тестовые данные для разработки
 */

const createAdminUser = async () => {
  try {
    const adminUser = new User({
      email: 'admin@chexol.uz',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'Market',
      phone: '+998901234567',
      city: 'tashkent',
      role: 'admin',
      isActive: true,
      isVerified: true
    });

    await adminUser.save();
    console.log('✅ Админ пользователь создан');
    return adminUser;
  } catch (error) {
    console.log('⚠️  Админ уже существует или ошибка:', error.message);
  }
};

const createCategories = async (adminId) => {
  try {
    const categories = [
      {
        name: { ru: 'Электроника', uz: 'Elektronika', en: 'Electronics' },
        slug: 'electronics',
        description: { ru: 'Смартфоны и аксессуары', uz: 'Smartfonlar va aksessuarlar', en: 'Phones and accessories' },
        icon: '📱',
        isActive: true,
        order: 1,
        createdBy: adminId
      },
      {
        name: { ru: 'Чехлы для iPhone', uz: 'iPhone uchun qoplamalar', en: 'iPhone Cases' },
        slug: 'iphone-cases',
        description: { ru: 'Защитные чехлы для iPhone', uz: 'iPhone uchun himoya qoplamalari', en: 'Protective cases for iPhone' },
        icon: '📱',
        parent: null,
        isActive: true,
        order: 2,
        createdBy: adminId
      }
    ];

    for (const categoryData of categories) {
      const existingCategory = await Category.findOne({ slug: categoryData.slug });
      if (!existingCategory) {
        await Category.create(categoryData);
      }
    }

    console.log('✅ Категории созданы');
  } catch (error) {
    console.error('❌ Ошибка создания категорий:', error);
  }
};

const createTestProducts = async (adminId) => {
  try {
    const category = await Category.findOne({ slug: 'iphone-cases' });

    if (!category) {
      console.log('⚠️  Категория не найдена, пропускаем создание товаров');
      return;
    }

    const products = [
      {
        name: { ru: 'Чехол для iPhone 15 Pro', uz: 'iPhone 15 Pro uchun qoplama', en: 'Case for iPhone 15 Pro' },
        description: { ru: 'Защитный силиконовый чехол с магнитной зарядкой', uz: 'Himoya silikon qoplama magnit zaryadka bilan', en: 'Protective silicone case with magnetic charging' },
        price: 150000,
        originalPrice: 180000,
        category: category._id,
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        material: 'silicone',
        images: ['/uploads/case1.jpg'],
        stock: 50,
        isActive: true,
        isNew: true,
        features: ['wireless_charging', 'shockProof', 'dropProtection'],
        protection: {
          shockProof: true,
          waterProof: false,
          dustProof: false,
          scratchResistant: true,
          dropProtection: 'advanced'
        },
        createdBy: adminId
      },
      {
        name: { ru: 'Чехол для iPhone 14', uz: 'iPhone 14 uchun qoplama', en: 'Case for iPhone 14' },
        description: { ru: 'Тонкий прозрачный чехол с антибактериальным покрытием', uz: 'Yupqa shaffof qoplama antibakterial qoplama bilan', en: 'Thin transparent case with antibacterial coating' },
        price: 120000,
        category: category._id,
        brand: 'Apple',
        model: 'iPhone 14',
        material: 'plastic',
        images: ['/uploads/case2.jpg'],
        stock: 30,
        isActive: true,
        features: ['transparent', 'anti_bacterial'],
        protection: {
          shockProof: false,
          waterProof: false,
          dustProof: false,
          scratchResistant: true,
          dropProtection: 'basic'
        },
        createdBy: adminId
      }
    ];

    for (const productData of products) {
      const existingProduct = await Product.findOne({
        'name.ru': productData.name.ru,
        brand: productData.brand,
        model: productData.model
      });

      if (!existingProduct) {
        await Product.create(productData);
      }
    }

    console.log('✅ Тестовые товары созданы');
  } catch (error) {
    console.error('❌ Ошибка создания товаров:', error);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Начинаем заполнение базы данных...');

    // Подключение к БД
    await connectDB();

    // Создание админа
    const admin = await createAdminUser();

    // Создание категорий
    if (admin) {
      await createCategories(admin._id);
    }

    // Создание тестовых товаров
    if (admin) {
      await createTestProducts(admin._id);
    }

    console.log('🎉 База данных успешно заполнена!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
    process.exit(1);
  }
};

// Запуск сидера
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, createAdminUser, createCategories, createTestProducts };
