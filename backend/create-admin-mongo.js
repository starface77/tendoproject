const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createAdminMongo() {
  const client = new MongoClient('mongodb://localhost:27017');

  try {
    await client.connect();
    console.log('✅ Подключено к MongoDB');

    const db = client.db('chexoluz');

    // Создаем админа
    const users = db.collection('users');
    const existingAdmin = await users.findOne({ email: 'admin@market.com' });

    if (!existingAdmin) {
      console.log('👑 Создаю админа...');
      const hashedPassword = await bcrypt.hash('admin123456', 12);

      await users.insertOne({
        email: 'admin@market.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Market',
        phone: '+998901234567',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Админ создан');
    } else {
      console.log('✅ Админ уже существует');
    }

    // Создаем категорию
    const categories = db.collection('categories');
    const existingCategory = await categories.findOne({ slug: 'electronics' });

    if (!existingCategory) {
      console.log('📂 Создаю категорию...');
      await categories.insertOne({
        name: { ru: 'Электроника', uz: 'Elektronika', en: 'Electronics' },
        slug: 'electronics',
        description: { ru: 'Электроника и гаджеты', uz: 'Elektronika va gadjetlar', en: 'Electronics and gadgets' },
        icon: '📱',
        isActive: true,
        isVisible: true,
        level: 0,
        path: '/electronics',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Категория создана');
    } else {
      console.log('✅ Категория уже существует');
    }

    // Создаем заявку продавца
    const sellerApplications = db.collection('sellerapplications');
    const existingApp = await sellerApplications.findOne({ email: 'seller@test.com' });

    if (!existingApp) {
      console.log('📝 Создаю заявку продавца...');
      await sellerApplications.insertOne({
        businessName: 'Test Electronics Store',
        contactName: 'Иван Иванов',
        email: 'seller@test.com',
        phone: '+998901234567',
        businessType: 'individual',
        address: 'Ташкент, ул. Амира Темура, 15',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Заявка продавца создана');
    } else {
      console.log('✅ Заявка продавца уже существует');
    }

    // Создаем продукт
    const products = db.collection('products');
    const existingProduct = await products.findOne({ name: 'Test iPhone 15' });

    if (!existingProduct) {
      console.log('📱 Создаю продукт...');
      await products.insertOne({
        name: 'Test iPhone 15',
        price: 1500000,
        description: 'Тестовый iPhone 15 для демонстрации',
        brand: 'Apple',
        model: 'iPhone 15',
        images: ['https://example.com/iphone15.jpg'],
        isActive: true,
        inStock: true,
        stock: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Продукт создан');
    } else {
      console.log('✅ Продукт уже существует');
    }

    console.log('\n🎯 Данные созданы успешно!');
    console.log('📧 Admin: admin@market.com / admin123456');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await client.close();
    console.log('✅ Отключено от MongoDB');
  }
}

createAdminMongo();




