const { connectDB } = require('./config/database');
const Category = require('./models/Category');

async function createCategories() {
  try {
    await connectDB();
    console.log('🔄 Проверяем категории...');
    
    const existingCategories = await Category.find();
    
    if (existingCategories.length > 0) {
      console.log('✅ Категории уже существуют:');
      existingCategories.forEach(cat => {
        console.log(`- ${cat.name?.ru || cat.name} (${cat._id})`);
      });
      process.exit(0);
    }
    
    console.log('🔄 Создаем тестовые категории...');
    
    const categories = [
      {
        name: {
          ru: 'Чехлы для iPhone',
          uz: 'iPhone uchun g\'iloflar',
          en: 'iPhone Cases'
        },
        slug: 'iphone-cases',
        description: {
          ru: 'Защитные чехлы для всех моделей iPhone',
          uz: 'Barcha iPhone modellari uchun himoya g\'iloflari',
          en: 'Protective cases for all iPhone models'
        },
        isActive: true,
        isFeatured: true,
        order: 1
      },
      {
        name: {
          ru: 'Чехлы для Samsung',
          uz: 'Samsung uchun g\'iloflar',
          en: 'Samsung Cases'
        },
        slug: 'samsung-cases',
        description: {
          ru: 'Защитные чехлы для всех моделей Samsung',
          uz: 'Barcha Samsung modellari uchun himoya g\'iloflari',
          en: 'Protective cases for all Samsung models'
        },
        isActive: true,
        isFeatured: true,
        order: 2
      },
      {
        name: {
          ru: 'Чехлы для Xiaomi',
          uz: 'Xiaomi uchun g\'iloflar',
          en: 'Xiaomi Cases'
        },
        slug: 'xiaomi-cases',
        description: {
          ru: 'Защитные чехлы для всех моделей Xiaomi',
          uz: 'Barcha Xiaomi modellari uchun himoya g\'iloflari',
          en: 'Protective cases for all Xiaomi models'
        },
        isActive: true,
        isFeatured: false,
        order: 3
      },
      {
        name: {
          ru: 'Аксессуары',
          uz: 'Aksessuarlar',
          en: 'Accessories'
        },
        slug: 'accessories',
        description: {
          ru: 'Различные аксессуары для телефонов',
          uz: 'Telefonlar uchun turli aksessuarlar',
          en: 'Various accessories for phones'
        },
        isActive: true,
        isFeatured: false,
        order: 4
      }
    ];
    
    for (const categoryData of categories) {
      const category = new Category(categoryData);
      await category.save();
      console.log(`✅ Создана категория: ${categoryData.name.ru}`);
    }
    
    console.log('');
    console.log('🎉 ==========================================');
    console.log('✅ КАТЕГОРИИ СОЗДАНЫ!');
    console.log('🎉 ==========================================');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

createCategories();



