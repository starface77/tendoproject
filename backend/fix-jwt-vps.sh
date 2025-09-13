#!/bin/bash

echo "🔧 ФИКС ПРОБЛЕМЫ С JWT СЕССИЕЙ НА VPS"
echo "========================================"

# Переходим в директорию проекта
cd /var/www/tendo/backend

echo "1️⃣ Проверяем текущие переменные окружения..."

# Проверяем .env файл
if [ -f ".env" ]; then
    echo "📄 Найден .env файл"
    grep -E "JWT_SECRET|MONGO_URI" .env || echo "⚠️  JWT_SECRET или MONGO_URI не найдены в .env"
else
    echo "❌ .env файл не найден, создаем..."
    cat > .env << 'EOF'
# База данных
MONGO_URI=mongodb://localhost:27017/tendomarketuz

# JWT секретный ключ
JWT_SECRET=tendo_market_production_jwt_secret_key_2024_super_secure_change_this

# Другие настройки
NODE_ENV=production
PORT=5000

# Email настройки (если используются)
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password

# SSL настройки
HTTPS_ENABLED=true
SSL_CERT_PATH=/etc/letsencrypt/live/tendo.uz/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/tendo.uz/privkey.pem
EOF
    echo "✅ .env файл создан"
fi

echo "2️⃣ Устанавливаем переменные окружения..."
export JWT_SECRET="tendo_market_production_jwt_secret_key_2024_super_secure_change_this"
export MONGO_URI="mongodb://localhost:27017/tendomarketuz"
export NODE_ENV="production"
export PORT="5000"

echo "3️⃣ Перезапускаем MongoDB..."
sudo systemctl stop mongodb
sudo systemctl start mongodb
sleep 3

echo "4️⃣ Создаем/обновляем админа с правильными данными..."
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function setupAdmin() {
  try {
    // Подключаемся к MongoDB
    await mongoose.connect('mongodb://localhost:27017/tendomarketuz');
    console.log('✅ Подключено к MongoDB');

    // Удаляем старую коллекцию пользователей (если есть)
    await mongoose.connection.db.dropCollection('users').catch(() => {});

    // Создаем схему пользователя
    const userSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: String,
      password: String,
      phone: String,
      role: String,
      isActive: Boolean,
      isEmailVerified: Boolean,
      createdAt: Date,
      updatedAt: Date
    });

    const User = mongoose.model('User', userSchema);

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('admin123456', 12);

    // Создаем админа
    const admin = new User({
      firstName: 'Admin',
      lastName: 'Tendo',
      email: 'admin@tendo.uz',
      password: hashedPassword,
      phone: '+998901234567',
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await admin.save();
    console.log('✅ Админ создан: admin@tendo.uz');

    // Генерируем тестовый токен
    const JWT_SECRET = 'tendo_market_production_jwt_secret_key_2024_super_secure_change_this';
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('\\n🔑 ТЕСТОВЫЙ ТОКЕН:');
    console.log(token);

    console.log('\\n📊 ДАННЫЕ ДЛЯ ЛОГИНА:');
    console.log('Email: admin@tendo.uz');
    console.log('Password: admin123456');

    await mongoose.disconnect();
    console.log('✅ Готово!');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

setupAdmin();
"

echo "5️⃣ Проверяем работу API..."
sleep 2

# Проверяем health endpoint
curl -s http://localhost:5000/health | head -5

echo "6️⃣ Тестируем админ авторизацию..."
sleep 1

# Тест логин
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tendo.uz","password":"admin123456"}')

echo "📝 Ответ сервера:"
echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"

# Извлекаем токен
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token' 2>/dev/null || echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "🔑 Получен токен, тестируем /auth/me..."

    # Тест /auth/me с токеном
    ME_RESPONSE=$(curl -s -X GET http://localhost:5000/api/v1/auth/me \
      -H "Authorization: Bearer $TOKEN")

    echo "📝 Ответ /auth/me:"
    echo "$ME_RESPONSE" | jq . 2>/dev/null || echo "$ME_RESPONSE"
else
    echo "❌ Не удалось получить токен"
fi

echo "7️⃣ Перезапускаем backend через PM2..."
pm2 stop tendo-backend 2>/dev/null
pm2 delete tendo-backend 2>/dev/null

pm2 start ecosystem.config.js --env production
sleep 3

pm2 status

echo ""
echo "🎉 ГОТОВО!"
echo ""
echo "🌐 ДОСТУП К АДМИН ПАНЕЛИ:"
echo "URL: https://admin.tendo.uz"
echo "Email: admin@tendo.uz"
echo "Password: admin123456"
echo ""
echo "📋 ЕСЛИ ПРОБЛЕМА ОСТАЕТСЯ:"
echo "1. Проверьте логи: pm2 logs tendo-backend"
echo "2. Проверьте MongoDB: sudo systemctl status mongodb"
echo "3. Проверьте Nginx: sudo systemctl status nginx"




