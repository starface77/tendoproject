const http = require('http');

async function testSimpleHTTP() {
  console.log('🧪 Простое тестирование HTTP...\n');

  // Шаг 1: Проверяем статус сервера
  console.log('1️⃣ Проверка статуса сервера...');
  try {
    const healthResponse = await makeRequest('GET', '/health');
    console.log('✅ Сервер работает');
    console.log('📊 Ответ:', healthResponse.substring(0, 100) + '...');
  } catch (error) {
    console.error('❌ Сервер не работает:', error.message);
    return;
  }

  // Шаг 2: Тестируем вход без данных в БД
  console.log('\n2️⃣ Тестирование входа...');
  try {
    const loginData = JSON.stringify({
      email: 'admin@market.com',
      password: 'admin123456'
    });

    const loginResponse = await makeRequest('POST', '/api/v1/auth/admin/login', loginData, {
      'Content-Type': 'application/json'
    });

    console.log('📄 Ответ входа:', loginResponse);
  } catch (error) {
    console.error('❌ Ошибка входа:', error.message);
  }

  console.log('\n🎯 Тестирование завершено!');
}

function makeRequest(method, path, data = '', headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        ...headers
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        resolve(body);
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

testSimpleHTTP();




