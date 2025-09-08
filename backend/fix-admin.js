const { connectDB } = require('./config/database');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

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
        email: 'admin@tendo.uz',
        password: 'admin123456',
        phone: '+998901234568',
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
      admin.isActive = true;
      await admin.save();
      console.log('✅ Пароль обновлен!');
    }

    // Генерируем тестовый токен (убеждаемся что роль правильная)
    const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo_development_only_change_in_production_2025';
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('📊 Информация об админе:');
    console.log(`ID: ${admin._id}`);
    console.log(`Роль в БД: ${admin.role}`);
    console.log(`Активен: ${admin.isActive}`);

    console.log('');
    console.log('🎉 ==========================================');
    console.log('✅ АДМИН ГОТОВ К ВХОДУ!');
    console.log('🎉 ==========================================');
    console.log(`📧 Email: ${admin.email}`);
    console.log('🔐 Пароль: admin123456');
    console.log(`🔑 Токен: ${token.substring(0, 50)}...`);
    console.log('🎉 ==========================================');
    console.log('');
    console.log('🧪 ТЕСТИРОВАНИЕ СЕССИИ:');
    console.log('1. Скопируйте токен выше');
    console.log('2. Откройте админ панель в браузере');
    console.log('3. В консоли браузера выполните:');
    console.log(`   localStorage.setItem('admin_token', '${token}');`);
    console.log('4. Перезагрузите страницу - должны остаться в аккаунте');

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

fixAdmin();



