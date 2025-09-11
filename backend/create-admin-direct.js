const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdminDirect() {
  try {
    console.log('🔄 Подключаемся к MongoDB...');

    // Простое подключение без лишних опций
    await mongoose.connect('mongodb://localhost:27017/tendomarketuz');

    console.log('✅ Подключено к MongoDB');

    // Определяем схему пользователя напрямую
    const userSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      firstName: { type: String, default: 'Admin' },
      lastName: { type: String, default: 'User' },
      phone: { type: String, default: '+998901234567' },
      role: { type: String, default: 'user' },
      isActive: { type: Boolean, default: true },
      isEmailVerified: { type: Boolean, default: true },
      permissions: { type: [String], default: [] },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    // Метод для проверки пароля
    userSchema.methods.checkPassword = async function(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    };

    // Создаем модель
    const User = mongoose.model('User', userSchema);

    // Проверяем существующего админа
    const existingAdmin = await User.findOne({ email: 'admin@market.com' });
    if (existingAdmin) {
      console.log('❌ Админ уже существует:', existingAdmin.email);
      return;
    }

    // Создаем нового админа
    console.log('🔐 Создаем пароль...');
    const hashedPassword = await bcrypt.hash('admin123456', 12);

    console.log('👑 Создаем админа...');
    const admin = new User({
      email: 'admin@market.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Market',
      phone: '+998901234567',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      permissions: [
        'read:products', 'write:products', 'read:orders', 'write:orders',
        'read:users', 'write:users', 'read:analytics', 'manage:site'
      ]
    });

    await admin.save();

    console.log('✅ Админ создан успешно!');
    console.log('📧 Email: admin@market.com');
    console.log('🔐 Password: admin123456');
    console.log('🎯 Роль: admin');

    // Тестируем созданного админа
    console.log('\n🔍 Тестируем вход...');
    const testAdmin = await User.findOne({ email: 'admin@market.com' });
    if (testAdmin) {
      const passwordValid = await testAdmin.checkPassword('admin123456');
      console.log('✅ Пароль работает:', passwordValid);
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Отключено от MongoDB');
    process.exit(0);
  }
}

createAdminDirect();




