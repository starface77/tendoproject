#!/usr/bin/env node

/**
 * 🏙️ CITIES INITIALIZATION SCRIPT
 * Создание базовых городов Узбекистана в БД
 */

require('dotenv').config();
const mongoose = require('mongoose');
const City = require('../models/City');

const cities = [
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
    population: 2500000,
    features: ['capital', 'major_city'],
    delivery: {
      isAvailable: true,
      methods: [
        {
          type: 'standard',
          isAvailable: true,
          cost: 25000,
          freeShippingThreshold: 200000,
          estimatedDays: { min: 1, max: 2 },
          workingHours: { start: '09:00', end: '21:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        {
          type: 'express',
          isAvailable: true,
          cost: 45000,
          freeShippingThreshold: 500000,
          estimatedDays: { min: 0, max: 1 },
          workingHours: { start: '10:00', end: '20:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      ]
    },
    order: 1
  },
  {
    name: {
      ru: 'Самарканд',
      uz: 'Samarqand',
      en: 'Samarkand'
    },
    code: 'samarkand',
    coordinates: {
      latitude: 39.6270,
      longitude: 66.9750
    },
    region: {
      ru: 'Самаркандская область',
      uz: 'Samarqand viloyati',
      en: 'Samarkand Region'
    },
    population: 550000,
    features: ['tourist_destination', 'major_city'],
    delivery: {
      isAvailable: true,
      methods: [
        {
          type: 'standard',
          isAvailable: true,
          cost: 30000,
          freeShippingThreshold: 250000,
          estimatedDays: { min: 2, max: 3 },
          workingHours: { start: '09:00', end: '19:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      ]
    },
    order: 2
  },
  {
    name: {
      ru: 'Бухара',
      uz: 'Buxoro',
      en: 'Bukhara'
    },
    code: 'bukhara',
    coordinates: {
      latitude: 39.7747,
      longitude: 64.4286
    },
    region: {
      ru: 'Бухарская область',
      uz: 'Buxoro viloyati',
      en: 'Bukhara Region'
    },
    population: 280000,
    features: ['tourist_destination'],
    delivery: {
      isAvailable: true,
      methods: [
        {
          type: 'standard',
          isAvailable: true,
          cost: 35000,
          freeShippingThreshold: 300000,
          estimatedDays: { min: 2, max: 4 },
          workingHours: { start: '09:00', end: '18:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      ]
    },
    order: 3
  },
  {
    name: {
      ru: 'Андижан',
      uz: 'Andijon',
      en: 'Andijan'
    },
    code: 'andijan',
    coordinates: {
      latitude: 40.7821,
      longitude: 72.3442
    },
    region: {
      ru: 'Андижанская область',
      uz: 'Andijon viloyati',
      en: 'Andijan Region'
    },
    population: 460000,
    features: ['major_city'],
    delivery: {
      isAvailable: true,
      methods: [
        {
          type: 'standard',
          isAvailable: true,
          cost: 40000,
          freeShippingThreshold: 300000,
          estimatedDays: { min: 3, max: 5 },
          workingHours: { start: '09:00', end: '18:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      ]
    },
    order: 4
  },
  {
    name: {
      ru: 'Наманган',
      uz: 'Namangan',
      en: 'Namangan'
    },
    code: 'namangan',
    coordinates: {
      latitude: 41.0000,
      longitude: 71.6667
    },
    region: {
      ru: 'Наманганская область',
      uz: 'Namangan viloyati',
      en: 'Namangan Region'
    },
    population: 470000,
    delivery: {
      isAvailable: true,
      methods: [
        {
          type: 'standard',
          isAvailable: true,
          cost: 40000,
          freeShippingThreshold: 300000,
          estimatedDays: { min: 3, max: 5 },
          workingHours: { start: '09:00', end: '18:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      ]
    },
    order: 5
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
      longitude: 71.7840
    },
    region: {
      ru: 'Ферганская область',
      uz: 'Farg\'ona viloyati',
      en: 'Fergana Region'
    },
    population: 320000,
    delivery: {
      isAvailable: true,
      methods: [
        {
          type: 'standard',
          isAvailable: true,
          cost: 40000,
          freeShippingThreshold: 300000,
          estimatedDays: { min: 3, max: 5 },
          workingHours: { start: '09:00', end: '18:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      ]
    },
    order: 6
  }
];

const initializeCities = async () => {
  try {
    console.log('🏙️ Инициализация городов...');
    
    // Подключение к БД
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tendomarketuz');
    console.log('✅ Подключение к БД');

    let created = 0;
    let exists = 0;

    for (const cityData of cities) {
      const existingCity = await City.findOne({ code: cityData.code });
      
      if (!existingCity) {
        const city = new City(cityData);
        await city.save();
        console.log(`✅ Город "${cityData.name.ru}" создан`);
        created++;
      } else {
        console.log(`ℹ️  Город "${cityData.name.ru}" уже существует`);
        exists++;
      }
    }

    console.log(`\n🎉 Инициализация завершена:`);
    console.log(`✅ Создано: ${created}`);
    console.log(`ℹ️  Существовало: ${exists}`);
    console.log(`📊 Всего городов: ${created + exists}`);

  } catch (error) {
    console.error('❌ Ошибка инициализации городов:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Запуск скрипта
if (require.main === module) {
  initializeCities();
}

module.exports = initializeCities;

