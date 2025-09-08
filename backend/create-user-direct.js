const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createUserDirect() {
  const client = new MongoClient('mongodb://localhost:27017');

  try {
    await client.connect();
    console.log('✅ Подключено к MongoDB');

    const db = client.db('chexoluz');
    const users = db.collection('users');

    // Проверяем существующего админа
    const existingAdmin = await users.findOne({ email: 'admin@market.com' });

    if (!existingAdmin) {
      console.log('👑 Создаю админа...');

      const hashedPassword = await bcrypt.hash('admin123456', 12);

      const admin = {
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
      };

      await users.insertOne(admin);
      console.log('✅ Админ создан');
    } else {
      console.log('✅ Админ уже существует');
    }

    // Создаем категорию
    const categories = db.collection('categories');
    const existingCategory = await categories.findOne({ slug: 'electronics' });

    if (!existingCategory) {
      console.log('📂 Создаю категорию...');

      const category = {
        name: {
          ru: 'Электроника',
          uz: 'Elektronika',
          en: 'Electronics'
        },
        slug: 'electronics',
        description: {
          ru: 'Электроника и гаджеты',
          uz: 'Elektronika va gadjetlar',
          en: 'Electronics and gadgets'
        },
        icon: '📱',
        isActive: true,
        isVisible: true,
        level: 0,
        path: '/electronics',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await categories.insertOne(category);
      console.log('✅ Категория создана');
    } else {
      console.log('✅ Категория уже существует');
    }

    console.log('🎯 Готово! Теперь попробуйте войти в админ-панель:');
    console.log('📧 Email: admin@market.com');
    console.log('🔑 Password: admin123456');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await client.close();
    console.log('✅ Отключено от MongoDB');
  }
}

createUserDirect();




