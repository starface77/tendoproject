const mongoose = require('mongoose');
const SellerApplication = require('./models/SellerApplication');
const User = require('./models/User');

// Подключение к базе данных
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tendo-marketplace');
    console.log('✅ Подключено к MongoDB');
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

// Создание тестовой заявки
const createTestApplication = async () => {
  try {
    console.log('🔄 Создание тестовой заявки продавца...');
    
    // Сначала найдем или создадим тестового пользователя
    let testUser = await User.findOne({ email: 'seller.test@tendo.uz' });
    
    if (!testUser) {
      testUser = new User({
        username: 'seller_test_user',
        email: 'seller.test@tendo.uz',
        password: 'hashedpassword123', // В реальности должен быть хешированный
        firstName: 'Тест',
        lastName: 'Продавцов',
        phone: '+998901234567',
        role: 'user',
        isActive: true,
        emailVerified: true
      });
      
      await testUser.save();
      console.log('✅ Создан тестовый пользователь:', testUser.username);
    }
    
    // Проверим, нет ли уже заявки от этого пользователя
    const existingApp = await SellerApplication.findOne({ userId: testUser._id });
    if (existingApp) {
      console.log('ℹ️ Заявка от этого пользователя уже существует');
      return;
    }
    
    // Создаем заявку
    const application = new SellerApplication({
      userId: testUser._id,
      status: 'pending',
      
      businessInfo: {
        companyName: 'ТестКомпани ООО',
        registrationNumber: '123456789',
        taxId: '987654321',
        address: {
          street: 'ул. Тестовая, дом 123',
          city: 'Ташкент',
          state: 'Ташкент',
          postalCode: '100000',
          country: 'Узбекистан'
        },
        description: 'Компания занимается продажей тестовых товаров для демонстрации',
        website: 'https://testcompany.uz',
        phone: '+998701234567'
      },
      
      contactInfo: {
        contactPerson: 'Иван Тестович',
        position: 'Директор',
        email: 'director@testcompany.uz',
        phone: '+998701234567'
      },
      
      documents: {
        businessLicense: '/uploads/test-license.pdf',
        taxCertificate: '/uploads/test-tax.pdf',
        identityDocument: '/uploads/test-passport.pdf',
        bankStatement: '/uploads/test-bank.pdf'
      },
      
      productCategories: ['Электроника', 'Одежда', 'Дом и сад'],
      
      expectedMonthlyRevenue: 5000000, // 5 млн сум
      
      salesExperience: '3_5_years',
      
      additionalInfo: 'Это тестовая заявка для демонстрации работы админ-панели. Компания имеет опыт работы в сфере онлайн-торговли.'
    });
    
    await application.save();
    
    console.log('✅ Тестовая заявка создана успешно!');
    console.log('📋 ID заявки:', application._id);
    console.log('👤 Пользователь:', testUser.username);
    console.log('🏢 Компания:', application.businessInfo.companyName);
    console.log('📊 Статус:', application.status);
    
  } catch (error) {
    console.error('❌ Ошибка создания заявки:', error.message);
  }
};

// Запуск
const main = async () => {
  await connectDB();
  await createTestApplication();
  
  console.log('\n🎯 Готово! Можете проверить админ-панель.');
  process.exit(0);
};

main();

