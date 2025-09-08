/**
 * 📱 СОЗДАНИЕ ДАННЫХ ДЛЯ МОБИЛЬНОГО ПРИЛОЖЕНИЯ
 * Добавляем featured товары и города
 */

const { connectDB } = require('./config/database');
const Product = require('./models/Product');
const City = require('./models/City');

const createMobileData = async () => {
  try {
    console.log('🔄 Подключение к базе данных...');
    await connectDB();

    // 1. Создаем города
    console.log('\n🏙️ Создание городов...');
    const cities = [
      { 
        name: { ru: 'Ташкент', uz: 'Toshkent', en: 'Tashkent' },
        slug: 'tashkent', 
        code: 'tashkent',
        region: { ru: 'Ташкентская область', uz: 'Toshkent viloyati', en: 'Tashkent Region' },
        coordinates: { latitude: 41.2995, longitude: 69.2401 },
        isActive: true, 
        order: 1 
      },
      { 
        name: { ru: 'Самарканд', uz: 'Samarqand', en: 'Samarkand' },
        slug: 'samarkand', 
        code: 'samarkand',
        region: { ru: 'Самаркандская область', uz: 'Samarqand viloyati', en: 'Samarkand Region' },
        coordinates: { latitude: 39.6270, longitude: 66.9749 },
        isActive: true, 
        order: 2 
      },
      { 
        name: { ru: 'Бухара', uz: 'Buxoro', en: 'Bukhara' },
        slug: 'bukhara', 
        code: 'bukhara',
        region: { ru: 'Бухарская область', uz: 'Buxoro viloyati', en: 'Bukhara Region' },
        coordinates: { latitude: 39.7684, longitude: 64.4556 },
        isActive: true, 
        order: 3 
      },
      { 
        name: { ru: 'Андижан', uz: 'Andijon', en: 'Andijan' },
        slug: 'andijan', 
        code: 'andijan',
        region: { ru: 'Андижанская область', uz: 'Andijon viloyati', en: 'Andijan Region' },
        coordinates: { latitude: 40.7833, longitude: 72.3500 },
        isActive: true, 
        order: 4 
      },
      { 
        name: { ru: 'Фергана', uz: 'Farg\'ona', en: 'Fergana' },
        slug: 'fergana', 
        code: 'fergana',
        region: { ru: 'Ферганская область', uz: 'Farg\'ona viloyati', en: 'Fergana Region' },
        coordinates: { latitude: 40.3864, longitude: 71.7864 },
        isActive: true, 
        order: 5 
      },
      { 
        name: { ru: 'Наманган', uz: 'Namangan', en: 'Namangan' },
        slug: 'namangan', 
        code: 'namangan',
        region: { ru: 'Наманганская область', uz: 'Namangan viloyati', en: 'Namangan Region' },
        coordinates: { latitude: 41.0000, longitude: 71.6667 },
        isActive: true, 
        order: 6 
      },
      { 
        name: { ru: 'Карши', uz: 'Qarshi', en: 'Karshi' },
        slug: 'karshi', 
        code: 'karshi',
        region: { ru: 'Кашкадарьинская область', uz: 'Qashqadaryo viloyati', en: 'Kashkadarya Region' },
        coordinates: { latitude: 38.8606, longitude: 65.7891 },
        isActive: true, 
        order: 7 
      },
      { 
        name: { ru: 'Нукус', uz: 'Nukus', en: 'Nukus' },
        slug: 'nukus', 
        code: 'nukus',
        region: { ru: 'Республика Каракалпакстан', uz: 'Qoraqalpog\'iston Respublikasi', en: 'Republic of Karakalpakstan' },
        coordinates: { latitude: 42.4531, longitude: 59.6103 },
        isActive: true, 
        order: 8 
      }
    ];

    for (const cityData of cities) {
      const existingCity = await City.findOne({ slug: cityData.slug });
      if (!existingCity) {
        const city = new City(cityData);
        await city.save();
        console.log(`✅ Город "${cityData.name}" создан.`);
      } else {
        console.log(`⚠️ Город "${cityData.name}" уже существует.`);
      }
    }

    // 2. Создаем featured товары
    console.log('\n⭐ Создание featured товаров...');
    const featuredProducts = [
      {
        name: 'iPhone 15 Pro Max Чехол',
        description: 'Премиум чехол для iPhone 15 Pro Max с защитой от ударов',
        price: 150000,
        category: '68a00b5e385636dc74409c74', // iPhone
        brand: 'Chexol',
        model: 'iPhone 15 Pro Max',
        material: 'silicone',
        isFeatured: true,
        isNew: true,
        stock: 50
      },
      {
        name: 'Samsung Galaxy S24 Ultra Защита',
        description: 'Стильный чехол для Samsung Galaxy S24 Ultra',
        price: 120000,
        category: '68a00b5e385636dc74409c76', // Samsung
        brand: 'Chexol',
        model: 'Galaxy S24 Ultra',
        material: 'silicone',
        isFeatured: true,
        isNew: true,
        stock: 30
      },
      {
        name: 'Xiaomi 14 Pro Чехол',
        description: 'Защитный чехол для Xiaomi 14 Pro',
        price: 80000,
        category: '68a00b5e385636dc74409c78', // Xiaomi
        brand: 'Chexol',
        model: 'Xiaomi 14 Pro',
        material: 'silicone',
        isFeatured: true,
        isNew: true,
        stock: 25
      },
      {
        name: 'AirPods Pro Защитный чехол',
        description: 'Стильный чехол для AirPods Pro',
        price: 45000,
        category: '68a00b5e385636dc74409c7a', // Аксессуары
        brand: 'Chexol',
        model: 'AirPods Pro',
        material: 'silicone',
        isFeatured: true,
        isNew: true,
        stock: 100
      }
    ];

    for (const productData of featuredProducts) {
      const existingProduct = await Product.findOne({ 
        name: productData.name,
        brand: productData.brand 
      });
      
      if (!existingProduct) {
        const product = new Product({
          ...productData,
          createdBy: '689f3c93ec3814e6acce7c0b' // ID админа
        });
        await product.save();
        console.log(`✅ Featured товар "${productData.name}" создан.`);
      } else {
        // Обновляем существующий товар как featured
        existingProduct.isFeatured = true;
        existingProduct.isNew = true;
        await existingProduct.save();
        console.log(`✅ Товар "${productData.name}" обновлен как featured.`);
      }
    }

    // 3. Показываем статистику
    console.log('\n📊 Статистика данных...');
    const Category = require('./models/Category');
    const categories = await Category.find();
    
    for (const category of categories) {
      const productCount = await Product.countDocuments({ 
        category: category._id,
        isActive: true 
      });
      console.log(`✅ Категория "${category.name}": ${productCount} товаров`);
    }

    console.log('\n🎉 Создание данных для мобильного приложения завершено!');
    console.log('📱 Теперь мобильное приложение должно получать данные из API');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Ошибка создания данных:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  createMobileData();
}

module.exports = createMobileData;
