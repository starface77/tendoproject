const http = require('http');
const bcrypt = require('bcryptjs');

async function testAllAPIs() {
  console.log('🧪 Тестирование всех API endpoints...\n');

  // Шаг 1: Создаем админа напрямую в базе данных
  console.log('1️⃣ Создание админа...');
  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient('mongodb://localhost:27017');

    await client.connect();
    const db = client.db('chexoluz');
    const users = db.collection('users');

    const hashedPassword = await bcrypt.hash('admin123456', 12);

    await users.updateOne(
      { email: 'admin@market.com' },
      {
        $set: {
          email: 'admin@market.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'Market',
          role: 'admin',
          isActive: true,
          isEmailVerified: true
        }
      },
      { upsert: true }
    );

    console.log('✅ Админ создан');
    await client.close();
  } catch (error) {
    console.error('❌ Ошибка создания админа:', error.message);
    return;
  }

  // Шаг 2: Тестируем вход
  console.log('\n2️⃣ Тестирование входа...');
  let token = '';
  try {
    const loginData = JSON.stringify({
      email: 'admin@market.com',
      password: 'admin123456'
    });

    const loginResponse = await makeRequest('POST', '/api/v1/auth/admin/login', loginData, {
      'Content-Type': 'application/json'
    });

    console.log('📄 Ответ входа:', loginResponse);

    const loginResult = JSON.parse(loginResponse);
    if (loginResult.success && loginResult.token) {
      token = loginResult.token;
      console.log('✅ Вход успешен, токен получен');
    } else {
      console.log('❌ Вход неудачен:', loginResult.error);
      return;
    }
  } catch (error) {
    console.error('❌ Ошибка входа:', error.message);
    return;
  }

  // Шаг 3: Тестируем получение категорий
  console.log('\n3️⃣ Тестирование получения категорий...');
  try {
    const categoriesResponse = await makeRequest('GET', '/api/v1/categories', '', {
      'Authorization': `Bearer ${token}`
    });
    console.log('✅ Категории получены');
  } catch (error) {
    console.error('❌ Ошибка получения категорий:', error.message);
  }

  // Шаг 4: Создаем категорию
  console.log('\n4️⃣ Создание категории...');
  try {
    const categoryData = JSON.stringify({
      name: {
        ru: 'Электроника',
        uz: 'Elektronika',
        en: 'Electronics'
      },
      slug: 'electronics',
      description: {
        ru: 'Электроника и гаджеты',
        uz: 'Elektronika va gadjetlar',
        en: 'Electronics and gadgets'
      },
      icon: '📱'
    });

    const createCategoryResponse = await makeRequest('POST', '/api/v1/categories', categoryData, {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    console.log('✅ Категория создана');
  } catch (error) {
    console.error('❌ Ошибка создания категории:', error.message);
  }

  // Шаг 5: Создаем продукт
  console.log('\n5️⃣ Создание продукта...');
  try {
    const productData = JSON.stringify({
      name: 'Test iPhone 15',
      price: 1500000,
      description: 'Тестовый продукт',
      brand: 'Apple',
      category: 'electronics'
    });

    const createProductResponse = await makeRequest('POST', '/api/v1/products', productData, {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    console.log('✅ Продукт создан');
  } catch (error) {
    console.error('❌ Ошибка создания продукта:', error.message);
  }

  // Шаг 6: Создаем заявку продавца
  console.log('\n6️⃣ Создание заявки продавца...');
  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient('mongodb://localhost:27017');

    await client.connect();
    const db = client.db('chexoluz');
    const applications = db.collection('sellerapplications');

    await applications.updateOne(
      { email: 'seller@test.com' },
      {
        $set: {
          businessName: 'Test Store',
          contactName: 'Иван Иванов',
          email: 'seller@test.com',
          phone: '+998901234567',
          businessType: 'individual',
          address: 'Ташкент',
          status: 'pending'
        }
      },
      { upsert: true }
    );

    console.log('✅ Заявка продавца создана');
    await client.close();
  } catch (error) {
    console.error('❌ Ошибка создания заявки:', error.message);
  }

  // Шаг 7: Тестируем одобрение заявки
  console.log('\n7️⃣ Тестирование одобрения заявки...');
  try {
    const approveData = JSON.stringify({
      comments: 'Заявка одобрена'
    });

    const approveResponse = await makeRequest('PUT', '/api/v1/seller-applications/some-id/approve', approveData, {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    console.log('✅ Заявка одобрена');
  } catch (error) {
    console.error('❌ Ошибка одобрения заявки:', error.message);
  }

  console.log('\n🎉 Тестирование завершено!');
  console.log('📧 Admin: admin@market.com / admin123456');
  console.log('🔑 Token:', token.substring(0, 50) + '...');
}

function makeRequest(method, path, data = '', headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

testAllAPIs();




