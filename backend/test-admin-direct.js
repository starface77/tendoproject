const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Подключаемся к MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/chexoluz', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB подключена');
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

const testAdminLogin = async () => {
  try {
    await connectDB();

    console.log('🔍 Ищем админа в базе данных...');

    // Ищем всех пользователей с ролью admin
    const admins = await User.find({ role: 'admin' }).select('+password');

    console.log(`Найдено ${admins.length} админов:`);

    for (const admin of admins) {
      console.log(`- Email: ${admin.email}`);
      console.log(`  ID: ${admin._id}`);
      console.log(`  Роль: ${admin.role}`);
      console.log(`  Активен: ${admin.isActive}`);
      console.log(`  Пароль присутствует: ${!!admin.password}`);

      // Проверяем разные пароли
      const passwordsToTest = ['admin123456', 'admin123', 'password123', '123456'];

      for (const testPassword of passwordsToTest) {
        const isPasswordValid = await admin.checkPassword(testPassword);
        console.log(`  Пароль '${testPassword}' корректен: ${isPasswordValid}`);

        if (isPasswordValid) {
          console.log(`✅ Найден рабочий админ: ${admin.email}`);
          console.log(`   Войдите с email: ${admin.email}, password: ${testPassword}`);
          break;
        }
      }
    }

    if (admins.length === 0) {
      console.log('❌ Админов в базе нет. Создадим нового...');

      const hashedPassword = await bcrypt.hash('admin123456', 12);
      const newAdmin = new User({
        email: 'admin@tendo.uz',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Tendo',
        phone: '+998901234568',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        permissions: ['read:products', 'write:products', 'read:orders', 'write:orders', 'read:users', 'write:users']
      });

      await newAdmin.save();
      console.log('✅ Создан новый админ:');
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Password: admin123456`);
    }

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

testAdminLogin();
