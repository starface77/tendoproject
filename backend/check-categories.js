const mongoose = require('mongoose');
const Category = require('./models/Category');

async function checkCategories() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tendo-market');
    console.log('✅ Подключено к MongoDB');

    const categories = await Category.find({}).sort({ createdAt: -1 });
    console.log(`📊 Найдено категорий: ${categories.length}`);

    if (categories.length === 0) {
      console.log('⚠️  Категории не найдены. Создаю базовые категории...');

      // Найдем первого админа для createdBy
      const User = require('./models/User');
      const admin = await User.findOne({ role: 'admin' });
      if (!admin) {
        console.log('❌ Админ не найден. Создайте админа сначала.');
        return;
      }

      const defaultCategories = [
        {
          name: { ru: 'Электроника', uz: 'Elektronika', en: 'Electronics' },
          slug: 'electronics',
          description: { ru: 'Телефоны, компьютеры, гаджеты', uz: 'Telefonlar, kompyuterlar, gadjetlar', en: 'Phones, computers, gadgets' },
          icon: '📱',
          createdBy: admin._id
        },
        {
          name: { ru: 'Одежда', uz: 'Kiyim', en: 'Clothing' },
          slug: 'clothing',
          description: { ru: 'Мужская, женская одежда', uz: 'Erkaklar va ayollar kiyimi', en: 'Men and women clothing' },
          icon: '👕',
          createdBy: admin._id
        },
        {
          name: { ru: 'Обувь', uz: 'Oyoq kiyim', en: 'Shoes' },
          slug: 'shoes',
          description: { ru: 'Кроссовки, ботинки, туфли', uz: 'Krossovkalar, etiklar, tuflar', en: 'Sneakers, boots, shoes' },
          icon: '👟',
          createdBy: admin._id
        },
        {
          name: { ru: 'Дом и сад', uz: 'Uy va bog\'', en: 'Home and Garden' },
          slug: 'home-garden',
          description: { ru: 'Мебель, декор, инструменты', uz: 'Mebel, dekor, asboblar', en: 'Furniture, decor, tools' },
          icon: '🏠',
          createdBy: admin._id
        },
        {
          name: { ru: 'Спорт и отдых', uz: 'Sport va dam olish', en: 'Sports and Recreation' },
          slug: 'sports',
          description: { ru: 'Спорттовары, туризм', uz: 'Sport buyumlari, turizm', en: 'Sports goods, tourism' },
          icon: '⚽',
          createdBy: admin._id
        },
        {
          name: { ru: 'Красота и здоровье', uz: 'Go\'zallik va salomatlik', en: 'Beauty and Health' },
          slug: 'beauty',
          description: { ru: 'Косметика, уход за телом', uz: 'Kosmetika, tana parvarishi', en: 'Cosmetics, body care' },
          icon: '💄',
          createdBy: admin._id
        },
        {
          name: { ru: 'Автотовары', uz: 'Avtotovarlar', en: 'Automotive' },
          slug: 'automotive',
          description: { ru: 'Запчасти, аксессуары', uz: 'Ehtiyot qismlar, aksessuarlar', en: 'Spare parts, accessories' },
          icon: '🚗',
          createdBy: admin._id
        },
        {
          name: { ru: 'Книги', uz: 'Kitoblar', en: 'Books' },
          slug: 'books',
          description: { ru: 'Книги, учебники, журналы', uz: 'Kitoblar, darsliklar, jurnallar', en: 'Books, textbooks, magazines' },
          icon: '📚',
          createdBy: admin._id
        }
      ];

      const createdCategories = await Category.insertMany(defaultCategories);
      console.log(`✅ Создано ${createdCategories.length} категорий`);

      // Показываем созданные категории
      createdCategories.forEach((cat, i) => {
        console.log(`${i+1}. ${cat.name.ru} (${cat.slug}) - ${cat.icon}`);
      });
    } else {
      console.log('📋 Существующие категории:');
      categories.forEach((cat, i) => {
        console.log(`${i+1}. ${cat.name.ru} (${cat.slug}) - ${cat.icon} - ${cat.description.ru || 'Без описания'}`);
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

checkCategories();
