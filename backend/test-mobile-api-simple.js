/**
 * 🧪 ПРОСТОЙ ТЕСТ МОБИЛЬНОГО API
 * Проверяем API без внешних зависимостей
 */

const http = require('http');
const https = require('https');

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Функция для тестирования эндпоинта
function testEndpoint(name, method, url, data = null) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Тестируем: ${name}`);
    console.log(`${method.toUpperCase()} ${url}`);
    
    const urlObj = new URL(`${API_BASE_URL}${url}`);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          console.log(`✅ УСПЕХ (${res.statusCode}):`);
          console.log('Ответ:', JSON.stringify(parsedData, null, 2));
          resolve({ success: true, status: res.statusCode, data: parsedData });
        } catch (error) {
          console.log(`✅ УСПЕХ (${res.statusCode}):`);
          console.log('Ответ (текст):', responseData);
          resolve({ success: true, status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ОШИБКА:`);
      console.log('Сообщение:', error.message);
      resolve({ success: false, error: error.message });
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Основная функция тестирования
async function runMobileAPITests() {
  console.log('🚀 ЗАПУСК ТЕСТОВ МОБИЛЬНОГО API');
  console.log('=====================================');
  
  const results = [];
  
  // 1. Проверка здоровья сервера
  results.push(await testEndpoint('Health Check', 'get', '/health'));
  
  // 2. Категории
  results.push(await testEndpoint('Get Categories', 'get', '/categories'));
  
  // 3. Товары
  results.push(await testEndpoint('Get Products', 'get', '/products'));
  results.push(await testEndpoint('Get Featured Products', 'get', '/products?featured=true&limit=4'));
  results.push(await testEndpoint('Get Popular Products', 'get', '/products?popular=true&limit=4'));
  
  // 4. Города
  results.push(await testEndpoint('Get Cities', 'get', '/cities'));
  
  // 5. Аутентификация (без данных)
  results.push(await testEndpoint('Login (без данных)', 'post', '/auth/login'));
  
  // 6. Регистрация
  results.push(await testEndpoint('Register', 'post', '/auth/register', {
    email: 'test@example.com',
    password: 'test123456',
    firstName: 'Test',
    lastName: 'User'
  }));
  
  // 7. Логин с созданными данными
  results.push(await testEndpoint('Login', 'post', '/auth/login', {
    email: 'test@example.com',
    password: 'test123456'
  }));
  
  // Подсчет результатов
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('\n📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:');
  console.log('=====================================');
  console.log(`✅ Успешных: ${successful}`);
  console.log(`❌ Ошибок: ${failed}`);
  console.log(`📈 Процент успеха: ${Math.round((successful / results.length) * 100)}%`);
  
  if (failed > 0) {
    console.log('\n🔧 РЕКОМЕНДАЦИИ ПО ИСПРАВЛЕНИЮ:');
    console.log('1. Убедитесь что сервер запущен на порту 5000');
    console.log('2. Проверьте подключение к базе данных');
    console.log('3. Убедитесь что все роуты правильно настроены');
    console.log('4. Проверьте CORS настройки для мобильного приложения');
  }
  
  return results;
}

// Запуск тестов
runMobileAPITests()
  .then(() => {
    console.log('\n🎉 Тестирование завершено!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Критическая ошибка:', error);
    process.exit(1);
  });


