/**
 * 🚀 СКРИПТ НАЧАЛЬНОЙ НАСТРОЙКИ БАЗЫ ДАННЫХ
 * Создает города Узбекистана и админ аккаунт
 */

const mongoose = require('mongoose');
const path = require('path');

// Определяем путь к моделям в зависимости от того, где запущен скрипт
const modelsPath = path.join(__dirname, 'backend', 'models');

const City = require(path.join(modelsPath, 'City'));
const User = require(path.join(modelsPath, 'User'));

// Данные городов Узбекистана
const uzbekistanCities = [
  {
    name: {
      ru: 'Ташкент',
      uz: 'Toshkent',
      en: 'Tashkent'
    },
    code: 'tashkent',
    coordinates: {
      latitude: 41.2995,
      longitude: 69.2401
    },
    region: {
      ru: 'Ташкентская область',
      uz: 'Toshkent viloyati',
      en: 'Tashkent Region'
    },
    population: 2578000,
    timezone: 'Asia/Tashkent',
    delivery: {
      isAvailable: true,
      methods: [
        {
          type: 'standard',
          isAvailable: true,
          cost: 25000,
          freeShippingThreshold: 200000,
          estimatedDays: { min: 1, max: 2 },
          workingHours: { start: '09:00', end: '20:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        },
        {
          type: 'express',
          isAvailable: true,
          cost: 50000,
          freeShippingThreshold: 500000,
          estimatedDays: { min: 1, max: 1 },
          workingHours: { start: '09:00', end: '22:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        {
          type: 'pickup',
          isAvailable: true,
          cost: 0,
          workingHours: { start: '09:00', end: '21:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      ]
    },
    pickupPoints: [
      {
        name: {
          ru: 'Центральный пункт выдачи',
          uz: 'Markaziy berish punkti',
          en: 'Central Pickup Point'
        },
        address: {
          ru: 'ул. Навои, 45',
          uz: 'Navoiy ko\'chasi, 45',
          en: 'Navoi Street, 45'
        },
        coordinates: {
          latitude: 41.2995,
          longitude: 69.2401
        },
        phone: '+998901234567',
        workingHours: {
          weekdays: { start: '09:00', end: '21:00' },
          weekends: { start: '10:00', end: '20:00' }
        },
        isActive: true
      }
    ],
    pricing: {
      adjustmentFactor: 1.0,
      currency: 'UZS'
    },
    isActive: true,
    isVisible: true,
    order: 1,
    features: ['capital'],
    contacts: {
      phone: '+998712000000',
      email: 'info@tendo.uz',
      address: {
        ru: 'г. Ташкент, ул. Навои, 1',
        uz: 'Toshkent shahri, Navoiy ko\'chasi, 1',
        en: 'Tashkent city, Navoi Street, 1'
      }
    },
    metaTitle: {
      ru: 'Ташкент - столица Узбекистана',
      uz: 'Toshkent - O\'zbekiston poytaxti',
      en: 'Tashkent - Uzbekistan Capital'
    },
    metaDescription: {
      ru: 'Ташкент - крупнейший город и столица Узбекистана',
      uz: 'Toshkent - O\'zbekistonning eng katta shahri va poytaxti',
      en: 'Tashkent - largest city and capital of Uzbekistan'
    }
  },
  {
    name: {
      ru: 'Самарканд',
      uz: 'Samarqand',
      en: 'Samarkand'
    },
    code: 'samarkand',
    coordinates: {
      latitude: 39.6542,
      longitude: 66.9597
    },
    region: {
      ru: 'Самаркандская область',
      uz: 'Samarqand viloyati',
      en: 'Samarkand Region'
    },
    population: 546400,
    timezone: 'Asia/Tashkent',
    delivery: {
      isAvailable: true,
      methods: [
        {
          type: 'standard',
          isAvailable: true,
          cost: 30000,
          freeShippingThreshold: 250000,
          estimatedDays: { min: 2, max: 3 },
          workingHours: { start: '09:00', end: '20:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        },
        {
          type: 'express',
          isAvailable: true,
          cost: 60000,
          freeShippingThreshold: 600000,
          estimatedDays: { min: 1, max: 2 },
          workingHours: { start: '09:00', end: '22:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }
      ]
    },
    pickupPoints: [
      {
        name: {
          ru: 'Центральный пункт выдачи',
          uz: 'Markaziy berish punkti',
          en: 'Central Pickup Point'
        },
        address: {
          ru: 'ул. Регистан, 12',
          uz: 'Registon ko\'chasi, 12',
          en: 'Registan Street, 12'
        },
        coordinates: {
          latitude: 39.6542,
          longitude: 66.9597
        },
        phone: '+998902345678',
        workingHours: {
          weekdays: { start: '09:00', end: '20:00' },
          weekends: { start: '10:00', end: '19:00' }
        },
        isActive: true
      }
    ],
    pricing: {
      adjustmentFactor: 0.95,
      currency: 'UZS'
    },
    isActive: true,
    isVisible: true,
    order: 2,
    features: ['tourist_destination', 'major_city'],
    contacts: {
      phone: '+998662000000',
      email: 'samarkand@tendo.uz',
      address: {
        ru: 'г. Самарканд, ул. Регистан, 1',
        uz: 'Samarqand shahri, Registon ko\'chasi, 1',
        en: 'Samarkand city, Registan Street, 1'
      }
    },
    metaTitle: {
      ru: 'Самарканд - жемчужина Узбекистана',
      uz: 'Samarqand - O\'zbekiston marvari',
      en: 'Samarkand - Pearl of Uzbekistan'
    },
    metaDescription: {
      ru: 'Самарканд - древний город с богатой историей и культурой',
      uz: 'Samarqand - boy tarix va madaniyatga ega qadimiy shahar',
      en: 'Samarkand - ancient city with rich history and culture'
    }
  },
  {
    name: {
      ru: 'Бухара',
      uz: 'Buxoro',
      en: 'Bukhara'
    },
    code: 'bukhara',
    coordinates: {
      latitude: 39.7681,
      longitude: 64.4556
    },
    region: {
      ru: 'Бухарская область',
      uz: 'Buxoro viloyati',
      en: 'Bukhara Region'
    },
    population: 284900,
    timezone: 'Asia/Tashkent',
    delivery: {
      isAvailable: true,
      methods: [
        {
          type: 'standard',
          isAvailable: true,
          cost: 35000,
          freeShippingThreshold: 300000,
          estimatedDays: { min: 2, max: 4 },
          workingHours: { start: '09:00', end: '19:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      ]
    },
    pickupPoints: [
      {
        name: {
          ru: 'Центральный пункт выдачи',
          uz: 'Markaziy berish punkti',
          en: 'Central Pickup Point'
        },
        address: {
          ru: 'ул. Ходжа Накшбанди, 25',
          uz: 'Xoja Naqshbandiy ko\'chasi, 25',
          en: 'Khudja Nakshbandi Street, 25'
        },
        coordinates: {
          latitude: 39.7681,
          longitude: 64.4556
        },
        phone: '+998903456789',
        workingHours: {
          weekdays: { start: '09:00', end: '19:00' },
          weekends: { start: '10:00', end: '18:00' }
        },
        isActive: true
      }
    ],
    pricing: {
      adjustmentFactor: 0.9,
      currency: 'UZS'
    },
    isActive: true,
    isVisible: true,
    order: 3,
    features: ['tourist_destination', 'major_city'],
    contacts: {
      phone: '+998652000000',
      email: 'bukhara@tendo.uz',
      address: {
        ru: 'г. Бухара, ул. Ходжа Накшбанди, 1',
        uz: 'Buxoro shahri, Xoja Naqshbandiy ko\'chasi, 1',
        en: 'Bukhara city, Khudja Nakshbandi Street, 1'
      }
    },
    metaTitle: {
      ru: 'Бухара - древний город Шелкового пути',
      uz: 'Buxoro - Ipak yo\'li qadimiy shahri',
      en: 'Bukhara - Ancient City of Silk Road'
    },
    metaDescription: {
      ru: 'Бухара - один из древнейших городов мира с уникальной архитектурой',
      uz: 'Buxoro - dunyoning eng qadimiy shaharlaridan biri noyob me\'morligi bilan',
      en: 'Bukhara - one of the oldest cities in the world with unique architecture'
    }
  },
  {
    name: {
      ru: 'Андижан',
      uz: 'Andijon',
      en: 'Andijan'
    },
    code: 'andijan',
    coordinates: {
      latitude: 40.7834,
      longitude: 72.3434
    },
    region: {
      ru: 'Андижанская область',
      uz: 'Andijon viloyati',
      en: 'Andijan Region'
    },
    population: 403900,
    timezone: 'Asia/Tashkent',
    delivery: {
      isAvailable: true,
      methods: [
        {
          type: 'standard',
          isAvailable: true,
          cost: 40000,
          freeShippingThreshold: 350000,
          estimatedDays: { min: 3, max: 5 },
          workingHours: { start: '09:00', end: '18:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      ]
    },
    pickupPoints: [
      {
        name: {
          ru: 'Центральный пункт выдачи',
          uz: 'Markaziy berish punkti',
          en: 'Central Pickup Point'
        },
        address: {
          ru: 'ул. Бабура, 15',
          uz: 'Bobur ko\'chasi, 15',
          en: 'Babur Street, 15'
        },
        coordinates: {
          latitude: 40.7834,
          longitude: 72.3434
        },
        phone: '+998904567890',
        workingHours: {
          weekdays: { start: '09:00', end: '18:00' },
          weekends: { start: '10:00', end: '17:00' }
        },
        isActive: true
      }
    ],
    pricing: {
      adjustmentFactor: 0.85,
      currency: 'UZS'
    },
    isActive: true,
    isVisible: true,
    order: 4,
    features: ['industrial', 'major_city'],
    contacts: {
      phone: '+998742000000',
      email: 'andijan@tendo.uz',
      address: {
        ru: 'г. Андижан, ул. Бабура, 1',
        uz: 'Andijon shahri, Bobur ko\'chasi, 1',
        en: 'Andijan city, Babur Street, 1'
      }
    },
    metaTitle: {
      ru: 'Андижан - промышленный центр Узбекистана',
      uz: 'Andijon - O\'zbekiston sanoat markazi',
      en: 'Andijan - Industrial Center of Uzbekistan'
    },
    metaDescription: {
      ru: 'Андижан - крупнейший промышленный центр Ферганской долины',
      uz: 'Andijon - Farg\'ona vodiysining eng katta sanoat markazi',
      en: 'Andijan - largest industrial center of Fergana Valley'
    }
  },
  {
    name: {
      ru: 'Наманган',
      uz: 'Namangan',
      en: 'Namangan'
    },
    code: 'namangan',
    coordinates: {
      latitude: 40.9983,
      longitude: 71.6726
    },
    region: {
      ru: 'Наманганская область',
      uz: 'Namangan viloyati',
      en: 'Namangan Region'
    },
    population: 626000,
    timezone: 'Asia/Tashkent',
    delivery: {
      isAvailable: true,
      methods: [
        {
          type: 'standard',
          isAvailable: true,
          cost: 35000,
          freeShippingThreshold: 300000,
          estimatedDays: { min: 3, max: 4 },
          workingHours: { start: '09:00', end: '18:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      ]
    },
    pickupPoints: [
      {
        name: {
          ru: 'Центральный пункт выдачи',
          uz: 'Markaziy berish punkti',
          en: 'Central Pickup Point'
        },
        address: {
          ru: 'ул. Истиклол, 30',
          uz: 'Istiqlol ko\'chasi, 30',
          en: 'Istiqlol Street, 30'
        },
        coordinates: {
          latitude: 40.9983,
          longitude: 71.6726
        },
        phone: '+998905678901',
        workingHours: {
          weekdays: { start: '09:00', end: '18:00' },
          weekends: { start: '10:00', end: '17:00' }
        },
        isActive: true
      }
    ],
    pricing: {
      adjustmentFactor: 0.88,
      currency: 'UZS'
    },
    isActive: true,
    isVisible: true,
    order: 5,
    features: ['industrial', 'major_city'],
    contacts: {
      phone: '+998692000000',
      email: 'namangan@tendo.uz',
      address: {
        ru: 'г. Наманган, ул. Истиклол, 1',
        uz: 'Namangan shahri, Istiqlol ko\'chasi, 1',
        en: 'Namangan city, Istiqlol Street, 1'
      }
    },
    metaTitle: {
      ru: 'Наманган - текстильная столица Узбекистана',
      uz: 'Namangan - O\'zbekiston to\'qimachilik poytaxti',
      en: 'Namangan - Textile Capital of Uzbekistan'
    },
    metaDescription: {
      ru: 'Наманган - центр текстильной промышленности Узбекистана',
      uz: 'Namangan - O\'zbekiston to\'qimachilik sanoati markazi',
      en: 'Namangan - center of textile industry in Uzbekistan'
    }
  },
  {
    name: {
      ru: 'Фергана',
      uz: 'Farg\'ona',
      en: 'Fergana'
    },
    code: 'fergana',
    coordinates: {
      latitude: 40.3842,
      longitude: 71.7843
    },
    region: {
      ru: 'Ферганская область',
      uz: 'Farg\'ona viloyati',
      en: 'Fergana Region'
    },
    population: 299200,
    timezone: 'Asia/Tashkent',
    delivery: {
      isAvailable: true,
      methods: [
        {
          type: 'standard',
          isAvailable: true,
          cost: 35000,
          freeShippingThreshold: 300000,
          estimatedDays: { min: 3, max: 4 },
          workingHours: { start: '09:00', end: '18:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      ]
    },
    pickupPoints: [
      {
        name: {
          ru: 'Центральный пункт выдачи',
          uz: 'Markaziy berish punkti',
          en: 'Central Pickup Point'
        },
        address: {
          ru: 'ул. Ал-Фараби, 20',
          uz: 'Al-Farabiy ko\'chasi, 20',
          en: 'Al-Farabi Street, 20'
        },
        coordinates: {
          latitude: 40.3842,
          longitude: 71.7843
        },
        phone: '+998906789012',
        workingHours: {
          weekdays: { start: '09:00', end: '18:00' },
          weekends: { start: '10:00', end: '17:00' }
        },
        isActive: true
      }
    ],
    pricing: {
      adjustmentFactor: 0.87,
      currency: 'UZS'
    },
    isActive: true,
    isVisible: true,
    order: 6,
    features: ['industrial', 'major_city'],
    contacts: {
      phone: '+998732000000',
      email: 'fergana@tendo.uz',
      address: {
        ru: 'г. Фергана, ул. Ал-Фараби, 1',
        uz: 'Farg\'ona shahri, Al-Farabiy ko\'chasi, 1',
        en: 'Fergana city, Al-Farabi Street, 1'
      }
    },
    metaTitle: {
      ru: 'Фергана - город древней истории',
      uz: 'Farg\'ona - qadimiy tarix shahri',
      en: 'Fergana - City of Ancient History'
    },
    metaDescription: {
      ru: 'Фергана - один из древнейших городов Центральной Азии',
      uz: 'Farg\'ona - Markaziy Osiyoning eng qadimiy shaharlaridan biri',
      en: 'Fergana - one of the oldest cities in Central Asia'
    }
  },
  {
    name: {
      ru: 'Нукус',
      uz: 'Nukus',
      en: 'Nukus'
    },
    code: 'nukus',
    coordinates: {
      latitude: 42.4600,
      longitude: 59.6100
    },
    region: {
      ru: 'Каракалпакстан',
      uz: 'Qoraqalpog\'iston',
      en: 'Karakalpakstan'
    },
    population: 319200,
    timezone: 'Asia/Tashkent',
    delivery: {
      isAvailable: true,
      methods: [
        {
          type: 'standard',
          isAvailable: true,
          cost: 45000,
          freeShippingThreshold: 400000,
          estimatedDays: { min: 4, max: 6 },
          workingHours: { start: '09:00', end: '18:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      ]
    },
    pickupPoints: [
      {
        name: {
          ru: 'Центральный пункт выдачи',
          uz: 'Markaziy berish punkti',
          en: 'Central Pickup Point'
        },
        address: {
          ru: 'ул. Кара-Калпакская, 35',
          uz: 'Qoraqalpog\'iston ko\'chasi, 35',
          en: 'Karakalpak Street, 35'
        },
        coordinates: {
          latitude: 42.4600,
          longitude: 59.6100
        },
        phone: '+998907890123',
        workingHours: {
          weekdays: { start: '09:00', end: '18:00' },
          weekends: { start: '10:00', end: '17:00' }
        },
        isActive: true
      }
    ],
    pricing: {
      adjustmentFactor: 0.8,
      currency: 'UZS'
    },
    isActive: true,
    isVisible: true,
    order: 7,
    features: ['major_city', 'border_city'],
    contacts: {
      phone: '+998612000000',
      email: 'nukus@tendo.uz',
      address: {
        ru: 'г. Нукус, ул. Кара-Калпакская, 1',
        uz: 'Nukus shahri, Qoraqalpog\'iston ko\'chasi, 1',
        en: 'Nukus city, Karakalpak Street, 1'
      }
    },
    metaTitle: {
      ru: 'Нукус - столица Каракалпакстана',
      uz: 'Nukus - Qoraqalpog\'iston poytaxti',
      en: 'Nukus - Capital of Karakalpakstan'
    },
    metaDescription: {
      ru: 'Нукус - культурный и экономический центр Каракалпакстана',
      uz: 'Nukus - Qoraqalpog\'iston madaniy va iqtisodiy markazi',
      en: 'Nukus - cultural and economic center of Karakalpakstan'
    }
  },
  {
    name: {
      ru: 'Ургенч',
      uz: 'Urganch',
      en: 'Urgench'
    },
    code: 'urgench',
    coordinates: {
      latitude: 41.5500,
      longitude: 60.6333
    },
    region: {
      ru: 'Хорезмская область',
      uz: 'Xorazm viloyati',
      en: 'Khorezm Region'
    },
    population: 150000,
    timezone: 'Asia/Tashkent',
    delivery: {
      isAvailable: true,
      methods: [
        {
          type: 'standard',
          isAvailable: true,
          cost: 40000,
          freeShippingThreshold: 350000,
          estimatedDays: { min: 4, max: 5 },
          workingHours: { start: '09:00', end: '18:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      ]
    },
    pickupPoints: [
      {
        name: {
          ru: 'Центральный пункт выдачи',
          uz: 'Markaziy berish punkti',
          en: 'Central Pickup Point'
        },
        address: {
          ru: 'ул. Хорезмская, 40',
          uz: 'Xorazm ko\'chasi, 40',
          en: 'Khorezm Street, 40'
        },
        coordinates: {
          latitude: 41.5500,
          longitude: 60.6333
        },
        phone: '+998908901234',
        workingHours: {
          weekdays: { start: '09:00', end: '18:00' },
          weekends: { start: '10:00', end: '17:00' }
        },
        isActive: true
      }
    ],
    pricing: {
      adjustmentFactor: 0.82,
      currency: 'UZS'
    },
    isActive: true,
    isVisible: true,
    order: 8,
    features: ['major_city'],
    contacts: {
      phone: '+998622000000',
      email: 'urgench@tendo.uz',
      address: {
        ru: 'г. Ургенч, ул. Хорезмская, 1',
        uz: 'Urganch shahri, Xorazm ko\'chasi, 1',
        en: 'Urgench city, Khorezm Street, 1'
      }
    },
    metaTitle: {
      ru: 'Ургенч - древний город Хорезма',
      uz: 'Urganch - Xorazm qadimiy shahri',
      en: 'Urgench - Ancient City of Khorezm'
    },
    metaDescription: {
      ru: 'Ургенч - административный центр Хорезмской области',
      uz: 'Urganch - Xorazm viloyatining ma\'muriy markazi',
      en: 'Urgench - administrative center of Khorezm region'
    }
  },
  {
    name: {
      ru: 'Карши',
      uz: 'Qarshi',
      en: 'Karshi'
    },
    code: 'karshi',
    coordinates: {
      latitude: 38.8333,
      longitude: 65.8000
    },
    region: {
      ru: 'Кашкадарьинская область',
      uz: 'Qashqadaryo viloyati',
      en: 'Kashkadarya Region'
    },
    population: 278000,
    timezone: 'Asia/Tashkent',
    delivery: {
      isAvailable: true,
      methods: [
        {
          type: 'standard',
          isAvailable: true,
          cost: 35000,
          freeShippingThreshold: 300000,
          estimatedDays: { min: 3, max: 4 },
          workingHours: { start: '09:00', end: '18:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      ]
    },
    pickupPoints: [
      {
        name: {
          ru: 'Центральный пункт выдачи',
          uz: 'Markaziy berish punkti',
          en: 'Central Pickup Point'
        },
        address: {
          ru: 'ул. Мустакиллик, 50',
          uz: 'Mustaqillik ko\'chasi, 50',
          en: 'Mustaqillik Street, 50'
        },
        coordinates: {
          latitude: 38.8333,
          longitude: 65.8000
        },
        phone: '+998909012345',
        workingHours: {
          weekdays: { start: '09:00', end: '18:00' },
          weekends: { start: '10:00', end: '17:00' }
        },
        isActive: true
      }
    ],
    pricing: {
      adjustmentFactor: 0.85,
      currency: 'UZS'
    },
    isActive: true,
    isVisible: true,
    order: 9,
    features: ['major_city'],
    contacts: {
      phone: '+998752000000',
      email: 'karshi@tendo.uz',
      address: {
        ru: 'г. Карши, ул. Мустакиллик, 1',
        uz: 'Qarshi shahri, Mustaqillik ko\'chasi, 1',
        en: 'Karshi city, Mustaqillik Street, 1'
      }
    },
    metaTitle: {
      ru: 'Карши - центр Кашкадарьи',
      uz: 'Qarshi - Qashqadaryo markazi',
      en: 'Karshi - Center of Kashkadarya'
    },
    metaDescription: {
      ru: 'Карши - административный центр Кашкадарьинской области',
      uz: 'Qarshi - Qashqadaryo viloyatining ma\'muriy markazi',
      en: 'Karshi - administrative center of Kashkadarya region'
    }
  },
  {
    name: {
      ru: 'Термез',
      uz: 'Termiz',
      en: 'Termez'
    },
    code: 'termez',
    coordinates: {
      latitude: 37.2167,
      longitude: 67.2833
    },
    region: {
      ru: 'Сурхандарьинская область',
      uz: 'Surxondaryo viloyati',
      en: 'Surkhandarya Region'
    },
    population: 140385,
    timezone: 'Asia/Tashkent',
    delivery: {
      isAvailable: true,
      methods: [
        {
          type: 'standard',
          isAvailable: true,
          cost: 40000,
          freeShippingThreshold: 350000,
          estimatedDays: { min: 4, max: 5 },
          workingHours: { start: '09:00', end: '18:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      ]
    },
    pickupPoints: [
      {
        name: {
          ru: 'Центральный пункт выдачи',
          uz: 'Markaziy berish punkti',
          en: 'Central Pickup Point'
        },
        address: {
          ru: 'ул. Юнус Раджаби, 60',
          uz: 'Yunus Rajabiy ko\'chasi, 60',
          en: 'Yunus Rajabiy Street, 60'
        },
        coordinates: {
          latitude: 37.2167,
          longitude: 67.2833
        },
        phone: '+998911234567',
        workingHours: {
          weekdays: { start: '09:00', end: '18:00' },
          weekends: { start: '10:00', end: '17:00' }
        },
        isActive: true
      }
    ],
    pricing: {
      adjustmentFactor: 0.83,
      currency: 'UZS'
    },
    isActive: true,
    isVisible: true,
    order: 10,
    features: ['border_city', 'major_city'],
    contacts: {
      phone: '+998762000000',
      email: 'termez@tendo.uz',
      address: {
        ru: 'г. Термез, ул. Юнус Раджаби, 1',
        uz: 'Termiz shahri, Yunus Rajabiy ko\'chasi, 1',
        en: 'Termez city, Yunus Rajabiy Street, 1'
      }
    },
    metaTitle: {
      ru: 'Термез - южные ворота Узбекистана',
      uz: 'Termiz - O\'zbekiston janubiy darvozasi',
      en: 'Termez - Southern Gate of Uzbekistan'
    },
    metaDescription: {
      ru: 'Термез - город на границе с Афганистаном, центр Сурхандарьинской области',
      uz: 'Termiz - Afg\'oniston bilan chegaradagi shahar, Surxondaryo viloyati markazi',
      en: 'Termez - city on the border with Afghanistan, center of Surkhandarya region'
    }
  }
];

// Данные для админа
const adminData = {
  email: 'admin@tendo.uz',
  password: 'Admin123!@#',
  firstName: 'Админ',
  lastName: 'Tendo',
  phone: '+998901234567',
  role: 'super_admin',
  isActive: true,
  isVerified: true,
  preferences: {
    language: 'ru',
    currency: 'UZS',
    notifications: {
      email: true,
      sms: true,
      marketing: false
    },
    theme: 'light'
  },
  permissions: {
    canManageUsers: true,
    canManageProducts: true,
    canManageOrders: true,
    canManageSettings: true,
    canViewAnalytics: true,
    canManagePayments: true,
    canManageSellers: true,
    canManageCategories: true,
    canManageReviews: true
  }
};

/**
 * Подключение к базе данных
 */
async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tendomarketuz';
    console.log('🔄 Подключение к MongoDB...');

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Подключено к MongoDB');
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error.message);
    process.exit(1);
  }
}

/**
 * Создание городов
 */
async function createCities() {
  try {
    console.log('🏙️ Создание городов...');

    for (const cityData of uzbekistanCities) {
      const existingCity = await City.findOne({ code: cityData.code });

      if (existingCity) {
        console.log(`⚠️ Город ${cityData.name.ru} уже существует, пропускаем...`);
        continue;
      }

      const city = new City(cityData);
      await city.save();
      console.log(`✅ Создан город: ${cityData.name.ru}`);
    }

    console.log('✅ Все города созданы!');
  } catch (error) {
    console.error('❌ Ошибка создания городов:', error.message);
  }
}

/**
 * Создание админа
 */
async function createAdmin() {
  try {
    console.log('👨‍💼 Создание админ аккаунта...');

    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log(`⚠️ Админ ${adminData.email} уже существует, пропускаем...`);
      return;
    }

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Админ аккаунт создан!');
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔑 Пароль: ${adminData.password}`);
    console.log(`📱 Телефон: ${adminData.phone}`);

  } catch (error) {
    console.error('❌ Ошибка создания админа:', error.message);
  }
}

/**
 * Основная функция
 */
async function main() {
  try {
    console.log('🚀 НАЧАЛО НАСТРОЙКИ БАЗЫ ДАННЫХ');
    console.log('=====================================');

    // Подключение к БД
    await connectDB();

    // Создание городов
    await createCities();

    // Создание админа
    await createAdmin();

    console.log('=====================================');
    console.log('🎉 НАСТРОЙКА ЗАВЕРШЕНА УСПЕШНО!');
    console.log('');
    console.log('📊 СОЗДАНО:');
    console.log(`   🏙️ 10 городов Узбекистана`);
    console.log(`   👨‍💼 1 админ аккаунт`);
    console.log('');
    console.log('🔐 ДАННЫЕ ДЛЯ ВХОДА В АДМИН ПАНЕЛЬ:');
    console.log(`   🌐 URL: https://admin.tendo.uz`);
    console.log(`   📧 Email: admin@tendo.uz`);
    console.log(`   🔑 Пароль: Admin123!@#`);

  } catch (error) {
    console.error('💥 КРИТИЧЕСКАЯ ОШИБКА:', error.message);
  } finally {
    // Закрываем соединение
    await mongoose.connection.close();
    console.log('🔌 Соединение с БД закрыто');
    process.exit(0);
  }
}

// Запуск скрипта
if (require.main === module) {
  main();
}

module.exports = {
  createCities,
  createAdmin,
  uzbekistanCities,
  adminData
};
