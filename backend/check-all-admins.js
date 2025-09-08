const { connectDB } = require('./config/database');
const User = require('./models/User');

const checkAllAdmins = async () => {
  try {
    console.log('🔄 Подключение к базе данных...');
    await connectDB();
    
    // Ищем всех пользователей с админ ролями
    const admins = await User.find({ 
      role: { $in: ['admin', 'super_admin', 'moderator'] } 
    }).select('+password');
    
    console.log(`👑 Найдено админов: ${admins.length}`);
    
    admins.forEach((admin, index) => {
      console.log(`\n👤 Админ ${index + 1}:`);
      console.log(`   ID: ${admin._id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Роль: ${admin.role}`);
      console.log(`   Имя: ${admin.firstName} ${admin.lastName}`);
      console.log(`   Активен: ${admin.isActive}`);
      console.log(`   Пароль присутствует: ${!!admin.password}`);
      console.log(`   Пароль: ${admin.password}`);
    });
    
    // Также проверим всех пользователей
    const allUsers = await User.find({});
    console.log(`\n📊 Всего пользователей: ${allUsers.length}`);
    
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
};

checkAllAdmins();

