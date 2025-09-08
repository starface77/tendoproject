require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function fixAdminPassword() {
  try {
    // Подключение к базе данных
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tendo-market');
    console.log('🔗 Подключен к MongoDB');

    // Удаляем всех существующих админов
    await User.deleteMany({ role: 'admin' });
    console.log('🗑️ Удалил старых админов');

    // Создаем нового админа с простым паролем
    const adminData = {
      firstName: 'Admin',
      lastName: 'Tendo',
      email: 'admin@tendo.uz',
      password: 'admin123', // Простой пароль
      role: 'admin',
      isActive: true,
      language: 'ru'
    };

    console.log('🔐 Хеширую пароль...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);
    
    console.log('🔍 Тест хеширования:');
    console.log('   Оригинальный пароль:', adminData.password);
    console.log('   Хешированный пароль:', hashedPassword);
    
    // Тестируем сравнение
    const isMatch = await bcrypt.compare('admin123', hashedPassword);
    console.log('   Тест сравнения bcrypt.compare("admin123", hash):', isMatch);

    if (!isMatch) {
      console.error('❌ Ошибка: тест сравнения не прошел!');
      process.exit(1);
    }

    // Создаем админа
    const admin = new User({
      ...adminData,
      password: hashedPassword
    });

    await admin.save();
    console.log('✅ Новый админ создан с корректным паролем!');

    // Проверяем созданного админа
    const savedAdmin = await User.findOne({ email: 'admin@tendo.uz' });
    console.log('🔍 Проверка сохраненного админа:');
    console.log('   Email:', savedAdmin.email);
    console.log('   Role:', savedAdmin.role);
    console.log('   Active:', savedAdmin.isActive);
    console.log('   Password hash length:', savedAdmin.password.length);
    
    // Тестируем пароль еще раз
    const finalTest = await bcrypt.compare('admin123', savedAdmin.password);
    console.log('   Финальный тест пароля:', finalTest);

    console.log('');
    console.log('🎯 ДАННЫЕ ДЛЯ ВХОДА:');
    console.log('📧 Email: admin@tendo.uz');
    console.log('🔑 Password: admin123');
    console.log('');

    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixAdminPassword();