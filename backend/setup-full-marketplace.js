const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');

async function setupFullMarketplace() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tendo');
    console.log('✅ Подключено к MongoDB');

    // Находим админа
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ Админ не найден!');
      return;
    }
    console.log('👤 Админ найден:', admin._id);

    // Создаем полноценные категории
    const categoriesData = [
      {
        name: { ru: 'Электроника', uz: 'Elektronika', en: 'Electronics' },
        description: {
          ru: 'Смартфоны, планшеты, ноутбуки и другая электроника',
          uz: 'Smartfonlar, planshetlar, noutbuklar va boshqa elektronika',
          en: 'Smartphones, tablets, laptops and other electronics'
        },
        icon: '📱',
        slug: 'electronics',
        isActive: true,
        sortOrder: 1,
        createdBy: admin._id
      },
      {
        name: { ru: 'Одежда', uz: 'Kiyim', en: 'Clothing' },
        description: {
          ru: 'Мужская и женская одежда',
          uz: 'Erkak va ayol kiyimlari',
          en: 'Men and women clothing'
        },
        icon: '👕',
        slug: 'clothing',
        isActive: true,
        sortOrder: 2,
        createdBy: admin._id
      },
      {
        name: { ru: 'Аксессуары', uz: 'Aksessuarlar', en: 'Accessories' },
        description: {
          ru: 'Сумки, украшения, часы и другие аксессуары',
          uz: 'Sumkalar, taqinchoqlar, soatlar va boshqa aksessuarlar',
          en: 'Bags, jewelry, watches and other accessories'
        },
        icon: '👜',
        slug: 'accessories',
        isActive: true,
        sortOrder: 3,
        createdBy: admin._id
      },
      {
        name: { ru: 'Дом и сад', uz: 'Uy va bog\'', en: 'Home and Garden' },
        description: {
          ru: 'Мебель, декор, садовый инвентарь',
          uz: 'Mebel, bezak, bog\' asboblari',
          en: 'Furniture, decor, garden tools'
        },
        icon: '🏠',
        slug: 'home-garden',
        isActive: true,
        sortOrder: 4,
        createdBy: admin._id
      },
      {
        name: { ru: 'Красота и здоровье', uz: 'Go\'zallik va salomatlik', en: 'Beauty and Health' },
        description: {
          ru: 'Косметика, парфюмерия, уход за телом',
          uz: 'Kosmetika, parfyumeriya, tana parvarishi',
          en: 'Cosmetics, perfumery, body care'
        },
        icon: '💄',
        slug: 'beauty-health',
        isActive: true,
        sortOrder: 5,
        createdBy: admin._id
      }
    ];

    // Добавляем/обновляем категории
    const categories = [];
    for (const categoryData of categoriesData) {
      const existingCategory = await Category.findOne({ slug: categoryData.slug });
      if (existingCategory) {
        console.log(`⚠️ Категория "${categoryData.name.ru}" уже существует, обновляем...`);
        await Category.findByIdAndUpdate(existingCategory._id, categoryData);
        categories.push(existingCategory);
      } else {
        const category = new Category(categoryData);
        await category.save();
        console.log(`✅ Создана категория: ${categoryData.name.ru}`);
        categories.push(category);
      }
    }

    // Создаем товары
    const productsData = [
      // Xiaomi смартфоны
      {
        name: { ru: 'Xiaomi Redmi Note 12 Pro', uz: 'Xiaomi Redmi Note 12 Pro', en: 'Xiaomi Redmi Note 12 Pro' },
        description: {
          ru: 'Смартфон с AMOLED дисплеем, быстрой зарядкой и отличной камерой',
          uz: 'AMOLED displeyli, tez quvvatlash va ajoyib kamera bilan smartfon',
          en: 'Smartphone with AMOLED display, fast charging and excellent camera'
        },
        price: 4500000, // в тийинах
        originalPrice: 5000000,
        category: categories[0]._id, // Электроника
        images: [
          { url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400', isPrimary: false }
        ],
        brand: 'Xiaomi',
        model: 'Redmi Note 12 Pro',
        specifications: [
          {
            name: { ru: 'Дисплей', uz: 'Displey', en: 'Display' },
            value: { ru: '6.67" AMOLED', uz: '6.67" AMOLED', en: '6.67" AMOLED' },
            order: 1
          },
          {
            name: { ru: 'Процессор', uz: 'Protsessor', en: 'Processor' },
            value: { ru: 'MediaTek Helio G99', uz: 'MediaTek Helio G99', en: 'MediaTek Helio G99' },
            order: 2
          },
          {
            name: { ru: 'Оперативная память', uz: 'Operativ xotira', en: 'RAM' },
            value: { ru: '8GB', uz: '8GB', en: '8GB' },
            order: 3
          },
          {
            name: { ru: 'Память', uz: 'Xotira', en: 'Storage' },
            value: { ru: '256GB', uz: '256GB', en: '256GB' },
            order: 4
          }
        ],
        stock: 15,
        isActive: true,
        createdBy: admin._id
      },
      {
        name: { ru: 'Xiaomi 13 Pro', uz: 'Xiaomi 13 Pro', en: 'Xiaomi 13 Pro' },
        description: {
          ru: 'Флагманский смартфон с профессиональной камерой Leica',
          uz: 'Leica professional kamera bilan flagship smartfon',
          en: 'Flagship smartphone with Leica professional camera'
        },
        price: 8500000,
        originalPrice: 9500000,
        category: categories[0]._id,
        images: [
          { url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', isPrimary: false }
        ],
        brand: 'Xiaomi',
        model: '13 Pro',
        specifications: [
          {
            name: { ru: 'Дисплей', uz: 'Displey', en: 'Display' },
            value: { ru: '6.73" AMOLED', uz: '6.73" AMOLED', en: '6.73" AMOLED' },
            order: 1
          },
          {
            name: { ru: 'Процессор', uz: 'Protsessor', en: 'Processor' },
            value: { ru: 'Qualcomm Snapdragon 8 Gen 2', uz: 'Qualcomm Snapdragon 8 Gen 2', en: 'Qualcomm Snapdragon 8 Gen 2' },
            order: 2
          },
          {
            name: { ru: 'Оперативная память', uz: 'Operativ xotira', en: 'RAM' },
            value: { ru: '12GB', uz: '12GB', en: '12GB' },
            order: 3
          },
          {
            name: { ru: 'Память', uz: 'Xotira', en: 'Storage' },
            value: { ru: '512GB', uz: '512GB', en: '512GB' },
            order: 4
          }
        ],
        stock: 8,
        isActive: true,
        createdBy: admin._id
      },

      // Samsung смартфоны
      {
        name: { ru: 'Samsung Galaxy S23', uz: 'Samsung Galaxy S23', en: 'Samsung Galaxy S23' },
        description: {
          ru: 'Флагман Samsung с превосходной производительностью',
          uz: 'Samsung flagship ajoyib ishlash bilan',
          en: 'Samsung flagship with excellent performance'
        },
        price: 7200000,
        originalPrice: 8000000,
        category: categories[0]._id,
        images: [
          { url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400', isPrimary: false }
        ],
        brand: 'Samsung',
        model: 'Galaxy S23',
        specifications: [
          {
            name: { ru: 'Дисплей', uz: 'Displey', en: 'Display' },
            value: { ru: '6.1" Dynamic AMOLED 2X', uz: '6.1" Dynamic AMOLED 2X', en: '6.1" Dynamic AMOLED 2X' },
            order: 1
          },
          {
            name: { ru: 'Процессор', uz: 'Protsessor', en: 'Processor' },
            value: { ru: 'Qualcomm Snapdragon 8 Gen 2', uz: 'Qualcomm Snapdragon 8 Gen 2', en: 'Qualcomm Snapdragon 8 Gen 2' },
            order: 2
          },
          {
            name: { ru: 'Оперативная память', uz: 'Operativ xotira', en: 'RAM' },
            value: { ru: '8GB', uz: '8GB', en: '8GB' },
            order: 3
          },
          {
            name: { ru: 'Память', uz: 'Xotira', en: 'Storage' },
            value: { ru: '256GB', uz: '256GB', en: '256GB' },
            order: 4
          }
        ],
        stock: 12,
        isActive: true,
        createdBy: admin._id
      },

      // Аксессуары - чехлы для телефонов
      {
        name: { ru: 'Защитный чехол для iPhone 14', uz: 'iPhone 14 uchun himoya g\'ilofi', en: 'Protective case for iPhone 14' },
        description: {
          ru: 'Прочный силиконовый чехол с антиударной защитой',
          uz: 'Mustahkam silikon g\'ilof antiurish himoyasi bilan',
          en: 'Durable silicone case with shock protection'
        },
        price: 150000,
        originalPrice: 180000,
        category: categories[2]._id, // Аксессуары
        images: [
          { url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400', isPrimary: false }
        ],
        brand: 'Apple',
        model: 'iPhone 14 Case',
        material: 'silicone',
        specifications: [
          {
            name: { ru: 'Материал', uz: 'Material', en: 'Material' },
            value: { ru: 'Силикон', uz: 'Silikon', en: 'Silicone' },
            order: 1
          },
          {
            name: { ru: 'Цвет', uz: 'Rang', en: 'Color' },
            value: { ru: 'Черный', uz: 'Qora', en: 'Black' },
            order: 2
          },
          {
            name: { ru: 'Совместимость', uz: 'Muvofiqlik', en: 'Compatibility' },
            value: { ru: 'iPhone 14', uz: 'iPhone 14', en: 'iPhone 14' },
            order: 3
          }
        ],
        stock: 50,
        isActive: true,
        createdBy: admin._id
      },
      {
        name: { ru: 'Чехол для Samsung Galaxy S23', uz: 'Samsung Galaxy S23 uchun g\'ilof', en: 'Case for Samsung Galaxy S23' },
        description: {
          ru: 'Стильный чехол с кармашком для карт',
          uz: 'Kartochka uchun cho\'ntakli zamonaviy g\'ilof',
          en: 'Stylish case with card pocket'
        },
        price: 120000,
        originalPrice: 150000,
        category: categories[2]._id,
        images: [
          { url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400', isPrimary: false }
        ],
        brand: 'Samsung',
        model: 'Galaxy S23 Case',
        material: 'leather',
        specifications: [
          {
            name: { ru: 'Материал', uz: 'Material', en: 'Material' },
            value: { ru: 'TPU + Кожа', uz: 'TPU + Charm', en: 'TPU + Leather' },
            order: 1
          },
          {
            name: { ru: 'Цвет', uz: 'Rang', en: 'Color' },
            value: { ru: 'Коричневый', uz: 'Jigarrang', en: 'Brown' },
            order: 2
          },
          {
            name: { ru: 'Совместимость', uz: 'Muvofiqlik', en: 'Compatibility' },
            value: { ru: 'Samsung Galaxy S23', uz: 'Samsung Galaxy S23', en: 'Samsung Galaxy S23' },
            order: 3
          }
        ],
        stock: 35,
        isActive: true,
        createdBy: admin._id
      },

      // Одежда
      {
        name: { ru: 'Футболка мужская базовая', uz: 'Erkak futbolkasi asosiy', en: 'Men\'s basic t-shirt' },
        description: {
          ru: 'Удобная хлопковая футболка на каждый день',
          uz: 'Har kuni uchun qulay paxta futbolkasi',
          en: 'Comfortable cotton t-shirt for everyday wear'
        },
        price: 250000,
        originalPrice: 300000,
        category: categories[1]._id, // Одежда
        images: [
          { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400', isPrimary: false }
        ],
        brand: 'Basic Wear',
        model: 'Classic T-Shirt',
        material: 'fabric',
        specifications: [
          {
            name: { ru: 'Материал', uz: 'Material', en: 'Material' },
            value: { ru: '100% Хлопок', uz: '100% Paxta', en: '100% Cotton' },
            order: 1
          },
          {
            name: { ru: 'Размер', uz: 'O\'lcham', en: 'Size' },
            value: { ru: 'M', uz: 'M', en: 'M' },
            order: 2
          },
          {
            name: { ru: 'Цвет', uz: 'Rang', en: 'Color' },
            value: { ru: 'Белый', uz: 'Oq', en: 'White' },
            order: 3
          },
          {
            name: { ru: 'Покрой', uz: 'Kesim', en: 'Fit' },
            value: { ru: 'Классический', uz: 'Klassik', en: 'Regular' },
            order: 4
          }
        ],
        stock: 100,
        isActive: true,
        createdBy: admin._id
      }
    ];

    // Добавляем товары
    for (const productData of productsData) {
      const existingProduct = await Product.findOne({
        'name.ru': productData.name.ru,
        brand: productData.brand
      });

      if (existingProduct) {
        console.log(`⚠️ Товар "${productData.name.ru}" уже существует, обновляем...`);
        await Product.findByIdAndUpdate(existingProduct._id, productData);
      } else {
        const product = new Product(productData);
        await product.save();
        console.log(`✅ Создан товар: ${productData.name.ru}`);
      }
    }

    console.log('✅ Полный маркетплейс настроен!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error(error.stack);
  }
}

setupFullMarketplace();
