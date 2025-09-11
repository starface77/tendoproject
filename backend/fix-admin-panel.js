const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function fixAdminPanel() {
  const client = new MongoClient('mongodb://localhost:27017');

  try {
    await client.connect();
    console.log('✅ Подключено к MongoDB');

    const db = client.db('tendomarketuz');

    // Создаем/обновляем админа
    const users = db.collection('users');
    console.log('👑 Создаю/обновляю админа...');

    const hashedPassword = await bcrypt.hash('admin123456', 12);

    await users.updateOne(
      { email: 'admin@market.com' },
      {
        $set: {
          email: 'admin@market.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'Market',
          phone: '+998901234567',
          role: 'admin',
          isActive: true,
          isEmailVerified: true,
          permissions: [
            'read:products', 'write:products', 'delete:products',
            'read:orders', 'write:orders', 'delete:orders',
            'read:users', 'write:users', 'delete:users',
            'read:categories', 'write:categories', 'delete:categories',
            'read:sellers', 'write:sellers', 'delete:sellers',
            'read:analytics', 'manage:site'
          ],
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log('✅ Админ готов: admin@market.com / admin123456');

    // Создаем категорию
    const categories = db.collection('categories');
    console.log('📂 Создаю категорию...');

    await categories.updateOne(
      { slug: 'electronics' },
      {
        $set: {
          name: { ru: 'Электроника', uz: 'Elektronika', en: 'Electronics' },
          slug: 'electronics',
          description: { ru: 'Электроника и гаджеты', uz: 'Elektronika va gadjetlar', en: 'Electronics and gadgets' },
          icon: '📱',
          isActive: true,
          isVisible: true,
          level: 0,
          path: '/electronics',
          color: '#3B82F6',
          sortOrder: 0,
          productCount: 0,
          viewCount: 0,
          commission: 5,
          minPrice: 0,
          maxPrice: 0,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log('✅ Категория создана');

    // Создаем заявку продавца
    const sellerApplications = db.collection('sellerapplications');
    console.log('📝 Создаю заявку продавца...');

    const result = await sellerApplications.updateOne(
      { email: 'seller@test.com' },
      {
        $set: {
          businessName: 'Test Electronics Store',
          contactName: 'Иван Иванов',
          email: 'seller@test.com',
          phone: '+998901234567',
          businessType: 'individual',
          address: 'Ташкент, ул. Амира Темура, 15',
          categories: ['electronics'],
          productTypes: 'Смартфоны, планшеты, аксессуары',
          monthlyVolume: '1m_5m',
          experience: '1_3_years',
          website: 'https://teststore.uz',
          status: 'pending',
          documents: {},
          comments: [],
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log('✅ Заявка продавца создана');

    // Создаем продукт
    const products = db.collection('products');
    console.log('📱 Создаю продукт...');

    await products.updateOne(
      { name: 'iPhone 15 Pro' },
      {
        $set: {
          name: 'iPhone 15 Pro',
          price: 1500000,
          originalPrice: 1600000,
          description: 'Новый iPhone 15 Pro с чипом A17 Pro, 128GB памяти',
          brand: 'Apple',
          model: 'iPhone 15 Pro',
          category: 'electronics',
          images: ['https://example.com/iphone15.jpg'],
          isActive: true,
          inStock: true,
          stock: 10,
          isNew: true,
          featured: true,
          status: 'active',
          material: 'titanium',
          weight: 187,
          dimensions: '146.6 x 70.6 x 8.25 mm',
          warranty: 12,
          specifications: {
            processor: 'A17 Pro',
            ram: '8GB',
            storage: '128GB',
            camera: '48MP',
            battery: '3274 mAh'
          },
          seo: {
            metaTitle: 'iPhone 15 Pro - Купить в Ташкенте',
            metaDescription: 'Купить iPhone 15 Pro по лучшей цене в Ташкенте',
            keywords: ['iPhone 15 Pro', 'Apple', 'смартфон', 'купить']
          },
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log('✅ Продукт создан');

    console.log('\n🎉 Все готово для тестирования админ-панели!');
    console.log('📧 Логин: admin@market.com');
    console.log('🔑 Пароль: admin123456');
    console.log('🌐 Админ-панель: http://localhost:3000');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await client.close();
    console.log('✅ Отключено от MongoDB');
  }
}

fixAdminPanel();




