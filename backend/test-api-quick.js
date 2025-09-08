const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

// Тест создания заявки продавца
const testCreateApplication = async () => {
  try {
    console.log('📝 Тестируем создание заявки продавца...');
    
    const response = await axios.post(`${BASE_URL}/seller-applications`, {
      businessName: 'Тестовая Компания API',
      email: 'api-test@tendo.uz',
      phone: '+998901234567',
      contactName: 'API Тестер',
      description: 'Тестовая заявка через API',
      categories: ['Электроника', 'Одежда']
    });
    
    console.log('✅ Заявка создана:', response.data);
    return response.data.data.id;
    
  } catch (error) {
    console.error('❌ Ошибка создания заявки:', error.response?.data || error.message);
    return null;
  }
};

// Тест получения заявок (админ)
const testGetApplications = async () => {
  try {
    console.log('\n📋 Тестируем получение заявок (админ)...');
    
    // Используем тестовый админ токен
    const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjU1NTJiMzFmMGU0NjViMDViMGNjNiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NjkwMDU5NSwiZXhwIjoxNzU3NTA1Mzk1fQ.hLQDe2WYpIsdjoBWS_BWKUN59itJN-0biUQBq6QHgto';
    
    const response = await axios.get(`${BASE_URL}/admin/seller-applications`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    console.log(`✅ Получено ${response.data.count} заявок из ${response.data.total}`);
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка получения заявок:', error.response?.data || error.message);
    return false;
  }
};

// Тест статистики заявок
const testGetStats = async () => {
  try {
    console.log('\n📊 Тестируем статистику заявок...');
    
    const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjU1NTJiMzFmMGU0NjViMDViMGNjNiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NjkwMDU5NSwiZXhwIjoxNzU3NTA1Mzk1fQ.hLQDe2WYpIsdjoBWS_BWKUN59itJN-0biUQBq6QHgto';
    
    const response = await axios.get(`${BASE_URL}/admin/seller-applications/stats`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    console.log('✅ Статистика:', response.data.data);
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error.response?.data || error.message);
    return false;
  }
};

// Запуск всех тестов
const runAllTests = async () => {
  console.log('🚀 ПОЛНОЕ ТЕСТИРОВАНИЕ API ЗАЯВОК ПРОДАВЦОВ\n');
  
  const applicationId = await testCreateApplication();
  const gotApplications = await testGetApplications(); 
  const gotStats = await testGetStats();
  
  console.log('\n📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:');
  console.log(`✅ Создание заявки: ${applicationId ? 'УСПЕШНО' : 'ОШИБКА'}`);
  console.log(`✅ Получение заявок: ${gotApplications ? 'УСПЕШНО' : 'ОШИБКА'}`);
  console.log(`✅ Статистика: ${gotStats ? 'УСПЕШНО' : 'ОШИБКА'}`);
  
  if (applicationId && gotApplications && gotStats) {
    console.log('\n🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО! СИСТЕМА ГОТОВА К РАБОТЕ!');
  } else {
    console.log('\n⚠️ Есть ошибки. Проверьте логи выше.');
  }
  
  process.exit(0);
};

runAllTests();

