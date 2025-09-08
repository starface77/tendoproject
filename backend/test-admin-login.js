const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function testAdminLogin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tendo-market');
    console.log('✅ Подключено к MongoDB');

    const admin = await User.findOne({ email: 'admin@test.com' }).select('+password');
    if (!admin) {
      console.log('❌ Админ не найден');
      return;
    }

    console.log('✅ Админ найден:', admin.email);

    // Тестируем пароль
    const password = 'admin123';
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log('🔐 Проверка пароля:', isMatch ? '✅ Верный' : '❌ Неверный');

    if (isMatch) {
      console.log('🎉 Вход успешен!');
      console.log('📧 Email: admin@test.com');
      console.log('🔑 Пароль: admin123');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

testAdminLogin();