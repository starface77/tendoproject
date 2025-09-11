const mongoose = require('mongoose');

// Простая схема продукта для теста
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  brand: String,
  model: String,
  images: [String],
  isActive: { type: Boolean, default: true },
  inStock: { type: Boolean, default: true },
  stock: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

async function createTestProduct() {
  try {
    console.log('🔄 Подключаюсь к MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/tendomarketuz');
    console.log('✅ Подключено');

    // Проверяем существующий продукт
    const existing = await Product.findOne({ name: 'Test iPhone 15' });
    if (existing) {
      console.log('✅ Тестовый продукт уже существует');
      console.log('📋 ID:', existing._id);
      console.log('📦 Название:', existing.name);
      console.log('💰 Цена:', existing.price);
      await mongoose.disconnect();
      return existing;
    }

    // Создаем тестовый продукт
    console.log('📱 Создаю тестовый продукт...');
    const product = new Product({
      name: 'Test iPhone 15',
      price: 1500000,
      description: 'Тестовый iPhone 15 для демонстрации',
      brand: 'Apple',
      model: 'iPhone 15',
      images: ['https://example.com/iphone15.jpg'],
      isActive: true,
      inStock: true,
      stock: 5
    });

    await product.save();
    console.log('✅ Тестовый продукт создан');
    console.log('📋 ID:', product._id);
    console.log('📦 Название:', product.name);
    console.log('💰 Цена:', product.price);
    console.log('📦 В наличии:', product.stock, 'шт.');

    await mongoose.disconnect();
    console.log('✅ Отключено от MongoDB');

    return product;

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    await mongoose.disconnect();
  }
}

createTestProduct();




