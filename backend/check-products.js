const { connectDB } = require('./config/database');
const Product = require('./models/Product');
const Category = require('./models/Category');
const User = require('./models/User');

const checkProducts = async () => {
  try {
    console.log('🔄 Подключение к базе данных...');
    await connectDB();

    console.log('🔍 Получаем все товары...');
    const products = await Product.find({})
      .populate('category', 'name')
      .populate('createdBy', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`📊 Найдено товаров: ${products.length}`);

    if (products.length === 0) {
      console.log('⚠️  Товаров в базе нет');

      // Создаем тестовый товар для проверки
      console.log('🔧 Создаем тестовый товар...');

      const testProduct = new Product({
        name: {
          ru: 'Тестовый товар',
          uz: 'Test mahsulot',
          en: 'Test Product'
        },
        description: {
          ru: 'Это тестовый товар для проверки',
          uz: 'Bu test mahsulot tekshirish uchun',
          en: 'This is a test product for checking'
        },
        price: 100000,
        originalPrice: 120000,
        category: null, // Без категории для начала
        images: [
          { url: 'https://via.placeholder.com/400x400?text=Test+Product', isPrimary: true }
        ],
        brand: 'Test Brand',
        model: 'Test Model',
        material: 'plastic',
        specifications: [
          {
            name: { ru: 'Тип', uz: 'Turi', en: 'Type' },
            value: { ru: 'Тест', uz: 'Test', en: 'Test' },
            order: 1
          }
        ],
        stock: 10,
        isActive: true,
        isFeatured: true, // Автоматически делаем featured для показа на главной
        createdBy: null
      });

      await testProduct.save();
      console.log('✅ Тестовый товар создан!');
      console.log(`   ID: ${testProduct._id}`);
      console.log(`   Название: ${testProduct.name.ru}`);
      console.log(`   Цена: ${testProduct.price}`);
      console.log(`   Активен: ${testProduct.isActive}`);

      return;
    }

    console.log('\n📋 Список товаров:');
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name?.ru || product.name || 'Без названия'}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Цена: ${product.price} сум`);
      console.log(`   Категория: ${product.category?.name?.ru || 'Без категории'}`);
      console.log(`   Активен: ${product.isActive}`);
      console.log(`   Создан: ${product.createdAt}`);
      console.log(`   Автор: ${product.createdBy?.email || 'Не указан'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
};

checkProducts();
