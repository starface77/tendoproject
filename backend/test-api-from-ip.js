const axios = require('axios');

async function testAPI() {
  try {
    console.log('🔍 Тестируем API с IP 26.160.28.208...');

    const response = await axios.post('http://26.160.28.208:5000/api/v1/auth/admin/login', {
      email: 'admin@market.com',
      password: 'admin123456'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://26.160.28.208:3000'
      }
    });

    console.log('✅ Успешный ответ:', {
      success: response.data.success,
      message: response.data.message,
      hasToken: !!response.data.token
    });

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (error.response) {
      console.error('Статус:', error.response.status);
      console.error('Данные:', error.response.data);
    }
  }
}

testAPI();




