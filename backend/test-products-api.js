// Используем встроенный fetch (Node.js 18+)

const testProductsApi = async () => {
  try {
    console.log('🔍 Тестируем API товаров...');

    // Проверяем доступность API
    console.log('1. Проверяем здоровье API...');
    const healthResponse = await fetch('http://localhost:5000/api/v1/health');
    const healthData = await healthResponse.json();
    console.log('   Статус API:', healthData.success ? '✅' : '❌');

    if (!healthData.success) {
      console.log('❌ API недоступен');
      return;
    }

    // Получаем товары
    console.log('\n2. Получаем товары...');
    const productsResponse = await fetch('http://localhost:5000/api/v1/products');
    const productsData = await productsResponse.json();

    console.log('   Статус ответа:', productsResponse.status);
    console.log('   Успешно:', productsData.success);
    console.log('   Количество товаров:', productsData.count || 0);

    if (productsData.success && productsData.data && productsData.data.length > 0) {
      console.log('\n📋 Первые 3 товара:');
      productsData.data.slice(0, 3).forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name?.ru || product.name || 'Без названия'}`);
        console.log(`   ID: ${product._id}`);
        console.log(`   Статус: ${product.status}`);
        console.log(`   Активен: ${product.isActive}`);
        console.log(`   Цена: ${product.price}`);
        console.log(`   Категория: ${product.category?.name?.ru || 'Без категории'}`);
      });
    } else {
      console.log('⚠️ Товаров не найдено или ошибка в ответе');

      if (productsData.error) {
        console.log('   Ошибка:', productsData.error);
      }
    }

    // Проверяем товары без фильтров
    console.log('\n3. Проверяем товары без фильтров статуса...');
    const allProductsResponse = await fetch('http://localhost:5000/api/v1/products?limit=50');
    const allProductsData = await allProductsResponse.json();

    console.log('   Всего товаров в БД:', allProductsData.total || 0);

    if (allProductsData.data && allProductsData.data.length > 0) {
      console.log('\n📋 Все товары с их статусами:');
      allProductsData.data.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name?.ru || product.name || 'Без названия'} - Статус: ${product.status}, Активен: ${product.isActive}`);
      });
    }

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
  }
};

testProductsApi();
