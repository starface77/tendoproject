const bcrypt = require('bcryptjs');

const testPasswordHash = async () => {
  try {
    const password = 'admin123456';
    console.log(`Оригинальный пароль: ${password}`);

    // Хешируем пароль
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(`Хешированный пароль: ${hashedPassword}`);

    // Проверяем пароль
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log(`Проверка пароля: ${isValid}`);

    // Проверяем с неправильным паролем
    const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword);
    console.log(`Проверка неправильного пароля: ${isInvalid}`);

  } catch (error) {
    console.error('Ошибка:', error);
  }
};

testPasswordHash();
