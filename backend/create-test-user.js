const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tendo-market');
    console.log('✅ Подключено к MongoDB');

    // Проверим, существует ли уже пользователь
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('✅ Пользователь уже существует:', existingUser._id);
      return;
    }

    // Создаем тестового пользователя
    const hashedPassword = await bcrypt.hash('password123', 12);

    const user = await User.create({
      firstName: 'Иван',
      lastName: 'Иванов',
      email: 'test2@example.com',
      password: hashedPassword,
      role: 'user', // Начальная роль
      isActive: true
    });

    console.log('✅ Тестовый пользователь создан:');
    console.log('📋 ID:', user._id);
    console.log('👤 Имя:', `${user.firstName} ${user.lastName}`);
    console.log('📧 Email:', user.email);
    console.log('🔑 Роль:', user.role);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

createTestUser();
