const bcrypt = require('bcryptjs');

const testSimplePassword = async () => {
  try {
    const password = 'admin123456';
    
    console.log(`🔐 Тестируем пароль: ${password}`);
    
    // Хешируем пароль
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log(`✅ Пароль захеширован:`);
    console.log(`   Хеш: ${hashedPassword}`);
    
    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log(`   Проверка: ${isMatch}`);
    
    // Проверяем неправильный пароль
    const wrongPassword = 'wrongpassword';
    const isWrongMatch = await bcrypt.compare(wrongPassword, hashedPassword);
    console.log(`   Неправильный пароль: ${isWrongMatch}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
};

testSimplePassword();

