const { connectDB } = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const testNewAdmin = async () => {
  try {
    console.log('🔄 Подключение к базе данных...');
    await connectDB();
    
    const email = 'admin@tendo.uz';
    const password = 'admin123456';
    
    console.log(`🔍 Ищем нового админа с email: ${email}`);
    
    // Найти админа
    const admin = await User.findOne({ email }).select('+password');
    
    if (!admin) {
      console.log('❌ Админ не найден');
      return;
    }
    
    console.log(`✅ Админ найден:`);
    console.log(`   ID: ${admin._id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Роль: ${admin.role}`);
    console.log(`   Имя: ${admin.firstName} ${admin.lastName}`);
    console.log(`   Активен: ${admin.isActive}`);
    console.log(`   Пароль: ${admin.password}`);
    
    // Проверяем пароль
    console.log(`🔐 Проверяем пароль...`);
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log(`   Пароль совпадает: ${isMatch}`);
    
    // Проверить роль
    const hasAdminRole = ['admin', 'super_admin', 'moderator'].includes(admin.role);
    console.log(`   Имеет админ роль: ${hasAdminRole}`);
    
    if (isMatch && hasAdminRole && admin.isActive) {
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

testNewAdmin();

