const mongoose = require('mongoose');

// Простая схема категории для теста
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
  isActive: { type: Boolean, default: true },
  isVisible: { type: Boolean, default: true },
  level: { type: Number, default: 0 },
  path: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', categorySchema);

async function createCategoryDirect() {
  try {
    console.log('🔄 Подключаюсь к MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/chexoluz');
    console.log('✅ Подключено');

    // Проверяем существующую категорию
    const existing = await Category.findOne({ slug: 'electronics' });
    if (existing) {
      console.log('✅ Категория уже существует:', existing.name.ru);
      console.log('📋 ID:', existing._id);
      await mongoose.disconnect();
      return existing;
    }

    // Создаем категорию
    console.log('📂 Создаю категорию...');
    const category = new Category({
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
      path: '/electronics'
    });

    await category.save();
    console.log('✅ Категория создана');
    console.log('📋 ID:', category._id);
    console.log('🔗 Slug:', category.slug);

    await mongoose.disconnect();
    return category;

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    await mongoose.disconnect();
  }
}

createCategoryDirect();




