require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createFinalAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tendo-market');
    console.log('🔗 Подключен к MongoDB');

    // Полное удаление всех админов
    await User.deleteMany({ role: 'admin' });
    console.log('🗑️ Удалены ВСЕ админы');

    // Создаем пароль напрямую с bcrypt
    const password = 'admin123';
    console.log('🔐 Создаю хеш для пароля:', password);
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('✅ Хеш создан:', hashedPassword);

    // Тестируем хеш СРАЗУ
    const testResult = await bcrypt.compare(password, hashedPassword);
    console.log('🧪 Тест хеша:', testResult);

    if (!testResult) {
      console.error('❌ ОШИБКА: хеш не проходит тест!');
      process.exit(1);
    }

    // Создаем админа БЕЗ middleware User модели
    const adminData = {
      firstName: 'Admin',
      lastName: 'Super',
      email: 'admin@tendo.uz',
      password: hashedPassword, // УЖЕ хешированный!
      role: 'admin',
      isActive: true,
      isVerified: true,
      language: 'ru',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Сохраняем напрямую в коллекцию, минуя middleware
    const db = mongoose.connection.db;
    const result = await db.collection('users').insertOne(adminData);
    console.log('✅ Админ создан напрямую в MongoDB!');
    console.log('   ID:', result.insertedId);

    // Проверяем созданного админа
    const createdAdmin = await User.findById(result.insertedId);
    console.log('🔍 Проверяю созданного админа:');
    console.log('   Email:', createdAdmin.email);
    console.log('   Role:', createdAdmin.role);
    console.log('   Password hash:', createdAdmin.password);

    // Финальный тест пароля
    const finalTest = await bcrypt.compare('admin123', createdAdmin.password);
    console.log('🚀 ФИНАЛЬНЫЙ ТЕСТ ПАРОЛЯ:', finalTest);

    if (finalTest) {
      console.log('');
      console.log('🎉 УСПЕХ! АДМИН РАБОТАЕТ!');
      console.log('📧 Email: admin@tendo.uz');
      console.log('🔑 Password: admin123');
      console.log('');
    } else {
      console.error('❌ ВСЕ ЕЩЕ НЕ РАБОТАЕТ!');
    }

    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

createFinalAdmin();





