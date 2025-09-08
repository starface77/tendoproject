/**
 * 📱 ТЕСТ ПОДКЛЮЧЕНИЯ МОБИЛЬНОГО ПРИЛОЖЕНИЯ
 * Проверяем что мобильное приложение может подключиться к API
 */

const http = require('http');

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Тестируем URL которые использует мобильное приложение
const mobileURLs = [
  'http://localhost:5000/api/v1',           // Локальная разработка
  'http://10.0.2.2:5000/api/v1',           // Android эмулятор
  'http://127.0.0.1:5000/api/v1'           // iOS симулятор
];

// Функция для тестирования URL
function testMobileURL(url, name) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Тестируем ${name}:`);
    console.log(`URL: ${url}`);
    
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: '/health',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          console.log(`✅ УСПЕХ (${res.statusCode}):`);
          console.log('Ответ:', JSON.stringify(parsedData, null, 2));
          resolve({ success: true, url, status: res.statusCode, data: parsedData });
        } catch (error) {
          console.log(`✅ УСПЕХ (${res.statusCode}):`);
          console.log('Ответ (текст):', responseData);
          resolve({ success: true, url, status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ОШИБКА:`);
      console.log('Сообщение:', error.message);
      resolve({ success: false, url, error: error.message });
    });
    
    req.setTimeout(5000, () => {
      console.log(`❌ ТАЙМАУТ:`);
      console.log('URL недоступен в течение 5 секунд');
      req.destroy();
      resolve({ success: false, url, error: 'Timeout' });
    });
    
    req.end();
  });
}

// Основная функция тестирования
async function testMobileConnection() {
  console.log('🚀 ТЕСТ ПОДКЛЮЧЕНИЯ МОБИЛЬНОГО ПРИЛОЖЕНИЯ');
  console.log('=============================================');
  
  const results = [];
  
  // Тестируем все URL которые использует мобильное приложение
  for (const url of mobileURLs) {
    const name = url.includes('10.0.2.2') ? 'Android Emulator' : 
                 url.includes('127.0.0.1') ? 'iOS Simulator' : 'Local Development';
    results.push(await testMobileURL(url, name));
  }
  
  // Подсчет результатов
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('\n📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:');
  console.log('=====================================');
  console.log(`✅ Успешных: ${successful}`);
  console.log(`❌ Ошибок: ${failed}`);
  console.log(`📈 Процент успеха: ${Math.round((successful / results.length) * 100)}%`);
  
  if (successful > 0) {
    console.log('\n🎉 МОБИЛЬНОЕ ПРИЛОЖЕНИЕ МОЖЕТ ПОДКЛЮЧИТЬСЯ!');
    console.log('📱 API готов к использованию мобильным приложением');
    
    // Показываем рабочие URL
    const workingURLs = results.filter(r => r.success);
    console.log('\n🔗 РАБОЧИЕ URL ДЛЯ МОБИЛЬНОГО ПРИЛОЖЕНИЯ:');
    workingURLs.forEach(result => {
      console.log(`✅ ${result.url}`);
    });
  } else {
    console.log('\n🔧 ПРОБЛЕМЫ С ПОДКЛЮЧЕНИЕМ:');
    console.log('1. Убедитесь что сервер запущен на порту 5000');
    console.log('2. Проверьте CORS настройки');
    console.log('3. Проверьте firewall/антивирус');
    console.log('4. Для Android эмулятора используйте 10.0.2.2');
    console.log('5. Для iOS симулятора используйте 127.0.0.1');
  }
  
  return results;
}

// Запуск тестов
testMobileConnection()
  .then(() => {
    console.log('\n🎉 Тестирование подключения завершено!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Критическая ошибка:', error);
    process.exit(1);
  });


