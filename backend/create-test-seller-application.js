const mongoose = require('mongoose');
const SellerApplication = require('./models/SellerApplication');
const User = require('./models/User');

async function createTestSellerApplication() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tendo');
    console.log('✅ Подключено к MongoDB');

    // Создаем тестового пользователя, если его нет
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });
      console.log('👤 Создан тестовый пользователь');
    }

    // Создаем тестовую заявку
    const testApplication = await SellerApplication.create({
      businessName: 'Test Company',
      businessType: 'individual',
      contactName: 'Test Contact',
      email: 'test@example.com',
      phone: '+998901234567',
      address: 'Ташкент, улица Тестовая, дом 1',
      website: 'https://testcompany.uz',
      categories: ['Электроника', 'Одежда и обувь'],
      productTypes: 'Продажа различных товаров для тестирования платформы',
      monthlyVolume: '1m_5m',
      experience: '1_3_years',
      otherPlatforms: 'Работал на других платформах',
      agreesToTerms: true,
      marketingConsent: false,
      status: 'pending'
    });

    console.log('📋 Создана тестовая заявка:', {
      id: testApplication._id,
      businessName: testApplication.businessName,
      email: testApplication.email,
      status: testApplication.status
    });

    await mongoose.disconnect();
    console.log('✅ Тест завершен');
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error(error.stack);
  }
}

createTestSellerApplication();




