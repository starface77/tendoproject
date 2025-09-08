const mongoose = require('mongoose');
const Category = require('./models/Category');

// Имитируем работу контроллера getCategories
async function debugController() {
  try {
    console.log('🔍 Отладка контроллера getCategories...\n');

    await mongoose.connect('mongodb://localhost:27017/tendo');
    console.log('✅ Подключено к MongoDB');

    // Проверяем все категории
    const allCategories = await Category.find({});
    console.log(`📊 Всего категорий в БД: ${allCategories.length}`);

    // Проверяем активные категории
    const activeCategories = await Category.find({ isActive: true });
    console.log(`✅ Активных категорий: ${activeCategories.length}`);

    // Имитируем запрос контроллера
    const query = { isActive: true };
    console.log('🔍 Запрос:', JSON.stringify(query, null, 2));

    const categories = await Category.find(query)
      .populate('parent', 'name slug')
      .sort({ sortOrder: 1, 'name.ru': 1 }) // Исправлено: sortOrder вместо order
      .select('-createdBy -updatedBy -__v');

    console.log(`🌐 Результат запроса: ${categories.length} категорий`);

    console.log('\n📋 Список найденных категорий:');
    categories.forEach((cat, i) => {
      console.log(`${i+1}. ${cat.name?.ru || cat.name} (ID: ${cat._id}, sortOrder: ${cat.sortOrder})`);
    });

    // Проверяем поле sortOrder
    console.log('\n🔎 Проверяем поле sortOrder:');
    for (const cat of categories) {
      console.log(`${cat.name?.ru}: sortOrder = ${cat.sortOrder}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Отладка завершена');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error(error.stack);
  }
}

debugController();




