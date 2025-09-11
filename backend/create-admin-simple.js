const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdminSimple() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tendomarketuz');

    // Создаем схему напрямую
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
      firstName: String,
      lastName: String,
      phone: String,
      role: String,
      isActive: Boolean,
      isEmailVerified: Boolean
    });

    const User = mongoose.model('User', userSchema);

    // Проверяем существующего админа
    let admin = await User.findOne({ email: 'admin@market.com' });

    if (!admin) {
      console.log('Создаю админа...');
      const hashedPassword = await bcrypt.hash('admin123456', 12);

      admin = new User({
        email: 'admin@market.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Market',
        phone: '+998901234567',
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });

      await admin.save();
      console.log('✅ Админ создан');
    } else {
      console.log('✅ Админ уже существует');
    }

    console.log('📧 Email: admin@market.com');
    console.log('🔑 Password: admin123456');

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

createAdminSimple();




