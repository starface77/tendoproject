/**
 * 🧪 ТЕСТ МОБИЛЬНОГО API
 * Проверяем все эндпоинты которые использует мобильное приложение
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Тестовые данные
const testData = {
  user: {
    email: 'test@example.com',
    password: 'test123456',
    firstName: 'Test',
    lastName: 'User'
  },
  product: {
    name: 'Test Product',
    price: 1000,
    description: 'Test description'
  }
};

// Функция для тестирования эндпоинта
async function testEndpoint(name, method, url, data = null, headers = {}) {
  try {
    console.log(`\n🧪 Тестируем: ${name}`);
    console.log(`${method.toUpperCase()} ${url}`);
    
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    console.log(`✅ УСПЕХ (${response.status}):`);
    console.log('Ответ:', JSON.stringify(response.data, null, 2));
    
    return { success: true, data: response.data };
    
  } catch (error) {
    console.log(`❌ ОШИБКА:`);
    console.log('Статус:', error.response?.status);
    console.log('Сообщение:', error.response?.data?.message || error.message);
    console.log('Данные:', error.response?.data);
    
    return { success: false, error: error.response?.data || error.message };
  }
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
  
  // 5. Аутентификация (без токена)
  results.push(await testEndpoint('Login (без данных)', 'post', '/auth/login'));
  
  // 6. Регистрация
  results.push(await testEndpoint('Register', 'post', '/auth/register', testData.user));
  
  // 7. Логин с созданными данными
  results.push(await testEndpoint('Login', 'post', '/auth/login', {
    email: testData.user.email,
    password: testData.user.password
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

// Запуск тестов если файл вызван напрямую
if (require.main === module) {
  runMobileAPITests()
    .then(() => {
      console.log('\n🎉 Тестирование завершено!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Критическая ошибка:', error);
      process.exit(1);
    });
}

module.exports = { runMobileAPITests, testEndpoint };


