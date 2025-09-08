const axios = require('axios');

const testAdminAPI = async () => {
  try {
    console.log('🔐 Тестируем админ API...');
    
    const baseURL = 'http://localhost:5000';
    const adminData = {
      email: 'admin@tendo.uz',
      password: 'admin123456'
    };
    
    console.log(`📧 Данные для входа: ${adminData.email}`);
    
    // Тестируем админ логин
    const response = await axios.post(`${baseURL}/api/v1/auth/admin/login`, adminData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Админ логин успешен!');
    console.log(`   Статус: ${response.status}`);
    console.log(`   Токен: ${response.data.token ? 'Есть' : 'Нет'}`);
    console.log(`   Пользователь: ${response.data.user?.email}`);
    
  } catch (error) {
    console.log('❌ Ошибка админ логина:');
    if (error.response) {
      console.log(`   Статус: ${error.response.status}`);
      console.log(`   Ошибка: ${error.response.data?.error || 'Неизвестная ошибка'}`);
      console.log(`   Детали: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`   Ошибка: ${error.message}`);
    }
  }
};

testAdminAPI();

