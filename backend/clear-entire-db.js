const mongoose = require('mongoose');
const { connectDB } = require('./config/database');

const clearEntireDB = async () => {
  try {
    console.log('🔄 Подключение к базе данных...');
    await connectDB();

    console.log('🗑️ Полная очистка базы данных...');

    // Получаем все коллекции
    const collections = mongoose.connection.collections;

    // Очищаем каждую коллекцию
    for (const collectionName in collections) {
      console.log(`🗑️ Очищаем коллекцию: ${collectionName}`);
      await collections[collectionName].deleteMany({});
    }

    console.log('✅ База данных полностью очищена!');

    // Создаем нового админа
    console.log('👑 Создаем нового админа...');

    const User = require('./models/User');
    const bcrypt = require('bcryptjs');

    const email = 'superadmin@tendo.uz';
    const password = 'admin123456';

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = new User({
      email,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Tendo',
      phone: '+998901234569',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      permissions: [
        'read:products',
        'write:products',
        'read:orders',
        'write:orders',
        'read:users',
        'write:users',
        'read:analytics',
        'manage:site'
      ]
    });

    await newAdmin.save();

    console.log('✅ Админ создан успешно!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Пароль: ${password}`);
    console.log(`🆔 ID: ${newAdmin._id}`);

    // Проверяем пароль
    const isValid = await newAdmin.checkPassword(password);
    console.log(`🔍 Проверка пароля: ${isValid}`);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

clearEntireDB();
