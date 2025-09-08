const mongoose = require('mongoose');

async function checkSellerApps() {
  try {
    await mongoose.connect('mongodb://localhost:27017/chexoluz');
    console.log('✅ Подключено к MongoDB');

    const db = mongoose.connection.db;
    const applications = db.collection('sellerapplications');

    const apps = await applications.find({}).toArray();
    console.log(`📊 Найдено заявок: ${apps.length}`);

    apps.forEach((app, i) => {
      console.log(`${i+1}. ID: ${app._id}`);
      console.log(`   Компания: ${app.businessName}`);
      console.log(`   Email: ${app.email}`);
      console.log(`   Статус: ${app.status}`);
      console.log(`   Дата: ${app.createdAt}`);
      console.log('---');
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

checkSellerApps();




