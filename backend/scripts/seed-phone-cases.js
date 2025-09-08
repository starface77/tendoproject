const mongoose = require('mongoose');
require('dotenv').config();

// Импорт моделей
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');

// 🎯 ДАННЫЕ ДЛЯ ЧЕХЛОВ
const phoneModels = {
  iPhone: [
    'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
    'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
    'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 mini',
    'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 mini',
    'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
    'iPhone XS Max', 'iPhone XS', 'iPhone XR', 'iPhone X',
    'iPhone 8 Plus', 'iPhone 8', 'iPhone SE 2022'
  ],
  Samsung: [
    'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
    'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23',
    'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
    'Galaxy Note 20 Ultra', 'Galaxy Note 20',
    'Galaxy A54', 'Galaxy A34', 'Galaxy A24',
    'Galaxy Z Fold 5', 'Galaxy Z Flip 5'
  ],
  Xiaomi: [
    'Xiaomi 14 Pro', 'Xiaomi 14', 'Xiaomi 13 Pro', 'Xiaomi 13',
    'Redmi Note 13 Pro', 'Redmi Note 13', 'Redmi Note 12 Pro',
    'POCO X6 Pro', 'POCO X6', 'POCO F5 Pro'
  ]
};

const caseTypes = [
  {
    name: { ru: 'Силиконовые чехлы', uz: 'Silikon g\'iloflar', en: 'Silicone Cases' },
    material: 'silicone',
    features: ['wireless_charging', 'screen_protector'],
    protection: { shockProof: true, dropProtection: 'basic' }
  },
  {
    name: { ru: 'Кожаные чехлы', uz: 'Teri g\'iloflar', en: 'Leather Cases' },
    material: 'leather',
    features: ['card_holder', 'kickstand'],
    protection: { scratchResistant: true, dropProtection: 'basic' }
  },
  {
    name: { ru: 'Прозрачные чехлы', uz: 'Shaffof g\'iloflar', en: 'Clear Cases' },
    material: 'plastic',
    features: ['transparent', 'wireless_charging'],
    protection: { scratchResistant: true, dropProtection: 'basic' }
  },
  {
    name: { ru: 'Противоударные чехлы', uz: 'Zarbaga chidamli g\'iloflar', en: 'Shockproof Cases' },
    material: 'plastic',
    features: ['wireless_charging', 'camera_protection'],
    protection: { shockProof: true, dropProtection: 'military' }
  },
  {
    name: { ru: 'Магнитные чехлы', uz: 'Magnit g\'iloflar', en: 'Magnetic Cases' },
    material: 'plastic',
    features: ['magnetic', 'wireless_charging'],
    protection: { shockProof: true, dropProtection: 'advanced' }
  }
];

const colors = [
  { name: 'Черный', value: '#000000', price: 0 },
  { name: 'Белый', value: '#FFFFFF', price: 0 },
  { name: 'Прозрачный', value: 'transparent', price: 0 },
  { name: 'Красный', value: '#FF0000', price: 5000 },
  { name: 'Синий', value: '#0000FF', price: 5000 },
  { name: 'Розовый', value: '#FFC0CB', price: 5000 },
  { name: 'Фиолетовый', value: '#800080', price: 7000 },
  { name: 'Золотой', value: '#FFD700', price: 10000 }
];

// 🏷️ КАТЕГОРИИ
const categories = [
  {
    name: { ru: 'iPhone чехлы', uz: 'iPhone g\'iloflari', en: 'iPhone Cases' },
    slug: 'iphone-cases',
    icon: '📱',
    color: '#007AFF',
    allowedBrands: ['iPhone'],
    priceRange: { min: 15000, max: 150000 }
  },
  {
    name: { ru: 'Samsung чехлы', uz: 'Samsung g\'iloflari', en: 'Samsung Cases' },
    slug: 'samsung-cases',
    icon: '📱',
    color: '#1428A0',
    allowedBrands: ['Samsung'],
    priceRange: { min: 12000, max: 120000 }
  },
  {
    name: { ru: 'Xiaomi чехлы', uz: 'Xiaomi g\'iloflari', en: 'Xiaomi Cases' },
    slug: 'xiaomi-cases',
    icon: '📱',
    color: '#FF6900',
    allowedBrands: ['Xiaomi'],
    priceRange: { min: 10000, max: 80000 }
  },
  {
    name: { ru: 'Премиум коллекция', uz: 'Premium kolleksiya', en: 'Premium Collection' },
    slug: 'premium-cases',
    icon: '💎',
    color: '#D4AF37',
    isFeatured: true,
    priceRange: { min: 50000, max: 200000 }
  }
];

