const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testAdminFunctions() {
  try {
    console.log('🔄 Подключение к MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/tendo-market');
    console.log('✅ Подключено к MongoDB');

    // Создаем админа если не существует
    let admin = await User.findOne({ email: 'admin@market.com' });

    if (!admin) {
      console.log('👑 Создаю админа...');
      const hashedPassword = await bcrypt.hash('admin123456', 12);

      admin = await User.create({
        email: 'admin@market.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Market',
        phone: '+998901234567',
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });
      console.log('✅ Админ создан');
    } else {
      console.log('✅ Админ уже существует');
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      'super_secret_jwt_key_for_demo_development_only_change_in_production_2025',
      { expiresIn: '7d' }
    );

    console.log('🔑 JWT токен создан');
    console.log('📧 Email: admin@market.com');
    console.log('🔐 Password: admin123456');
    console.log('🎫 Token:', token.substring(0, 50) + '...');

    // Создаем тестовую категорию если не существует
    const Category = require('./models/Category');
    let category = await Category.findOne({ slug: 'electronics' });

    if (!category) {
      console.log('📂 Создаю тестовую категорию...');
      category = await Category.create({
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
        createdBy: admin._id
      });
      console.log('✅ Категория создана');
    } else {
      console.log('✅ Категория уже существует');
    }

    console.log('📋 Категория ID:', category._id);

    await mongoose.disconnect();
    console.log('✅ Отключено от MongoDB');

    return { admin, token, category };

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    await mongoose.disconnect();
  }
}

testAdminFunctions();




