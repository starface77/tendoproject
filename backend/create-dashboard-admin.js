const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('./config/database');
const User = require('./models/User');

async function createDashboardAdmin() {
  try {
    console.log('🔄 Подключение к MongoDB...');
    await connectDB();

    // Проверяем существующего админа для дашборда
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'admin@tendo.uz' },
        { email: 'admin@dashboard.tendo.uz' }
      ]
    });
    
    if (existingAdmin) {
      console.log('✅ Админ уже существует:');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👑 Роль: ${existingAdmin.role}`);
      console.log(`🔒 Активен: ${existingAdmin.isActive}`);
      
      // Проверяем пароль
      const isPasswordValid = await existingAdmin.checkPassword('admin123456');
      console.log(`🔐 Пароль 'admin123456' корректен: ${isPasswordValid}`);
      
      if (!isPasswordValid) {
        console.log('🔄 Обновляем пароль...');
        existingAdmin.password = await bcrypt.hash('admin123456', 12);
        await existingAdmin.save();
        console.log('✅ Пароль обновлен');
      }
      
      return;
    }

    // Создаем нового админа для дашборда
    console.log('🔐 Создаем пароль...');
    const hashedPassword = await bcrypt.hash('admin123456', 12);

    console.log('👑 Создаем админа для дашборда...');
    const admin = new User({
      email: 'admin@tendo.uz',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Dashboard',
      phone: '+998901234567',
      role: 'admin',
      isActive: true,
      isVerified: true,
      permissions: {
        canManageUsers: true,
        canManageProducts: true,
        canManageOrders: true,
        canManageSettings: true,
        canViewAnalytics: true,
        canManagePayments: true,
        canManageSellers: true,
        canManageCategories: true,
        canManageReviews: true
      }
    });

    await admin.save();

    console.log('🎉 ==========================================');
    console.log('✅ АДМИН ДЛЯ ДАШБОРДА СОЗДАН УСПЕШНО!');
    console.log('🎉 ==========================================');
    console.log(`📧 Email: ${admin.email}`);
    console.log('🔐 Пароль: admin123456');
    console.log(`👑 Роль: ${admin.role}`);
    console.log('🎉 ==========================================');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error(' Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Отключено от MongoDB');
    process.exit(0);
  }
}

createDashboardAdmin();