// 🛍️ ГЕНЕРАЦИЯ ТОВАРОВ
function generateProducts(categories, adminUserId) {
  const products = [];
  
  Object.keys(phoneModels).forEach(brand => {
    const brandCategory = categories.find(cat => 
      cat.allowedBrands?.includes(brand)
    );
    
    if (!brandCategory) return;
    
    phoneModels[brand].forEach(model => {
      caseTypes.forEach((caseType, typeIndex) => {
        const basePrice = getBasePrice(brand, caseType.material);
        const isNew = Math.random() < 0.3;
        const isFeatured = Math.random() < 0.2;
        const isOnSale = Math.random() < 0.25;
        
        const originalPrice = isOnSale ? basePrice + Math.floor(Math.random() * 20000) + 10000 : null;
        
        const product = {
          name: {
            ru: `${caseType.name.ru} для ${model}`,
            uz: `${model} uchun ${caseType.name.uz}`,
            en: `${caseType.name.en} for ${model}`
          },
          description: {
            ru: generateDescription(caseType.name.ru, model, 'ru'),
            uz: generateDescription(caseType.name.uz, model, 'uz'),
            en: generateDescription(caseType.name.en, model, 'en')
          },
          shortDescription: {
            ru: `Качественный ${caseType.name.ru.toLowerCase()} для ${model}`,
            uz: `${model} uchun sifatli ${caseType.name.uz.toLowerCase()}`,
            en: `Quality ${caseType.name.en.toLowerCase()} for ${model}`
          },
          category: brandCategory._id,
          brand: brand,
          model: model,
          price: basePrice,
          originalPrice: originalPrice,
          currency: 'UZS',
          stock: Math.floor(Math.random() * 50) + 10,
          material: caseType.material,
          protection: caseType.protection,
          features: caseType.features,
          variants: generateColorVariants(colors),
          specifications: generateSpecifications(caseType, model),
          images: generateImages(brand, model, caseType.material),
          tags: generateTags(brand, model, caseType.name.en),
          rating: {
            average: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
            count: Math.floor(Math.random() * 100) + 5
          },
          views: Math.floor(Math.random() * 1000) + 50,
          purchases: Math.floor(Math.random() * 200) + 10,
          favorites: Math.floor(Math.random() * 50),
          isActive: true,
          isNew: isNew,
          isFeatured: isFeatured,
          isOnSale: isOnSale,
          createdBy: adminUserId,
          publishDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          shipping: {
            weight: getWeight(caseType.material),
            dimensions: { length: 160, width: 80, height: 15 },
            freeShipping: basePrice > 50000
          }
        };
        
        products.push(product);
      });
    });
  });
  
  return products;
}

function getBasePrice(brand, material) {
  let basePrice = 15000;
  
  // Цена по брендам
  if (brand === 'iPhone') basePrice = 25000;
  else if (brand === 'Samsung') basePrice = 20000;
  else if (brand === 'Xiaomi') basePrice = 15000;
  
  // Цена по материалам
  if (material === 'leather') basePrice += 15000;
  else if (material === 'metal') basePrice += 25000;
  else if (material === 'glass') basePrice += 20000;
  
  // Случайное отклонение ±20%
  const variation = (Math.random() - 0.5) * 0.4;
  return Math.floor(basePrice * (1 + variation));
}

function generateDescription(typeName, model, lang) {
  const descriptions = {
    ru: `Превосходный ${typeName.toLowerCase()} для ${model}. Обеспечивает надежную защиту вашего устройства от царапин, ударов и повседневного износа. Точные вырезы для всех портов и кнопок. Совместим с беспроводной зарядкой.`,
    uz: `${model} uchun zo'r ${typeName.toLowerCase()}. Qurilmangizni chizishlar, zarbalar va kundalik eskirishdan ishonchli himoya qiladi. Barcha portlar va tugmalar uchun aniq kesimlar. Simsiz zaryadlash bilan mos keladi.`,
    en: `Excellent ${typeName.toLowerCase()} for ${model}. Provides reliable protection for your device from scratches, impacts and daily wear. Precise cutouts for all ports and buttons. Compatible with wireless charging.`
  };
  
  return descriptions[lang];
}

function generateColorVariants(colors) {
  return colors.slice(0, Math.floor(Math.random() * 4) + 3).map(color => ({
    name: {
      ru: color.name,
      uz: color.name,
      en: color.name
    },
    type: 'color',
    value: color.value,
    price: color.price,
    stock: Math.floor(Math.random() * 20) + 5,
    sku: `COLOR-${color.value.replace('#', '')}`,
    images: []
  }));
}

