const mongoose = require('mongoose');
const SellerApplication = require('./models/SellerApplication');

async function test() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tendo-market');
    console.log('✅ Подключено к MongoDB');

    const count = await SellerApplication.countDocuments();
    console.log('📊 Количество заявок:', count);

    if (count > 0) {
      const applications = await SellerApplication.find().limit(3);
      console.log('📋 Последние заявки:');
      applications.forEach((app, i) => {
        console.log(`${i+1}. ${app.businessName} - ${app.status} (${app._id})`);
      });
    } else {
      console.log('⚠️ Нет заявок в базе данных');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

test();




