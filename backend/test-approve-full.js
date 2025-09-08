const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

async function testApproveFull() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tendo-market');
    console.log('✅ Подключено к MongoDB');

    // Найдем админа для получения токена
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ Админ не найден. Создам тестового админа...');

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);

      const newAdmin = await User.create({
        firstName: 'Admin',
        lastName: 'Test',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });

      console.log('✅ Тестовый админ создан:', newAdmin._id);
      return;
    }

    console.log('✅ Админ найден:', admin._id);

    // Создадим JWT токен для админа
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo_development_only_change_in_production_2025',
      { expiresIn: '7d' }
    );

    console.log('🔑 JWT токен создан');
    console.log('📋 Токен:', token);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

testApproveFull();




