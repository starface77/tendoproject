const { validationResult } = require('express-validator');
const City = require('../models/City');
const User = require('../models/User');
const Order = require('../models/Order');

/**
 * 🏙️ КОНТРОЛЛЕР ГОРОДОВ
 * Управление городами, геолокация, доставка
 */

// @desc    Получить все активные города
// @route   GET /api/v1/cities
// @access  Public
const getCities = async (req, res) => {
  try {
    const { language = 'ru' } = req.query;

    const cities = await City.find({ isActive: true, isVisible: true })
      .sort({ order: 1 })
      .select(`name.${language} code coordinates delivery.isAvailable`)
      .lean();

    res.status(200).json({
      success: true,
      count: cities.length,
      data: cities.map(city => ({
        code: city.code,
        name: city.name[language],
        coordinates: city.coordinates,
        deliveryAvailable: city.delivery?.isAvailable || false
      }))
    });

  } catch (error) {
    console.error('Get Cities Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения городов'
    });
  }
};

// @desc    Получить город по коду
// @route   GET /api/v1/cities/:code
// @access  Public
const getCity = async (req, res) => {
  try {
    const { language = 'ru' } = req.query;

    const city = await City.findOne({
      code: req.params.code,
      isActive: true
    }).lean();

    if (!city) {
      return res.status(404).json({
        success: false,
        error: 'Город не найден'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        code: city.code,
        name: city.name[language],
        coordinates: city.coordinates,
        delivery: city.delivery,
        pickupPoints: city.pickupPoints,
        timezone: city.timezone,
        population: city.population
      }
    });

  } catch (error) {
    console.error('Get City Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения города'
    });
  }
};

// @desc    Создать город
// @route   POST /api/v1/cities/admin
// @access  Private (Super Admin)
const createCity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    const existingCity = await City.findOne({ code: req.body.code });
    if (existingCity) {
      return res.status(400).json({
        success: false,
        error: 'Город с таким кодом уже существует'
      });
    }

    const city = new City(req.body);
    await city.save();

    res.status(201).json({
      success: true,
      message: 'Город успешно создан',
      data: city
    });

  } catch (error) {
    console.error('Create City Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания города'
    });
  }
};

// @desc    Обновить город
// @route   PUT /api/v1/cities/admin/:id
// @access  Private (Super Admin)
const updateCity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    const city = await City.findById(req.params.id);

    if (!city) {
      return res.status(404).json({
        success: false,
        error: 'Город не найден'
      });
    }

    const updatedCity = await City.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Город успешно обновлен',
      data: updatedCity
    });

  } catch (error) {
    console.error('Update City Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления города'
    });
  }
};

// @desc    Удалить город
// @route   DELETE /api/v1/cities/admin/:id
// @access  Private (Super Admin)
const deleteCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);

    if (!city) {
      return res.status(404).json({
        success: false,
        error: 'Город не найден'
      });
    }

    // Проверяем наличие пользователей в городе
    const usersCount = await User.countDocuments({ city: city.code });
    if (usersCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Нельзя удалить город с пользователями'
      });
    }

    // Проверяем наличие заказов в городе
    const ordersCount = await Order.countDocuments({ 'shippingAddress.city': city.code });
    if (ordersCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Нельзя удалить город с заказами'
      });
    }

    await City.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Город успешно удален'
    });

  } catch (error) {
    console.error('Delete City Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления города'
    });
  }
};

