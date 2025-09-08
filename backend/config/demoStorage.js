/**
 * 🎭 ДЕМО ХРАНИЛИЩЕ ДАННЫХ
 * Имитация базы данных для демонстрации без MongoDB
 */

const { v4: uuidv4 } = require('uuid');

// Демо данные пользователей
const demoUsers = [
  {
    id: 'demo_user_1',
    email: 'admin@tendo.uz',
    password: 'admin123',
    firstName: 'Админ',
    lastName: 'Ten Do',
    role: 'admin',
    phone: '+998901234567',
    city: 'tashkent',
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'demo_user_2',
    email: 'user@tendo.uz',
    password: 'user123',
    firstName: 'Пользователь',
    lastName: 'Демо',
    role: 'user',
    phone: '+998907654321',
    city: 'samarkand',
    isActive: true,
    createdAt: new Date('2025-01-02')
  }
];

// Реальные товары для интернет-магазина
const demoProducts = [
  {
    id: 'product_001',
    name: 'iPhone 15 Pro Max 256GB',
    description: 'Флагманский смартфон Apple с профессиональной камерой Pro, дисплеем Super Retina XDR 6.7" и чипом A17 Pro. Идеальный выбор для фотографии и видео.',
    price: 15990000, // в сумах
    originalPrice: 17990000,
    category: 'smartphones',
    images: ['/images/iphone15-pro-max.jpg', '/images/iphone15-pro-max-2.jpg', '/images/iphone15-pro-max-3.jpg'],
    stock: 12,
    isActive: true,
    rating: 4.8,
    reviewCount: 2341,
    brand: 'Apple',
    specifications: {
      'Дисплей': '6.7" Super Retina XDR OLED',
      'Процессор': 'Apple A17 Pro',
      'Память': '256GB',
      'Камера': '48MP + 12MP + 12MP',
      'Батарея': '4680 mAh',
      'ОС': 'iOS 17',
      'Цвет': 'Natural Titanium'
    },
    features: [
      'Дисплей Super Retina XDR 6.7"',
      'Чип A17 Pro с GPU 6 ядер',
      'Система камер Pro 48 Мп',
      'До 29 часов воспроизведения видео',
      'Корпус из титана',
      'Face ID',
      'Устойчивость к брызгам IP68'
    ],
    createdAt: new Date('2024-12-01')
  },
  {
    id: 'product_002',
    name: 'Samsung Galaxy S24 Ultra 512GB',
    description: 'Премиальный смартфон Samsung с S Pen, камерой 200MP и огромным дисплеем. Профессиональный инструмент для творчества и бизнеса.',
    price: 18990000,
    originalPrice: 21990000,
    category: 'smartphones',
    images: ['/images/samsung-s24-ultra.jpg', '/images/samsung-s24-ultra-2.jpg'],
    stock: 8,
    isActive: true,
    rating: 4.9,
    reviewCount: 1892,
    brand: 'Samsung',
    specifications: {
      'Дисплей': '6.8" Dynamic AMOLED 2X',
      'Процессор': 'Snapdragon 8 Gen 3',
      'Память': '512GB',
      'Камера': '200MP + 50MP + 12MP + 10MP',
      'Батарея': '5000 mAh',
      'ОС': 'Android 14',
      'S Pen': 'В комплекте',
      'Цвет': 'Titanium Black'
    },
    features: [
      'Дисплей 6.8" с частотой 120Hz',
      'Камера 200MP с оптической стабилизацией',
      'S Pen в комплекте',
      'Быстрая зарядка 45W',
      'Защита IP68',
      'Android 14 с One UI 6.1'
    ],
    createdAt: new Date('2024-12-02')
  },
  {
    id: 'product_003',
    name: 'MacBook Pro 14" M3 16GB/512GB',
    description: 'Профессиональный ноутбук Apple с чипом M3, Liquid Retina XDR дисплеем и производительностью для самых сложных задач.',
    price: 45990000,
    originalPrice: 49990000,
    category: 'laptops',
    images: ['/images/macbook-pro-14-m3.jpg', '/images/macbook-pro-14-m3-2.jpg'],
    stock: 5,
    isActive: true,
    rating: 4.9,
    reviewCount: 856,
    brand: 'Apple',
    specifications: {
      'Дисплей': '14.2" Liquid Retina XDR',
      'Процессор': 'Apple M3',
      'Оперативная память': '16GB unified memory',
      'Накопитель': 'SSD 512GB',
      'Графика': 'M3 10-core GPU',
      'Батарея': 'До 18 часов работы',
      'ОС': 'macOS Sonoma',
      'Цвет': 'Space Black'
    },
    features: [
      'Дисплей Liquid Retina XDR',
      'Чип M3 с Neural Engine',
      'До 18 часов автономной работы',
      'Три порта Thunderbolt 4',
      'Magic Keyboard с подсветкой',
      'macOS Sonoma'
    ],
    createdAt: new Date('2024-12-03')
  },
  {
    id: 'product_004',
    name: 'Sony WH-1000XM5 Беспроводные наушники',
    description: 'Премиальные беспроводные наушники с активным шумоподавлением, 30-часовой автономностью и кристально чистым звуком.',
    price: 4990000,
    originalPrice: 5990000,
    category: 'headphones',
    images: ['/images/sony-wh1000xm5.jpg', '/images/sony-wh1000xm5-2.jpg'],
    stock: 20,
    isActive: true,
    rating: 4.7,
    reviewCount: 1456,
    brand: 'Sony',
    specifications: {
      'Тип': 'Накладные, закрытые',
      'Подключение': 'Bluetooth 5.2, USB-C',
      'Время работы': '30 часов с ANC',
      'Шумоподавление': 'Активное цифровое',
      'Кодеки': 'LDAC, AAC, SBC',
      'Вес': '250г',
      'Цвет': 'Чёрный'
    },
    features: [
      'Активное шумоподавление',
      '30 часов автономной работы',
      'Быстрая зарядка 3 мин = 3 часа',
      'Качественный звук Sony',
      'Складная конструкция',
      'Приложение Sony Headphones Connect'
    ],
    createdAt: new Date('2024-12-04')
  },
  {
    id: 'product_005',
    name: 'iPad Pro 12.9" M2 256GB Wi-Fi',
    description: 'Мощный планшет Apple с чипом M2, дисплеем Liquid Retina XDR и поддержкой Apple Pencil Pro. Идеально для творчества и работы.',
    price: 29990000,
    originalPrice: 32990000,
    category: 'tablets',
    images: ['/images/ipad-pro-12.9-m2.jpg', '/images/ipad-pro-12.9-m2-2.jpg'],
    stock: 15,
    isActive: true,
    rating: 4.8,
    reviewCount: 723,
    brand: 'Apple',
    specifications: {
      'Дисплей': '12.9" Liquid Retina XDR',
      'Процессор': 'Apple M2',
      'Оперативная память': '8GB unified memory',
      'Накопитель': 'SSD 256GB',
      'Камера': '12MP + 10MP',
      'Батарея': 'До 10 часов работы',
      'ОС': 'iPadOS 17',
      'Цвет': 'Silver'
    },
    features: [
      'Дисплей Liquid Retina XDR',
      'Чип M2 с Neural Engine',
      'Поддержка Apple Pencil Pro',
      'Thunderbolt / USB 4',
      'Face ID',
      'iPadOS 17 с Stage Manager'
    ],
    createdAt: new Date('2024-12-05')
  },
  {
    id: 'product_006',
    name: 'Apple Watch Series 9 45mm GPS',
    description: 'Умные часы Apple с продвинутыми функциями здоровья, спортивными режимами и всегда активным дисплеем Retina.',
    price: 8990000,
    originalPrice: 9990000,
    category: 'smartwatches',
    images: ['/images/apple-watch-series-9.jpg', '/images/apple-watch-series-9-2.jpg'],
    stock: 25,
    isActive: true,
    rating: 4.6,
    reviewCount: 2890,
    brand: 'Apple',
    specifications: {
      'Дисплей': 'Always-On Retina LTPO OLED',
      'Процессор': 'S9 SiP',
      'Водонепроницаемость': '50 метров',
      'Датчики': 'GPS, компас, высотомер',
      'Связь': 'Wi-Fi, Bluetooth 5.3',
      'Батарея': 'До 18 часов',
      'watchOS': '10',
      'Цвет': 'Midnight'
    },
    features: [
      'Всегда активный дисплей',
      'Отслеживание сна и активности',
      'Измерение пульса и ЭКГ',
      'Спортивные режимы',
      'SOS функция',
      'Поддержка Siri'
    ],
    createdAt: new Date('2024-12-06')
  },
  {
    id: 'product_007',
    name: 'AirPods Pro (2nd generation)',
    description: 'Беспроводные наушники-вкладыши Apple с активным шумоподавлением, адаптивной прозрачностью и улучшенным звуком.',
    price: 3490000,
    originalPrice: 3990000,
    category: 'headphones',
    images: ['/images/airpods-pro-2nd-gen.jpg', '/images/airpods-pro-2nd-gen-2.jpg'],
    stock: 30,
    isActive: true,
    rating: 4.7,
    reviewCount: 3456,
    brand: 'Apple',
    specifications: {
      'Тип': 'Вкладыши',
      'Чип': 'Apple H2',
      'Шумоподавление': 'Активное + Адаптивная прозрачность',
      'Время работы': '6 часов с ANC',
      'Зарядка': 'MagSafe, Lightning, беспроводная',
      'Водонепроницаемость': 'IPX4',
      'Цвет': 'Белый'
    },
    features: [
      'Активное шумоподавление',
      'Адаптивная прозрачность',
      'Пространственное аудио',
      'Чип H2 для лучшего звука',
      'Удобная посадка',
      'Быстрое переключение устройств'
    ],
    createdAt: new Date('2024-12-07')
  },
  {
    id: 'product_008',
    name: 'Dell XPS 13 9340 Intel Core i7',
    description: 'Компактный ультрабук Dell с процессором Intel Core i7, OLED дисплеем и премиальным дизайном. Идеально для мобильной работы.',
    price: 22990000,
    originalPrice: 25990000,
    category: 'laptops',
    images: ['/images/dell-xps-13-9340.jpg', '/images/dell-xps-13-9340-2.jpg'],
    stock: 10,
    isActive: true,
    rating: 4.5,
    reviewCount: 567,
    brand: 'Dell',
    specifications: {
      'Дисплей': '13.4" OLED 3.5K InfinityEdge',
      'Процессор': 'Intel Core i7-1355U',
      'Оперативная память': '16GB LPDDR5',
      'Накопитель': 'SSD 512GB PCIe',
      'Графика': 'Intel Iris Xe Graphics',
      'Батарея': 'До 12 часов',
      'ОС': 'Windows 11 Pro',
      'Вес': '1.19 кг'
    },
    features: [
      'OLED дисплей с разрешением 3.5K',
      'Процессор Intel Core i7',
      'Ультракомпактный дизайн',
      'Технология ExpressSign-in',
      'Быстрая зарядка',
      'Windows 11 Pro'
    ],
    createdAt: new Date('2024-12-08')
  }
];