function generateSpecifications(caseType, model) {
  return [
    {
      name: { ru: 'Совместимость', uz: 'Mos keluvchi', en: 'Compatibility' },
      value: { ru: model, uz: model, en: model },
      order: 1
    },
    {
      name: { ru: 'Материал', uz: 'Material', en: 'Material' },
      value: { 
        ru: getMaterialName(caseType.material, 'ru'),
        uz: getMaterialName(caseType.material, 'uz'),
        en: getMaterialName(caseType.material, 'en')
      },
      order: 2
    },
    {
      name: { ru: 'Беспроводная зарядка', uz: 'Simsiz zaryadlash', en: 'Wireless Charging' },
      value: {
        ru: caseType.features.includes('wireless_charging') ? 'Поддерживается' : 'Не поддерживается',
        uz: caseType.features.includes('wireless_charging') ? 'Qo\'llab-quvvatlanadi' : 'Qo\'llab-quvvatlanmaydi',
        en: caseType.features.includes('wireless_charging') ? 'Supported' : 'Not supported'
      },
      order: 3
    }
  ];
}

function getMaterialName(material, lang) {
  const materials = {
    silicone: { ru: 'Силикон', uz: 'Silikon', en: 'Silicone' },
    leather: { ru: 'Кожа', uz: 'Teri', en: 'Leather' },
    plastic: { ru: 'Пластик', uz: 'Plastik', en: 'Plastic' },
    metal: { ru: 'Металл', uz: 'Metall', en: 'Metal' },
    glass: { ru: 'Стекло', uz: 'Oyna', en: 'Glass' }
  };
  
  return materials[material]?.[lang] || material;
}

function generateImages(brand, model, material) {
  const baseUrl = 'https://images.unsplash.com';
  return [
    {
      url: `${baseUrl}/400x400/?${brand}-${model}-case-${material}`,
      alt: { ru: `Чехол для ${model}`, uz: `${model} uchun g'ilof`, en: `Case for ${model}` },
      isPrimary: true,
      order: 0
    },
    {
      url: `${baseUrl}/400x400/?phone-case-back-${material}`,
      alt: { ru: 'Задняя сторона', uz: 'Orqa tomoni', en: 'Back view' },
      isPrimary: false,
      order: 1
    }
  ];
}

function generateTags(brand, model, caseTypeName) {
  return [
    brand.toLowerCase(),
    model.toLowerCase().replace(/\s+/g, '-'),
    caseTypeName.toLowerCase().replace(/\s+/g, '-'),
    'phone-case',
    'protection'
  ];
}

function getWeight(material) {
  const weights = {
    silicone: 25,
    plastic: 20,
    leather: 35,
    metal: 50,
    glass: 45
  };
  
  return weights[material] || 25;
}

async function seedPhoneCases() {
  try {
    console.log('🚀 Начинаем заполнение базы данных чехлами...');
    
    // Подключение к MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chexoluz');
    console.log('✅ Подключен к MongoDB');
    
    // Создаем админ пользователя если его нет
    let adminUser = await User.findOne({ email: 'admin@chexol.uz' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin',
        email: 'admin@chexol.uz',
        password: 'admin123456',
        role: 'super_admin',
        isEmailVerified: true
      });
      console.log('✅ Создан админ пользователь');
    }
    
    // Очищаем существующие данные
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('🗑️ Очищены старые данные');
    
    // Создаем категории
    const createdCategories = [];
    for (const categoryData of categories) {
      const category = await Category.create({
        ...categoryData,
        createdBy: adminUser._id
      });
      createdCategories.push(category);
      console.log(`✅ Создана категория: ${category.name.ru}`);
    }
    
    // Генерируем товары
    const productData = generateProducts(createdCategories, adminUser._id);
    console.log(`📦 Сгенерировано ${productData.length} товаров`);
    
    // Создаем товары порциями по 50
    const batchSize = 50;
    for (let i = 0; i < productData.length; i += batchSize) {
      const batch = productData.slice(i, i + batchSize);
      await Product.insertMany(batch);
      console.log(`✅ Добавлено товаров: ${Math.min(i + batchSize, productData.length)}/${productData.length}`);
    }
    
    // Обновляем счетчики товаров в категориях
    for (const category of createdCategories) {
      await category.updateProductCount();
    }
    
    console.log('🎉 Заполнение базы данных завершено!');
    console.log(`📊 Статистика:`);
    console.log(`   - Категорий: ${createdCategories.length}`);
    console.log(`   - Товаров: ${productData.length}`);
    console.log(`   - Брендов: ${Object.keys(phoneModels).length}`);
    console.log(`   - Типов чехлов: ${caseTypes.length}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
    process.exit(1);
  }
}

// Запуск скрипта
if (require.main === module) {
  seedPhoneCases();
}

module.exports = { seedPhoneCases };
