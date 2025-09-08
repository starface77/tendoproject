const { connectDB } = require('./config/database');
const User = require('./models/User');

const fixAdminRights = async () => {
  try {
    console.log('🔄 Подключение к базе данных...');
    await connectDB();

    const email = 'admin@market.com';

    console.log(`🔍 Ищем пользователя с email: ${email}`);

    // Находим пользователя
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ Пользователь с email ${email} не найден`);
      return;
    }

    console.log(`📋 Текущие данные пользователя:`);
    console.log(`   ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Роль: ${user.role}`);
    console.log(`   Имя: ${user.firstName} ${user.lastName}`);

    // Меняем роль на admin
    console.log(`🔧 Меняем роль на admin...`);
    user.role = 'admin';

    // Добавляем все необходимые права
    user.permissions = [
      'read:products', 'write:products',
      'read:orders', 'write:orders',
      'read:users', 'write:users',
      'read:analytics', 'manage:site'
    ];

    await user.save();

    console.log(`✅ Права восстановлены!`);
    console.log(`   Роль: ${user.role}`);
    console.log(`   Права: ${user.permissions.join(', ')}`);

    // Проверяем, что изменения применились
    const updatedUser = await User.findById(user._id);
    console.log(`🔍 Проверка:`);
    console.log(`   Роль: ${updatedUser.role}`);
    console.log(`   Активен: ${updatedUser.isActive}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
};

fixAdminRights();




