const { connectDB } = require('./config/database');
const User = require('./models/User');

async function fixAdmin() {
  try {
    await connectDB();
    console.log('🔄 Поиск админа...');
    
    // Ищем любого админа
    let admin = await User.findOne({ 
      role: { $in: ['admin', 'super_admin', 'moderator'] } 
    });
    
    if (!admin) {
      console.log('🔄 Создаем нового админа...');
      // Создаем нового если нет
      admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@chexoluz.com',
        password: 'admin123456',
        phone: '+998901234568', // Другой номер чтобы избежать дублирования
        role: 'super_admin',
        isActive: true,
        isEmailVerified: true
      });
      await admin.save();
      console.log('✅ Админ создан!');
    } else {
      console.log('🔄 Обновляем пароль админа...');
      // Обновляем пароль существующего
      admin.password = 'admin123456';
      await admin.save();
      console.log('✅ Пароль обновлен!');
    }
    
    console.log('');
    console.log('🎉 ==========================================');
    console.log('✅ АДМИН ГОТОВ К ВХОДУ!');
    console.log('🎉 ==========================================');
    console.log(`📧 Email: ${admin.email}`);
    console.log('🔐 Пароль: admin123456');
    console.log('🎉 ==========================================');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

fixAdmin();



