#!/usr/bin/env node

/**
 * 🔐 CREATE ADMIN USER SCRIPT
 * Скрипт для создания администратора Tendo Market
 */

const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const readline = require('readline');
require('dotenv').config();

// Import models
const User = require('../models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const createAdmin = async () => {
  console.log('\n🚀 === TENDO MARKET ADMIN CREATOR ===\n');
  
  try {
    // Подключение к базе данных
    console.log('🔌 Подключение к базе данных...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tendomarketuz', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Подключение к БД установлено');

    // Сбор информации об администраторе
    console.log('\n📝 Введите данные администратора:');
    
    const firstName = await question('👤 Имя: ');
    const lastName = await question('👤 Фамилия: ');
    const email = await question('📧 Email: ');
    let password = await question('🔑 Пароль (минимум 6 символов): ');
    
    // Валидация
    if (!firstName || firstName.length < 2) {
      throw new Error('Имя должно содержать минимум 2 символа');
    }
    
    if (!lastName || lastName.length < 2) {
      throw new Error('Фамилия должна содержать минимум 2 символа');
    }
    
    if (!email || !email.includes('@')) {
      throw new Error('Введите корректный email адрес');
    }
    
    if (!password || password.length < 6) {
      throw new Error('Пароль должен содержать минимум 6 символов');
    }

    // Проверяем, существует ли уже админ с таким email
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      const overwrite = await question(`⚠️  Пользователь с email ${email} уже существует. Перезаписать? (y/N): `);
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Отменено пользователем');
        process.exit(0);
      }
      
      // Удаляем существующего пользователя
      await User.deleteOne({ email });
      console.log('🗑️  Существующий пользователь удален');
    }

    // Хешируем пароль
    console.log('\n🔒 Хеширование пароля...');
    const salt = await bcryptjs.genSalt(12);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Создаем администратора
    console.log('👨‍💼 Создание администратора...');
    const admin = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'super_admin',
      isEmailVerified: true,
      isActive: true,
      profile: {
        avatar: null,
        bio: 'Супер-администратор Tendo Market',
        preferences: {
          language: 'ru',
          notifications: {
            email: true,
            sms: false,
            push: true
          }
        }
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

    console.log('\n✅ === АДМИНИСТРАТОР СОЗДАН УСПЕШНО! ===');
    console.log(`👤 Имя: ${firstName} ${lastName}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🛡️  Роль: Супер-администратор`);
    console.log(`🆔 ID: ${admin._id}`);
    
    console.log('\n🎯 Данные для входа:');
    console.log(`Email: ${email}`);
    console.log(`Пароль: [скрыт]`);
    
    console.log('\n📍 Админ-панель доступна по адресу:');
    console.log(`🌐 http://localhost:3001/login`);
    console.log(`🌐 http://localhost:3001`);
    
    console.log('\n💡 Рекомендации:');
    console.log('• Измените пароль после первого входа');
    console.log('• Настройте двухфакторную аутентификацию');
    console.log('• Создайте резервную копию базы данных');
    
  } catch (error) {
    console.error('\n❌ Ошибка создания администратора:', error.message);
    
    if (error.code === 11000) {
      console.error('🚨 Пользователь с таким email уже существует');
    }
    
    process.exit(1);
  } finally {
    rl.close();
    mongoose.connection.close();
  }
};

// Обработка прерывания
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Процесс прерван пользователем');
  rl.close();
  mongoose.connection.close();
  process.exit(0);
});

// Запуск скрипта
if (require.main === module) {
  createAdmin();
}

module.exports = createAdmin;