const { connectDB } = require('./config/database');
const mongoose = require('mongoose');

// Простая схема категории
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
});

const Category = mongoose.model('Category', categorySchema);

async function createQuickCategories() {
  try {
    await connectDB();
    console.log('🔄 Создаем категории...');
    
    await Category.deleteMany({}); // Очищаем старые
    
    const categories = [
      { name: 'iPhone', slug: 'iphone', order: 1 },
      { name: 'Samsung', slug: 'samsung', order: 2 },
      { name: 'Xiaomi', slug: 'xiaomi', order: 3 },
      { name: 'Аксессуары', slug: 'accessories', order: 4 }
    ];
    
    for (const cat of categories) {
      const category = new Category(cat);
      await category.save();
      console.log(`✅ ${cat.name} создана`);
    }
    
    console.log('🎉 Категории готовы!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

createQuickCategories();



