const mongoose = require('mongoose');
const SellerApplication = require('./models/SellerApplication');
const User = require('./models/User');
const Seller = require('./models/Seller');

async function testSellerApproval() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tendo');
    console.log('✅ Подключено к MongoDB');

    // Проверяем наличие заявок
    const applications = await SellerApplication.find().limit(5);
    console.log('📋 Найдено заявок:', applications.length);

    if (applications.length > 0) {
      const app = applications[0];
      console.log('📄 Заявка:', {
        id: app._id,
        email: app.email,
        status: app.status,
        businessName: app.businessName,
        contactName: app.contactName,
        phone: app.phone
      });

      // Проверяем, существует ли пользователь
      const user = await User.findOne({ email: app.email });
      if (user) {
        console.log('👤 Пользователь найден:', user.email, 'Роль:', user.role);
      } else {
        console.log('❌ Пользователь не найден:', app.email);
      }
    }

    // Проверяем продавцов
    const sellers = await Seller.find().limit(3);
    console.log('🏪 Найдено продавцов:', sellers.length);

    await mongoose.disconnect();
    console.log('✅ Тест завершен');
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error(error.stack);
  }
}

testSellerApproval();




