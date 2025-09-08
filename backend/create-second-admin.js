const { connectDB } = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const createSecondAdmin = async () => {
  try {
    console.log('🔄 Подключение к базе данных...');
    await connectDB();

    const email = 'admin2@tendo.uz';
    const password = 'admin123456';

    console.log(`🔍 Проверяем, существует ли админ с email: ${email}`);

    // Проверяем, существует ли уже админ
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log(`❌ Админ с email ${email} уже существует`);
      console.log(`   ID: ${existingAdmin._id}`);
      console.log(`   Роль: ${existingAdmin.role}`);
      return;
    }

    // Хешируем пароль
    console.log(`🔐 Хешируем пароль...`);
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Создаем нового админа
    console.log(`👑 Создаем второго админа...`);
    const newAdmin = new User({
      email,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Second',
      phone: '+998901234569',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      permissions: [
        'read:products',
        'write:products',
        'read:orders',
        'write:orders',
        'read:users',
        'write:users',
        'read:analytics',
        'manage:site'
      ]
    });

    await newAdmin.save();

    console.log(`✅ Второй админ создан!`);
    console.log(`   ID: ${newAdmin._id}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Пароль: ${password}`);
    console.log(`   Роль: ${newAdmin.role}`);

    // Проверяем пароль
    console.log(`🔍 Проверяем пароль...`);
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log(`   Пароль работает: ${isMatch ? '✅' : '❌'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
};

createSecondAdmin();




