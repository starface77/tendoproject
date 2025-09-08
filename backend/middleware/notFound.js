/**
 * 🔍 ОБРАБОТЧИК 404
 * Обработка несуществующих маршрутов
 */

const notFound = (req, res, next) => {
  const error = new Error(`🔍 Маршрут не найден - ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    error: 'Маршрут не найден',
    message: `Маршрут ${req.method} ${req.originalUrl} не существует`,
    availableRoutes: {
      auth: '/api/v1/auth',
      products: '/api/v1/products',
      categories: '/api/v1/categories',
      orders: '/api/v1/orders',
      users: '/api/v1/users',
      cities: '/api/v1/cities',
      upload: '/api/v1/upload'
    }
  });
};

module.exports = notFound;
