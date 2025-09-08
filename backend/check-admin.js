const mongoose = require('mongoose');
const User = require('./models/User');

async function checkAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tendo-market');
    console.log('✅ Подключено к MongoDB');

    const admins = await User.find({ role: 'admin' });
    console.log(`📊 Найдено админов: ${admins.length}`);

    admins.forEach((admin, i) => {
      console.log(`${i+1}. ${admin.firstName} ${admin.lastName}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Роль: ${admin.role}`);
      console.log(`   Активен: ${admin.isActive}`);
      console.log(`   ID: ${admin._id}`);
      console.log('---');
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

checkAdmin();