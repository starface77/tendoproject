#!/usr/bin/env node

/**
 * 🚀 QUICK START SCRIPT FOR TENDO MARKET
 * Быстрая настройка и запуск маркетплейса
 */

const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Setting = require('./models/Setting');

async function quickStart() {
  console.log('\n🚀 === TENDO MARKET QUICK START ===\n');
  
  try {
    // 1. Подключение к БД
    console.log('🔌 Подключение к MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tendomarketuz');
    console.log('✅ База данных подключена');

    // 2. Создание админа
    console.log('\n👑 Создание супер-админа...');
    const adminExists = await User.findOne({ role: 'super_admin' });
    
    if (!adminExists) {
      const hashedPassword = await bcryptjs.hash('admin123', 12);
      
      const admin = new User({
        firstName: 'Admin',
        lastName: 'Tendo Market',
        email: 'admin@tendo.uz',
        password: hashedPassword,
        role: 'super_admin',
        isEmailVerified: true,
        isActive: true,
        profile: {
          bio: 'Супер-администратор Tendo Market'
        },
        permissions: {
          canManageUsers: true,
          canManageProducts: true,
          canManageOrders: true,
          canManageSettings: true,
          canViewAnalytics: true,
          canManagePayments: true,
          canManageSellers: true
        }
      });

      await admin.save();
      console.log('✅ Админ создан: admin@tendo.uz / admin123');
    } else {
      console.log('ℹ️  Админ уже существует');
    }

    // 3. Создание базовых категорий
    console.log('\n📂 Создание категорий...');
    const categories = [
      { name: 'Электроника', slug: 'electronics', icon: '📱', description: 'Смартфоны, планшеты, аксессуары' },
      { name: 'Одежда', slug: 'clothing', icon: '👕', description: 'Мужская и женская одежда' },
      { name: 'Обувь', slug: 'shoes', icon: '👟', description: 'Спортивная и повседневная обувь' },
      { name: 'Дом и быт', slug: 'home', icon: '🏠', description: 'Товары для дома и быта' },
      { name: 'Красота', slug: 'beauty', icon: '💄', description: 'Косметика и парфюмерия' },
      { name: 'Спорт', slug: 'sport', icon: '⚽', description: 'Спортивные товары' },
      { name: 'Авто', slug: 'auto', icon: '🚗', description: 'Автотовары и аксессуары' },
      { name: 'Книги', slug: 'books', icon: '📚', description: 'Книги и канцелярия' }
    ];

    for (const catData of categories) {
      const exists = await Category.findOne({ slug: catData.slug });
      if (!exists) {
        const category = new Category({
          name: {
            ru: catData.name,
            uz: catData.name,
            en: catData.name
          },
          slug: catData.slug,
          icon: catData.icon,
          description: {
            ru: catData.description,
            uz: catData.description,
            en: catData.description
          },
          isActive: true,
          isVisible: true,
          productsCount: 0
        });
        await category.save();
        console.log(`✅ Категория "${catData.name}" создана`);
      }
    }

    // 4. Инициализация настроек
    console.log('\n⚙️  Создание базовых настроек...');
    const defaultSettings = [
      {
        key: 'site_name',
        value: 'Tendo Market',
        meta: {
          category: 'general',
          title: { ru: 'Название сайта' },
          fieldType: 'text',
          isSystem: true
        }
      },
      {
        key: 'contact_phone',
        value: '+998 78 150 15 15',
        meta: {
          category: 'general',
          title: { ru: 'Телефон поддержки' },
          fieldType: 'text'
        }
      },
      {
        key: 'contact_email',
        value: 'support@tendo.uz',
        meta: {
          category: 'general',
          title: { ru: 'Email поддержки' },
          fieldType: 'email'
        }
      },
      {
        key: 'free_delivery_threshold',
        value: 200000,
        meta: {
          category: 'delivery',
          title: { ru: 'Бесплатная доставка от' },
          fieldType: 'number'
        }
      },
      {
        key: 'delivery_cost',
        value: 25000,
        meta: {
          category: 'delivery',
          title: { ru: 'Стоимость доставки' },
          fieldType: 'number'
        }
      }
    ];

    for (const settingData of defaultSettings) {
      const exists = await Setting.findOne({ key: settingData.key });
      if (!exists) {
        const setting = new Setting(settingData);
        await setting.save();
        console.log(`✅ Настройка "${settingData.key}" создана`);
      }
    }

    console.log('\n🎉 === TENDO MARKET ГОТОВ! ===');
    console.log('\n📍 Доступные адреса:');
    console.log(`🌐 Frontend: http://localhost:3000`);
    console.log(`🔧 Admin Panel: http://localhost:3001`);
    console.log(`⚙️  Backend API: http://localhost:5000`);
    console.log('\n🔑 Данные для входа в админ панель:');
    console.log(`Email: admin@tendo.uz`);
    console.log(`Password: admin123`);
    
    console.log('\n🚀 Для запуска выполните:');
    console.log('npm start (в папке backend)');
    console.log('npm run dev (в папке frontend)');
    console.log('npm start (в папке dashboard)');

  } catch (error) {
    console.error('\n❌ Ошибка настройки:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
}

// Запуск скрипта
quickStart();

