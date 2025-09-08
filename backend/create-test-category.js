const mongoose = require('mongoose');

// Простая схема категории
const categorySchema = new mongoose.Schema({
  name: {
    ru: String,
    uz: String,
    en: String
  },
  slug: String,
  description: {
    ru: String,
    uz: String,
    en: String
  },
  icon: String,
  createdBy: mongoose.Schema.Types.ObjectId
});

const Category = mongoose.model('Category', categorySchema);

async function createTestCategory() {
  try {
    console.log('🔄 Подключаюсь к MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/chexoluz');
    console.log('✅ Подключено');

    // Проверяем существующую категорию
    let category = await Category.findOne({ slug: 'electronics' });

    if (!category) {
      console.log('📂 Создаю категорию...');
      category = new Category({
        name: {
          ru: 'Электроника',
          uz: 'Elektronika',
          en: 'Electronics'
        },
        slug: 'electronics',
        description: {
          ru: 'Электроника и гаджеты',
          uz: 'Elektronika va gadjetlar',
          en: 'Electronics and gadgets'
        },
        icon: '📱',
        createdBy: null
      });

      await category.save();
      console.log('✅ Категория создана');
    } else {
      console.log('✅ Категория уже существует');
    }

    console.log('📋 ID категории:', category._id);
    console.log('🔗 Slug:', category.slug);

    await mongoose.disconnect();
    console.log('✅ Отключено');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

createTestCategory();




