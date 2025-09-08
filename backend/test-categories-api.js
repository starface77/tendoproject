const mongoose = require('mongoose');
const Category = require('./models/Category');

async function testCategoriesAPI() {
  try {
    console.log('🔍 Тестируем API получения категорий...\n');

    await mongoose.connect('mongodb://localhost:27017/tendo');
    console.log('✅ Подключено к MongoDB');

    // Проверяем все категории
    const allCategories = await Category.find({});
    console.log(`📊 Всего категорий в БД: ${allCategories.length}`);

    // Проверяем активные категории
    const activeCategories = await Category.find({ isActive: true });
    console.log(`✅ Активных категорий: ${activeCategories.length}`);

    // Проверяем запрос как в API
    const apiQuery = { isActive: true };
    const apiCategories = await Category.find(apiQuery)
      .populate('parent', 'name slug')
      .sort({ order: 1, 'name.ru': 1 })
      .select('-createdBy -updatedBy -__v');

    console.log(`🌐 API запрос вернет: ${apiCategories.length} категорий`);

    console.log('\n📋 Список категорий из API:');
    apiCategories.forEach((cat, i) => {
      console.log(`${i+1}. ${cat.name?.ru || 'Без имени'} (ID: ${cat._id}, Slug: ${cat.slug})`);
    });

    // Проверяем каждую категорию детально
    console.log('\n🔎 Детальная информация о категориях:');
    for (const cat of apiCategories) {
      console.log(`\n--- Категория: ${cat.name?.ru} ---`);
      console.log(`ID: ${cat._id}`);
      console.log(`Slug: ${cat.slug}`);
      console.log(`Active: ${cat.isActive}`);
      console.log(`Visible: ${cat.isVisible}`);
      console.log(`Level: ${cat.level}`);
      console.log(`Path: ${cat.path}`);
      console.log(`Order: ${cat.sortOrder}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Тест завершен');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error(error.stack);
  }
}

testCategoriesAPI();




