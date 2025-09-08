#!/usr/bin/env node

/**
 * 🚀 SIMPLE INITIALIZATION FOR TENDO MARKET
 * Простая инициализация без сложных зависимостей
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

async function simpleInit() {
  try {
    console.log('\n🚀 === TENDO MARKET SIMPLE INIT ===\n');
    
    // Подключение к БД
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tendomarketuz');
    console.log('✅ База данных подключена');

    // Создание простого админа
    const User = mongoose.model('User', {
      firstName: String,
      lastName: String,
      email: { type: String, unique: true },
      password: String,
      role: { type: String, default: 'admin' },
      isActive: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    });

    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const hashedPassword = await bcryptjs.hash('admin123', 10);
      
      await User.create({
        firstName: 'Admin',
        lastName: 'Tendo',
        email: 'admin@tendo.uz', 
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      console.log('✅ Админ создан: admin@tendo.uz / admin123');
    } else {
      console.log('ℹ️  Админ уже существует');
    }

    // Создание простых категорий
    const Category = mongoose.model('Category', {
      name: String,
      slug: String,
      icon: String,
      isActive: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    });

    const categories = [
      { name: 'Электроника', slug: 'electronics', icon: '📱' },
      { name: 'Одежда', slug: 'clothing', icon: '👕' },
      { name: 'Обувь', slug: 'shoes', icon: '👟' },
      { name: 'Дом и быт', slug: 'home', icon: '🏠' },
      { name: 'Красота', slug: 'beauty', icon: '💄' },
      { name: 'Спорт', slug: 'sport', icon: '⚽' }
    ];

    for (const cat of categories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
        console.log(`✅ Категория "${cat.name}" создана`);
      }
    }

    console.log('\n🎉 === TENDO MARKET ГОТОВ! ===');
    console.log('\n📍 Запустите:');
    console.log('Frontend: npm run dev (в папке frontend)');
    console.log('Admin: npm start (в папке dashboard)');
    console.log('\n🔑 Вход в админку:');
    console.log('Email: admin@tendo.uz');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

simpleInit();