// @desc    Определить город по координатам
// @route   POST /api/v1/cities/detect
// @access  Public
const detectCity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    const { latitude, longitude } = req.body;

    // Используем геопространственный запрос для поиска ближайшего города
    const nearestCities = await City.find({
      isActive: true,
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: 100000 // 100km
        }
      }
    }).limit(3);

    if (nearestCities.length === 0) {
      // Если не найдено близких городов, возвращаем Ташкент по умолчанию
      const defaultCity = await City.findOne({ code: 'tashkent' });
      return res.status(200).json({
        success: true,
        data: {
          detected: false,
          city: defaultCity ? {
            code: defaultCity.code,
            name: defaultCity.name,
            coordinates: defaultCity.coordinates
          } : null,
          message: 'Город не определен, используется Ташкент по умолчанию'
        }
      });
    }

    // Возвращаем ближайший город
    const nearestCity = nearestCities[0];

    res.status(200).json({
      success: true,
      data: {
        detected: true,
        city: {
          code: nearestCity.code,
          name: nearestCity.name,
          coordinates: nearestCity.coordinates,
          distance: calculateDistance(
            latitude, longitude,
            nearestCity.coordinates.latitude,
            nearestCity.coordinates.longitude
          )
        },
        alternatives: nearestCities.slice(1).map(city => ({
          code: city.code,
          name: city.name,
          coordinates: city.coordinates,
          distance: calculateDistance(
            latitude, longitude,
            city.coordinates.latitude,
            city.coordinates.longitude
          )
        }))
      }
    });

  } catch (error) {
    console.error('Detect City Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка определения города'
    });
  }
};

// @desc    Получить информацию о доставке в город
// @route   GET /api/v1/cities/:code/delivery
// @access  Public
const getDeliveryInfo = async (req, res) => {
  try {
    const { language = 'ru' } = req.query;

    const city = await City.findOne({
      code: req.params.code,
      isActive: true
    }).select('name delivery pickupPoints');

    if (!city) {
      return res.status(404).json({
        success: false,
        error: 'Город не найден'
      });
    }

    if (!city.delivery.isAvailable) {
      return res.status(200).json({
        success: true,
        data: {
          cityName: city.name[language],
          deliveryAvailable: false,
          message: 'Доставка в этот город пока недоступна'
        }
      });
    }

    const deliveryMethods = city.delivery.methods
      .filter(method => method.isAvailable)
      .map(method => ({
        type: method.type,
        cost: method.cost,
        freeShippingThreshold: method.freeShippingThreshold,
        estimatedDays: method.estimatedDays,
        workingHours: method.workingHours,
        workingDays: method.workingDays
      }));

    const activePickupPoints = city.pickupPoints
      .filter(point => point.isActive)
      .map(point => ({
        name: point.name[language],
        address: point.address[language],
        coordinates: point.coordinates,
        phone: point.phone,
        workingHours: point.workingHours,
        notes: point.notes[language]
      }));

    res.status(200).json({
      success: true,
      data: {
        cityName: city.name[language],
        deliveryAvailable: true,
        methods: deliveryMethods,
        zones: city.delivery.zones,
        pickupPoints: activePickupPoints
      }
    });

  } catch (error) {
    console.error('Get Delivery Info Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения информации о доставке'
    });
  }
};

// @desc    Получить статистику городов
// @route   GET /api/v1/cities/admin/stats
// @access  Private (Admin)
const getCityStats = async (req, res) => {
  try {
    const stats = await City.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          withDelivery: { $sum: { $cond: [{ $eq: ['$delivery.isAvailable', true] }, 1, 0] } },
          totalPopulation: { $sum: '$population' }
        }
      }
    ]);

    // Статистика пользователей по городам
    const userStats = await User.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Статистика заказов по городам
    const orderStats = await Order.aggregate([
      { $group: { _id: '$shippingAddress.city', count: { $sum: 1 }, totalAmount: { $sum: '$pricing.total' } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          active: 0,
          withDelivery: 0,
          totalPopulation: 0
        },
        usersByCity: userStats,
        ordersByCity: orderStats
      }
    });

  } catch (error) {
    console.error('City Stats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения статистики городов'
    });
  }
};

// Утилита для расчета расстояния между координатами
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Радиус Земли в км
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 100) / 100; // Округляем до 2 знаков
};

module.exports = {
  getCities,
  getCity,
  createCity,
  updateCity,
  deleteCity,
  detectCity,
  getDeliveryInfo,
  getCityStats
};
