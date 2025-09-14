const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function testDashboardLogin() {
  try {
    console.log('🔄 Подключение к MongoDB...');
    
    // Прямое подключение к базе данных
    await mongoose.connect('mongodb://localhost:27017/tendo-market', {
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
    const admin = await User.findOne({ email: 'admin@tendo.uz' }).select('+password');
    
    if (!admin) {
      console.log('❌ Админ не найден');
      return;
    }

    console.log('✅ Админ найден:');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👑 Роль: ${admin.role}`);
    console.log(`🔒 Активен: ${admin.isActive}`);
    console.log(`🔐 Пароль хеш: ${admin.password ? admin.password.substring(0, 20) + '...' : 'NONE'}`);
    
    // Тестируем пароль
    console.log('\n🔐 Тестируем вход с паролем "admin123456"...');
    const isPasswordValid = await admin.checkPassword('admin123456');
    console.log(`✅ Пароль корректен: ${isPasswordValid}`);
    
    if (isPasswordValid) {
      console.log('\n🎉 ==========================================');
      console.log('✅ ВХОД В ДАШБОРД ДОСТУПЕН!');
      console.log('🎉 ==========================================');
      console.log(`📧 Email: ${admin.email}`);
      console.log('🔐 Пароль: admin123456');
      console.log('🎉 ==========================================');
      console.log('Вы можете войти в админ панель по адресу:');
      console.log('http://localhost:3001');
    } else {
      console.log('\n❌ Пароль неверный. Попробуйте другой пароль.');
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error(' Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Отключено от MongoDB');
    process.exit(0);
  }
}

testDashboardLogin();