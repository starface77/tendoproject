const axios = require('axios');

async function testContacts() {
  try {
    console.log('🧪 Тестируем API контактов...');

    const response = await axios.post('http://localhost:5000/api/v1/contacts', {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a proper test message with enough characters'
    });

    console.log('✅ Успешный ответ:', response.data);

  } catch (error) {
    console.error('❌ Ошибка:', error.response?.data || error.message);
  }
}

testContacts();




