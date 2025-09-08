const { connectDB } = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const resetAdmin = async () => {
  try {
    console.log('🔄 Подключение к базе данных...');
    await connectDB();

    console.log('🗑️ Удаляем всех существующих админов...');

    // Удаляем всех админов
    const deleteResult = await User.deleteMany({ role: 'admin' });
    console.log(`✅ Удалено ${deleteResult.deletedCount} админов`);

    console.log('👑 Создаем нового админа...');

    const email = 'admin@tendo.uz';
    const password = 'admin123456';

    // Хешируем пароль
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Создаем нового админа
    const newAdmin = new User({
      email,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Tendo',
      phone: '+998901234568',
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

    console.log('✅ Админ создан успешно!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Пароль: ${password}`);
    console.log(`🆔 ID: ${newAdmin._id}`);

    // Проверяем, что пароль работает
    console.log('🔍 Проверяем пароль...');
    const isPasswordValid = await newAdmin.checkPassword(password);
    console.log(`Пароль корректен: ${isPasswordValid}`);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    process.exit(0);
  }
};

resetAdmin();