// Реальные категории товаров
const demoCategories = [
  {
    id: 'cat_smartphones',
    name: 'Смартфоны',
    slug: 'smartphones',
    description: 'Флагманские смартфоны от ведущих производителей',
    image: '/images/category-smartphones.jpg',
    isActive: true,
    productCount: 2
  },
  {
    id: 'cat_laptops',
    name: 'Ноутбуки',
    slug: 'laptops',
    description: 'Профессиональные ноутбуки для работы и учебы',
    image: '/images/category-laptops.jpg',
    isActive: true,
    productCount: 2
  },
  {
    id: 'cat_tablets',
    name: 'Планшеты',
    slug: 'tablets',
    description: 'Планшеты для творчества и развлечений',
    image: '/images/category-tablets.jpg',
    isActive: true,
    productCount: 1
  },
  {
    id: 'cat_headphones',
    name: 'Наушники',
    slug: 'headphones',
    description: 'Беспроводные и проводные наушники',
    image: '/images/category-headphones.jpg',
    isActive: true,
    productCount: 2
  },
  {
    id: 'cat_smartwatches',
    name: 'Умные часы',
    slug: 'smartwatches',
    description: 'Смарт-часы для отслеживания здоровья и фитнеса',
    image: '/images/category-smartwatches.jpg',
    isActive: true,
    productCount: 1
  }
];

