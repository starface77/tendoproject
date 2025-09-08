const mongoose = require('mongoose');
const SellerApplication = require('./models/SellerApplication');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createPendingApp() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tendo-market');
    console.log('✅ Подключено к MongoDB');

    // Создадим пользователя
    const existingUser = await User.findOne({ email: 'pending@example.com' });
    let user;

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      user = await User.create({
        firstName: 'Петр',
        lastName: 'Петров',
        email: 'pending@example.com',
        password: hashedPassword,
        role: 'user',
        isActive: true
      });
      console.log('✅ Пользователь создан:', user._id);
    } else {
      user = existingUser;
      console.log('✅ Пользователь уже существует:', user._id);
    }

    // Создадим заявку
    const existingApp = await SellerApplication.findOne({ email: 'pending@example.com' });
    if (existingApp) {
      console.log('✅ Заявка уже существует:', existingApp._id);
      console.log('📊 Статус:', existingApp.status);
      return;
    }

    const application = await SellerApplication.create({
      businessName: 'Pending Test Company',
      businessType: 'individual',
      contactName: 'Петр Петров',
      email: 'pending@example.com',
      phone: '+998901234568',
      address: 'Ташкент, ул. Ожидания, д. 456',
      categories: ['Электроника'],
      productTypes: 'Продажа электроники и гаджетов',
      monthlyVolume: 'under_1m',
      experience: 'under_1_year',
      agreesToTerms: true,
      marketingConsent: false
    });

    console.log('✅ Заявка создана:');
    console.log('📋 ID:', application._id);
    console.log('🏢 Название:', application.businessName);
    console.log('📧 Email:', application.email);
    console.log('📊 Статус:', application.status);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

createPendingApp();




