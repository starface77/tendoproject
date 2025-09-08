const { connectDB } = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const resetAdminPassword = async () => {
  try {
    console.log('🔄 Подключение к базе данных...');
    await connectDB();
    
    const admin = await User.findOne({ 
      role: { $in: ['admin', 'super_admin', 'moderator'] } 
    });
    
    if (!admin) {
      console.log('❌ Админ не найден в базе данных');
      process.exit(1);
    }
    
    // Новый пароль
    const newPassword = 'admin123456';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Обновляем пароль и исправляем permissions
    admin.password = hashedPassword;
    admin.permissions = [
      'read:products',
      'write:products', 
      'read:orders',
      'write:orders',
      'read:users',
      'write:users',
      'read:analytics',
      'manage:site'
    ];
    admin.isActive = true;
    admin.isEmailVerified = true;
    
    await admin.save();
    
    console.log('');
    console.log('🟡 ==========================================');
    console.log('🎉    ПАРОЛЬ АДМИНА СБРОШЕН!');
    console.log('🟡 ==========================================');
    console.log(`📧 Email:     ${admin.email}`);
    console.log(`🔐 Новый пароль:    ${newPassword}`);
    console.log(`🌍 Админка:   http://localhost:5001`);
    console.log('🟡 ==========================================');
    console.log('');
    console.log('⚠️  ВАЖНО: Обязательно смените пароль после входа!');
    console.log('');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Ошибка сброса пароля:', error.message);
    process.exit(1);
  }
};

resetAdminPassword();
