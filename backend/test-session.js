const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/v1';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YmQ2YzEwM2UyNTk0NmEyYWM2MDk0YiIsImVtYWlsIjoiYWRtaW5AdGVuZG8udXoiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTczMzY5NTMsImV4cCI6MTc1Nzk0MTc1M30.6q6dF5e8q6dF5e8q6dF5e8q6dF5e8q6dF5e8q6dF5e8';

async function testSession() {
  console.log('🧪 Тестирование сессии админа...');

  try {
    // Тест 1: Проверка /auth/me с токеном
    console.log('\n1️⃣ Тест: /auth/me с токеном');
    const response = await axios.get(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    if (response.data.success) {
      console.log('✅ Успешно! Пользователь:', response.data.data.email);
      console.log('👤 Роль:', response.data.data.role);
    } else {
      console.log('❌ Ошибка:', response.data.error);
    }

    // Тест 2: Проверка без токена
    console.log('\n2️⃣ Тест: /auth/me без токена');
    try {
      await axios.get(`${API_BASE}/auth/me`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Корректно! 401 ошибка без токена');
      } else {
        console.log('❌ Неправильная ошибка:', error.response?.status);
      }
    }

    // Тест 3: Проверка с неправильным токеном
    console.log('\n3️⃣ Тест: /auth/me с неправильным токеном');
    try {
      await axios.get(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': 'Bearer invalid_token'
        }
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Корректно! 401 ошибка с неправильным токеном');
      } else {
        console.log('❌ Неправильная ошибка:', error.response?.status);
      }
    }

    console.log('\n🎉 Все тесты завершены!');

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
  }
}

testSession();
