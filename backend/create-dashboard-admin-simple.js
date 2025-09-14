const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createDashboardAdmin() {
  try {
    console.log('🔄 Подключение к MongoDB...');
    
    // Прямое подключение к базе данных (используем ту же БД что и backend)
    await mongoose.connect('mongodb://localhost:27017/chexoluz', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Подключено к MongoDB');

    // Определяем схему пользователя
    const userSchema = new mongoose.Schema({
      email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
      },
      password: { 
        type: String, 
        required: true,
        select: false
      },
      firstName: { 
        type: String, 
        required: true,
        trim: true
      },
      lastName: { 
        type: String, 
        required: true,
        trim: true
      },
      phone: String,
      role: {
        type: String,
        enum: ['user', 'seller', 'admin', 'super_admin', 'moderator', 'courier'],
        default: 'user'
      },
      isActive: { 
        type: Boolean, 
        default: true 
      },
      isVerified: { 
        type: Boolean, 
        default: false 
      },
      permissions: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      createdAt: { 
        type: Date, 
        default: Date.now 
      },
      updatedAt: { 
        type: Date, 
        default: Date.now 
      }
    });

    // Метод для проверки пароля
    userSchema.methods.checkPassword = async function(candidatePassword) {
      if (!this.password) return false;
      try {
        return await bcrypt.compare(candidatePassword, this.password);
      } catch (error) {
        console.error('Password check error:', error);
        return false;
      }
    };

    // Создаем модель
    const User = mongoose.model('User', userSchema);

    // Проверяем существующего админа
    const existingAdmin = await User.findOne({ email: 'admin@tendo.uz' });
    
    if (existingAdmin) {
      console.log('✅ Админ уже существует:');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👑 Роль: ${existingAdmin.role}`);
      console.log(`🔒 Активен: ${existingAdmin.isActive}`);
      
      // Обновляем пароль принудительно
      console.log('🔄 Обновляем пароль...');
      const hashedPassword = await bcrypt.hash('admin123456', 12);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      existingAdmin.isVerified = true;
      
      await existingAdmin.save();
      console.log('✅ Пароль и данные обновлены');
      
      return;
    }

    // Создаем нового админа
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