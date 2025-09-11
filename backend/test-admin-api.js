#!/usr/bin/env node

/**
 * 🧪 TEST ADMIN API FUNCTIONALITY
 * Тестируем создание категорий, баннеров и товаров через админ API
 */

const axios = require('axios');

const API_BASE = 'https://api.tendo.uz/api/v1';

// Тестовые данные админа
const ADMIN_CREDENTIALS = {
  email: 'admin@tendo.uz',
  password: 'Admin123!'
};

let adminToken = '';

// Авторизация админа
async function loginAdmin() {
  try {
    console.log('🔐 Авторизация админа...');
    const response = await axios.post(`${API_BASE}/auth/login`, ADMIN_CREDENTIALS);
    
    if (response.data.success && response.data.token) {
      adminToken = response.data.token;
      console.log('✅ Админ авторизован');
      return true;
    } else {
      console.error('❌ Ошибка авторизации:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка авторизации:', error.response?.data || error.message);
    return false;
  }
}

// Тест создания категории
async function testCreateCategory() {
  try {
    console.log('\n🗂️ Тестирование создания категории...');
    
    const categoryData = {
      name: {
        ru: 'Тестовая категория',
        uz: 'Test kategoriyasi',
        en: 'Test Category'
      },
      description: {
        ru: 'Описание тестовой категории',
        uz: 'Test kategoriyasi tavsifi',
        en: 'Test category description'
      },
      isActive: true,
      order: 1
    };

    const response = await axios.post(`${API_BASE}/admin/categories`, categoryData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Категория создана:', response.data.data._id);
      return response.data.data._id;
    } else {
      console.error('❌ Ошибка создания категории:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Ошибка создания категории:', error.response?.data || error.message);
    return null;
  }
}

// Тест создания баннера
async function testCreateBanner() {
  try {
    console.log('\n🎨 Тестирование создания баннера...');
    
    const bannerData = {
      title: 'Тестовый баннер',
      subtitle: 'Описание тестового баннера',
      imageUrl: 'https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Test+Banner',
      targetUrl: '/test-category',
      isActive: true,
      order: 1,
      bgColor: '#3B82F6'
    };

    const response = await axios.post(`${API_BASE}/banners`, bannerData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Баннер создан:', response.data.data._id);
      return response.data.data._id;
    } else {
      console.error('❌ Ошибка создания баннера:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Ошибка создания баннера:', error.response?.data || error.message);
    return null;
  }
}

// Тест создания товара
async function testCreateProduct(categoryId) {
  try {
    console.log('\n📦 Тестирование создания товара...');
    
    const productData = {
      name: {
        ru: 'Тестовый товар',
        uz: 'Test mahsuloti',
        en: 'Test Product'
      },
      description: {
        ru: 'Описание тестового товара',
        uz: 'Test mahsuloti tavsifi',
        en: 'Test product description'
      },
      price: 99999,
      originalPrice: 149999,
      category: categoryId,
      brand: 'TestBrand',
      model: 'TestModel',
      material: 'fabric',
      images: [
        'https://via.placeholder.com/400x400/3B82F6/FFFFFF?text=Product+1',
        'https://via.placeholder.com/400x400/10B981/FFFFFF?text=Product+2'
      ],
      isActive: true,
      inStock: true,
      isNew: true,
      featured: true,
      stock: 100
    };

    const response = await axios.post(`${API_BASE}/admin/products`, productData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Товар создан:', response.data.data._id);
      return response.data.data._id;
    } else {
      console.error('❌ Ошибка создания товара:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Ошибка создания товара:', error.response?.data || error.message);
    return null;
  }
}

// Основная функция тестирования
async function runTests() {
  console.log('🧪 ТЕСТИРОВАНИЕ АДМИН API');
  console.log('========================');

  // Авторизация
  const loginSuccess = await loginAdmin();
  if (!loginSuccess) {
    console.error('❌ Не удалось авторизоваться. Тестирование прервано.');
    return;
  }

  // Тестирование создания категории
  const categoryId = await testCreateCategory();
  
  // Тестирование создания баннера
  const bannerId = await testCreateBanner();
  
  // Тестирование создания товара
  const productId = categoryId ? await testCreateProduct(categoryId) : null;

  // Итоги
  console.log('\n📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:');
  console.log('============================');
  console.log(`✅ Авторизация: ${loginSuccess ? 'УСПЕШНО' : 'ОШИБКА'}`);
  console.log(`✅ Создание категории: ${categoryId ? 'УСПЕШНО' : 'ОШИБКА'}`);
  console.log(`✅ Создание баннера: ${bannerId ? 'УСПЕШНО' : 'ОШИБКА'}`);
  console.log(`✅ Создание товара: ${productId ? 'УСПЕШНО' : 'ОШИБКА'}`);

  if (categoryId && bannerId && productId) {
    console.log('\n🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!');
    console.log('Админ панель работает корректно.');
  } else {
    console.log('\n❌ НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОШЛИ');
    console.log('Проверьте логи backend для подробностей.');
  }
}

// Запуск тестирования
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };