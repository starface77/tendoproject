const http = require('http');

async function testAPI() {
  console.log('🔍 Тестирую API endpoints...\n');

  // Тест 1: Проверка доступности сервера
  console.log('1️⃣ Проверка доступности сервера...');
  try {
    const response = await makeRequest('GET', '/health');
    console.log('✅ Сервер доступен');
  } catch (error) {
    console.log('❌ Сервер недоступен:', error.message);
    return;
  }

  // Тест 2: Получение категорий
  console.log('\n2️⃣ Тестирую получение категорий...');
  try {
    const response = await makeRequest('GET', '/api/v1/categories');
    console.log('✅ Категории получены');
    console.log('📊 Количество категорий:', JSON.parse(response).count || 'неизвестно');
  } catch (error) {
    console.log('❌ Ошибка получения категорий:', error.message);
  }

  // Тест 3: Получение продуктов
  console.log('\n3️⃣ Тестирую получение продуктов...');
  try {
    const response = await makeRequest('GET', '/api/v1/products');
    console.log('✅ Продукты получены');
    console.log('📊 Количество продуктов:', JSON.parse(response).count || 'неизвестно');
  } catch (error) {
    console.log('❌ Ошибка получения продуктов:', error.message);
  }

  // Тест 4: Получение заявок продавцов
  console.log('\n4️⃣ Тестирую получение заявок продавцов...');
  try {
    const response = await makeRequest('GET', '/api/v1/seller-applications');
    console.log('✅ Заявки получены');
    console.log('📊 Количество заявок:', JSON.parse(response).count || 'неизвестно');
  } catch (error) {
    console.log('❌ Ошибка получения заявок:', error.message);
  }

  console.log('\n🎯 Тестирование завершено');
}

function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

testAPI();




