require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
  try {
    // Подключение к базе данных
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tendo-market');
    console.log('🔗 Подключен к MongoDB');

    // Проверяем существующих админов
    const existingAdmins = await User.find({ role: 'admin' });
    console.log(`👥 Найдено админов: ${existingAdmins.length}`);
    
    if (existingAdmins.length > 0) {
      console.log('📋 Существующие админы:');
      existingAdmins.forEach(admin => {
        console.log(`   📧 ${admin.email} (ID: ${admin._id})`);
      });
    }

    // Создаем нового админа
    const adminEmail = 'admin@tendo.uz';
    const adminPassword = 'admin123';

    // Проверяем, нет ли уже такого админа
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️ Админ с таким email уже существует');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`🔑 Используйте пароль: admin123`);
      
      // Обновляем пароль на всякий случай
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log('🔄 Пароль админа обновлен');
    } else {
      // Хешируем пароль
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      // Создаем админа
      const admin = new User({
        firstName: 'Admin',
        lastName: 'Tendo',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        language: 'ru'
      });

      await admin.save();
      console.log('✅ Новый админ создан!');
    }

    console.log('');
    console.log('🎯 ДАННЫЕ ДЛЯ ВХОДА В АДМИН ПАНЕЛЬ:');
    console.log('📧 Email: admin@tendo.uz');  
    console.log('🔑 Password: admin123');
    console.log('🌐 URL: http://localhost:3001');
    console.log('');

    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

createAdmin();