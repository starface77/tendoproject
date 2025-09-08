const { connectDB } = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const createSimpleAdmin = async () => {
  try {
    console.log('🔄 Подключение к базе данных...');
    await connectDB();

    const email = 'admin@market.com';
    const password = 'admin123456';

    console.log('🔍 Проверяем существующего админа...');
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('❌ Админ уже существует');
      console.log('📧 Email:', existing.email);
      console.log('🔐 Пароль: admin123456');
      console.log('💡 Используйте эти данные для входа в админ-панель');
      return;
    }

    console.log('🔐 Хешируем пароль...');
    console.log('   Оригинальный пароль:', password);
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('   Хеш создан, длина:', hashedPassword.length);
    console.log('   Начинается с:', hashedPassword.substring(0, 7) + '...');

    // Тестируем хеш сразу после создания
    const testMatch = await bcrypt.compare(password, hashedPassword);
    console.log('   Тест хеша:', testMatch ? '✅ Успешно' : '❌ Неудачно');

    console.log('👑 Создаем нового админа...');
    const admin = new User({
      email,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Tendo',
      phone: '+998901234567',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      permissions: [
        'read:products', 'write:products', 'read:orders', 'write:orders',
        'read:users', 'write:users', 'read:analytics', 'manage:site'
      ]
    });

    await admin.save();
    console.log('✅ Новый админ создан!');
    console.log('📧 Email: admin@market.com');
    console.log('🔐 Password: admin123456');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

createSimpleAdmin();


