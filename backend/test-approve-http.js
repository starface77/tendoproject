const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const http = require('http');

async function testApproveHTTP() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tendo-market');
    console.log('✅ Подключено к MongoDB');

    // Найдем админа
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ Админ не найден');
      return;
    }

    // Найдем заявку
    const SellerApplication = require('./models/SellerApplication');
    const application = await SellerApplication.findOne({ status: 'pending' });
    if (!application) {
      console.log('❌ Заявка со статусом pending не найдена');
      return;
    }

    console.log('📋 Найдена заявка:', application._id);
    console.log('📊 Статус:', application.status);

    // Создадим JWT токен
    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
        email: admin.email,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo_development_only_change_in_production_2025',
      { expiresIn: '7d' }
    );

    console.log('🔑 Токен создан');

    // Отправим HTTP запрос
    const postData = JSON.stringify({
      comments: 'Заявка одобрена через API тест'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1/seller-applications/${application._id}/approve`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('📡 Отправка запроса:', options.path);

    const req = http.request(options, (res) => {
      console.log('📥 Статус ответа:', res.statusCode);
      console.log('📥 Заголовки:', res.headers);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('📥 Тело ответа:', data);

        if (res.statusCode === 200) {
          console.log('✅ API работает!');
        } else {
          console.log('❌ API не работает. Код:', res.statusCode);
        }

        mongoose.disconnect();
      });
    });

    req.on('error', (e) => {
      console.error('❌ Ошибка запроса:', e.message);
      mongoose.disconnect();
    });

    req.write(postData);
    req.end();

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    mongoose.disconnect();
  }
}

testApproveHTTP();