/**
 * Демо хранилище с CRUD операциями
 */
class DemoStorage {
  constructor() {
    this.users = [...demoUsers];
    this.products = [...demoProducts];
    this.categories = [...demoCategories];
    this.sessions = new Map(); // Для хранения сессий
  }

  // Пользователи
  async findUserByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  async findUserById(id) {
    return this.users.find(user => user.id === id);
  }

  async createUser(userData) {
    const newUser = {
      id: `demo_user_${Date.now()}`,
      ...userData,
      isActive: true,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  // Товары
  async findAllProducts(params = {}) {
    let products = [...this.products];

    if (params.category) {
      products = products.filter(p => p.category === params.category);
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      );
    }

    return {
      products,
      total: products.length,
      page: 1,
      pages: 1
    };
  }

  async findProductById(id) {
    return this.products.find(p => p.id === id);
  }

  // Категории
  async findAllCategories() {
    return this.categories.filter(cat => cat.isActive);
  }

  async findCategoryById(id) {
    return this.categories.find(cat => cat.id === id);
  }

  // Сессии для JWT
  async createSession(userId, token) {
    this.sessions.set(token, {
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 дней
    });
    return token;
  }

  async findSessionByToken(token) {
    const session = this.sessions.get(token);
    if (!session) return null;

    if (session.expiresAt < new Date()) {
      this.sessions.delete(token);
      return null;
    }

    return session;
  }

  async deleteSession(token) {
    return this.sessions.delete(token);
  }

  // Получить всех пользователей (для админ панели)
  async findAllUsers() {
    return [...this.users];
  }
}

// Создаем экземпляр демо хранилища
const demoStorage = new DemoStorage();

module.exports = demoStorage;
