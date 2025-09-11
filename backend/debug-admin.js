const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function debugAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tendomarketuz');
    const User = require('./models/User');

    console.log('🔍 Ищем админа с email: tendo@admin.uz');
    const user = await User.findOne({email: 'tendo@admin.uz'}).select('+password');

    if (!user) {
      console.log('❌ Админ не найден!');
      return;
    }

    console.log('✅ Админ найден:');
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   isActive:', user.isActive);
    console.log('   Password exists:', !!user.password);
    console.log('   Password length:', user.password ? user.password.length : 0);
    console.log('   Password starts with $:', user.password ? user.password.startsWith('$2') : false);

    // Тестируем проверку пароля
    console.log('\n🔐 Тестируем проверку пароля...');
    const isMatch = await user.checkPassword('admin123456');
    console.log('   Password check result:', isMatch);

    // Также проверим bcrypt напрямую
    const directCheck = await bcrypt.compare('admin123456', user.password);
    console.log('   Direct bcrypt check:', directCheck);

    // Попробуем другие возможные пароли
    console.log('\n🔍 Пробуем другие пароли...');
    const testPasswords = ['admin123456', 'admin123', 'admin', '123456', 'password'];
    for (const testPass of testPasswords) {
      const result = await bcrypt.compare(testPass, user.password);
      console.log(`   "${testPass}": ${result}`);
    }

    // Покажем первые 20 символов хеша для отладки
    console.log('\n🔑 Первые 20 символов хеша пароля:', user.password.substring(0, 20) + '...');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    process.exit(0);
  }
}

debugAdmin();
