const mongoose = require('mongoose');
const SellerApplication = require('./models/SellerApplication');

async function testApproveAPI() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tendo-market');
    console.log('✅ Подключено к MongoDB');

    // Найдем тестовую заявку
    const application = await SellerApplication.findOne({ email: 'test@example.com' });
    if (!application) {
      console.log('❌ Заявка не найдена');
      return;
    }

    console.log('📋 Найдена заявка:', application._id);
    console.log('📊 Текущий статус:', application.status);

    // Попробуем одобрить заявку
    application.status = 'approved';
    application.reviewedAt = new Date();
    application.reviewedBy = 'test-admin'; // Для теста

    await application.save();

    console.log('✅ Заявка одобрена!');
    console.log('📊 Новый статус:', application.status);
    console.log('📅 Дата одобрения:', application.reviewedAt);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

testApproveAPI();




