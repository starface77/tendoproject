/**
 * 🔍 ПРОВЕРКА АДМИНИСТРАТОРОВ В БАЗЕ
 */

const { connectDB } = require('../config/database');
const User = require('../models/User');

const checkAdmins = async () => {
  try {
    console.log('🔄 Подключение к базе данных...');
    await connectDB();
    
    // Находим всех админов
    const admins = await User.find({
      role: { $in: ['admin', 'super_admin', 'moderator'] }
    }).select('email firstName lastName role isActive phone');
    
    if (admins.length === 0) {
      console.log('❌ Нет администраторов в базе данных');
      return;
    }
    
    console.log('\n📋 НАЙДЕНЫ АДМИНИСТРАТОРЫ:');
    console.log('=' .repeat(60));
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. 👤 ${admin.firstName} ${admin.lastName}`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   📱 Phone: ${admin.phone || 'не указан'}`);
      console.log(`   👑 Роль: ${admin.role}`);
      console.log(`   ✅ Активен: ${admin.isActive ? 'Да' : 'Нет'}`);
      console.log('─' .repeat(40));
    });
    
    console.log('\n🔐 Для входа в админ панель используйте:');
    console.log(`📧 Email: ${admins[0].email}`);
    console.log(`🔑 Пароль: admin123456 (если не менялся)`);
    console.log(`🌐 Админка: http://localhost:3001`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
};

checkAdmins();
