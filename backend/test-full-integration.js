const http = require('http');

/**
 * 🧪 ПОЛНЫЙ ТЕСТ ИНТЕГРАЦИИ ПРОЕКТА
 * Тестируем все компоненты системы
 */

console.log('🚀 Начинаем полный тест интеграции...\n');

// Тестовые функции
async function testEndpoint(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            data: body ? JSON.parse(body) : null,
            headers: res.headers
          };
          resolve(response);
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  const tests = [
    {
      name: 'Тест контактной формы',
      test: async () => {
        const response = await testEndpoint('http://localhost:5000/api/v1/contacts', 'POST', {
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test Message',
          message: 'This is a test message for integration testing'
        });
        return response.status === 201 && response.data.success;
      }
    },
    {
      name: 'Тест получения контактов (без авторизации)',
      test: async () => {
        const response = await testEndpoint('http://localhost:5000/api/v1/contacts');
        return response.status === 401; // Должен требовать авторизацию
      }
    },
    {
      name: 'Тест главной страницы админ-панели',
      test: async () => {
        const response = await testEndpoint('http://localhost:3001');
        return response.status === 200;
      }
    },
    {
      name: 'Тест главной страницы сайта',
      test: async () => {
        const response = await testEndpoint('http://localhost:5173');
        return response.status === 200;
      }
    },
    {
      name: 'Тест API здоровья системы',
      test: async () => {
        const response = await testEndpoint('http://localhost:5000/api/v1/admin/health');
        return response.status === 401; // Должен требовать авторизацию
      }
    }
  ];

  console.log('📋 Выполняем тесты:\n');

  let passed = 0;
  let failed = 0;

  for (const testCase of tests) {
    try {
      console.log(`⏳ ${testCase.name}...`);
      const result = await testCase.test();

      if (result) {
        console.log(`✅ ${testCase.name} - ПРОШЕЛ`);
        passed++;
      } else {
        console.log(`❌ ${testCase.name} - НЕ ПРОШЕЛ`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${testCase.name} - ОШИБКА: ${error.message}`);
      failed++;
    }
    console.log('');
  }

  console.log('📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:');
  console.log(`✅ Пройдено: ${passed}`);
  console.log(`❌ Провалено: ${failed}`);
  console.log(`📈 Всего тестов: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ! ПРОЕКТ ГОТОВ К ИСПОЛЬЗОВАНИЮ!');
  } else {
    console.log('\n⚠️  НЕКОТОРЫЕ ТЕСТЫ ПРОВАЛЕНЫ. ТРЕБУЕТСЯ ДОРАБОТКА.');
  }

  console.log('\n🔧 РУЧНЫЕ ТЕСТЫ:');
  console.log('1. Откройте http://localhost:5173 и протестируйте контактную форму');
  console.log('2. Откройте http://localhost:3001 и войдите в админ-панель');
  console.log('3. В админ-панели проверьте раздел "Messages"');
  console.log('4. Попробуйте ответить на сообщение');
  console.log('5. Проверьте dashboard - должны отображаться реальные данные');
}

// Запуск тестов
runTests().catch(console.error);




