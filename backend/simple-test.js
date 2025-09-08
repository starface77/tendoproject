const { connectDB } = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const simpleTest = async () => {
  try {
    console.log('🔄 Подключение к базе данных...');
    await connectDB();
    
    const email = 'admin@chexol.uz';
    const password = 'admin123456';
    
    console.log(`🔍 Ищем пользователя с email: ${email}`);
    
    // Найти пользователя
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ Пользователь не найден');
      return;
    }
    
    console.log(`✅ Пользователь найден:`);
    console.log(`   ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Роль: ${user.role}`);
    console.log(`   Имя: ${user.firstName} ${user.lastName}`);
    console.log(`   Активен: ${user.isActive}`);
    console.log(`   Пароль: ${user.password}`);
    
    // Простая проверка пароля с bcrypt
    console.log(`🔐 Проверяем пароль с bcrypt...`);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`   Пароль совпадает: ${isMatch}`);
    
    // Проверить роль
    const hasAdminRole = ['admin', 'super_admin', 'moderator'].includes(user.role);
    console.log(`   Имеет админ роль: ${hasAdminRole}`);
    
    if (isMatch && hasAdminRole && user.isActive) {
      console.log('✅ Все проверки пройдены - админ может войти');
    } else {
      console.log('❌ Есть проблемы с админ доступом');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
};

simpleTest();

