const mongoose = require('mongoose');

// Простая схема заявки продавца для теста
const sellerApplicationSchema = new mongoose.Schema({
  businessName: String,
  contactName: String,
  email: String,
  phone: String,
  businessType: String,
  address: String,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SellerApplication = mongoose.model('SellerApplication', sellerApplicationSchema);

async function createTestSellerApp() {
  try {
    console.log('🔄 Подключаюсь к MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/chexoluz');
    console.log('✅ Подключено');

    // Проверяем существующую заявку
    const existing = await SellerApplication.findOne({ email: 'seller@test.com' });
    if (existing) {
      console.log('✅ Тестовая заявка уже существует');
      console.log('📋 ID:', existing._id);
      console.log('🏢 Компания:', existing.businessName);
      console.log('📧 Email:', existing.email);
      console.log('📊 Статус:', existing.status);
      await mongoose.disconnect();
      return existing;
    }

    // Создаем тестовую заявку
    console.log('📝 Создаю тестовую заявку продавца...');
    const application = new SellerApplication({
      businessName: 'Test Electronics Store',
      contactName: 'Иван Иванов',
      email: 'seller@test.com',
      phone: '+998901234567',
      businessType: 'individual',
      address: 'Ташкент, ул. Амира Темура, 15',
      status: 'pending'
    });

    await application.save();
    console.log('✅ Тестовая заявка создана');
    console.log('📋 ID:', application._id);
    console.log('🏢 Компания:', application.businessName);
    console.log('📧 Email:', application.email);
    console.log('📊 Статус:', application.status);

    await mongoose.disconnect();
    console.log('✅ Отключено от MongoDB');

    return application;

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    await mongoose.disconnect();
  }
}

createTestSellerApp();