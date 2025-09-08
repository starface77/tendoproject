const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const SellerApplication = require('./models/SellerApplication');

async function testAPIManual() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tendo-market');
    console.log('✅ Подключено к MongoDB');

    // Найдем админа
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ Админ не найден');
      return;
    }

    console.log('✅ Админ найден:', admin._id);

    // Создадим JWT токен
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo_development_only_change_in_production_2025',
      { expiresIn: '7d' }
    );

    console.log('🔑 Токен создан');

    // Найдем заявку
    const application = await SellerApplication.findOne({ email: 'test@example.com' });
    if (!application) {
      console.log('❌ Заявка не найдена');
      return;
    }

    console.log('📋 Заявка найдена:', application._id);
    console.log('📊 Статус заявки:', application.status);

    // Попробуем напрямую обновить статус заявки
    application.status = 'approved';
    application.reviewedAt = new Date();
    application.reviewedBy = admin._id;
    await application.save();

    console.log('✅ Заявка одобрена вручную!');
    console.log('📊 Новый статус:', application.status);

    // Проверим, что статус изменился
    const updatedApplication = await SellerApplication.findById(application._id);
    console.log('🔍 Проверка статуса:', updatedApplication.status);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

testAPIManual();




