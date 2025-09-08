/**
 * 🚀 TENDO MARKET BACKEND API
 * Основной файл сервера для интернет-магазина аксессуаров
 */

// Загружаем переменные окружения в самом начале
require('dotenv').config();

// Переменные окружения загружены
const jwt = require('jsonwebtoken');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { metricsMiddleware, metricsHandler } = require('./middleware/metrics');

// Импорт конфигураций
const { connectDB } = require('./config/database');
// Queues: enable only when explicitly requested
const ENABLE_QUEUES = process.env.ENABLE_QUEUES === 'true';
if (ENABLE_QUEUES) {
  try {
    require('./queues/webhooks');
    console.log('📬 Queues enabled');
  } catch (e) {
    console.error('❌ Queues init error:', e.message);
  }
} else {
  console.log('📪 Queues disabled (set ENABLE_QUEUES=true to enable)');
}

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const cityRoutes = require('./routes/cities');
const sellerApplicationRoutes = require('./routes/sellerApplications');
const sellerRoutes = require('./routes/sellers');
const chatRoutes = require('./routes/chat');
const favoritesRoutes = require('./routes/favorites');
const reviewsRoutes = require('./routes/reviews');
const bannersRoutes = require('./routes/banners');
const contactRoutes = require('./routes/contacts');
const paymentsRoutes = require('./routes/payments');

// Импорт middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { protect } = require('./middleware/auth');

// JWT секрет (демо значение для разработки)
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo_development_only_change_in_production_2025';

// Конфигурация запуска проекта
const LAUNCH_CONFIG = {
  isLaunched: process.env.IS_LAUNCHED === 'true' || false,
  launchDate: process.env.LAUNCH_DATE ? new Date(process.env.LAUNCH_DATE) : new Date('2025-09-15T00:00:00Z'), // Дата запуска
  preLaunchEnabled: process.env.PRE_LAUNCH_ENABLED !== 'false' // По умолчанию включена
};

// Функция автоматического отключения pre-launch при достижении даты запуска
function checkLaunchStatus() {
  const now = new Date();

  // Если текущая дата >= даты запуска И pre-launch еще включен
  if (now >= LAUNCH_CONFIG.launchDate && LAUNCH_CONFIG.preLaunchEnabled) {
    console.log('🚀 ВРЕМЯ ЗАПУСКА НАСТУПИЛО! Автоматически отключаю pre-launch страницу');
    LAUNCH_CONFIG.preLaunchEnabled = false;
    LAUNCH_CONFIG.isLaunched = true;

    console.log(`📅 Дата запуска: ${LAUNCH_CONFIG.launchDate.toISOString()}`);
    console.log(`⚙️ Pre-launch режим: ОТКЛЮЧЕН`);
    console.log(`✅ Проект: ЗАПУЩЕН`);
  }
}

// Проверяем статус запуска при запуске сервера
checkLaunchStatus();

// Проверяем статус каждые 30 секунд
setInterval(checkLaunchStatus, 30000);

// Функция генерации JWT токена
const generateToken = (userData) => {
  return jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });
};

// Middleware для проверки JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Токен не предоставлен'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('JWT Error:', err.message);
      return res.status(401).json({
        success: false,
        error: 'Неверный токен'
      });
    }

    req.user = user;
    next();
  });
};

// Создание Express приложения
const app = express();

// 🔐 БЕЗОПАСНОСТЬ
app.use(helmet({
  contentSecurityPolicy: false, // Отключаем CSP для гибкости
  crossOriginEmbedderPolicy: false
}));

// 📊 СЖАТИЕ ОТВЕТОВ
app.use(compression());

// 📈 METRICS
app.use(metricsMiddleware);

// 🌐 CORS НАСТРОЙКИ (ТОЛЬКО ДОВЕРЕННЫЕ ДОМЕНЫ)
const corsOptions = {
  origin: function (origin, callback) {
    // Разрешенные домены для продакшена
    const allowedOrigins = [
      'https://tendo.uz',
      'https://www.tendo.uz',
      'https://admin.tendo.uz',
      'https://api.tendo.uz'
    ];

    // Для разработки разрешаем localhost
    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.push(
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:5173'
      );
    }

    // Разрешаем запросы без origin (например, мобильные приложения)
    if (!origin) return callback(null, true);

    // Проверяем, разрешен ли домен
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🚫 Заблокирован запрос с домена: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 🚦 ОГРАНИЧЕНИЕ ЗАПРОСОВ (БОЛЕЕ МЯГКИЕ ДЛЯ РАЗРАБОТКИ)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута вместо 15
  max: 1000, // 1000 запросов вместо 100
  message: {
    error: 'Слишком много запросов, попробуйте позже',
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 🔐 БОЛЕЕ МЯГКИЕ ОГРАНИЧЕНИЯ ДЛЯ АДМИН АУТЕНТИФИКАЦИИ
const adminAuthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 100, // 100 попыток за минуту
  message: {
    error: 'Слишком много попыток входа, попробуйте позже',
    message: 'Too many login attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Применяем специальный лимит для админ аутентификации
app.use('/api/v1/auth/admin', adminAuthLimiter);

// Обычный лимит для остальных API
app.use('/api/', limiter);

// 📝 ЛОГИРОВАНИЕ
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 🔄 ПАРСИНГ ДАННЫХ
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 📍 API МАРШРУТЫ
const apiVersion = process.env.API_VERSION || 'v1';

// 🏥 HEALTH CHECK ENDPOINT
app.get(`/api/${apiVersion}/health`, (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Tendo Market API работает',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 📈 METRICS ENDPOINT
app.get('/metrics', metricsHandler);

// 🔐 ЗАЩИЩЕННЫЕ МАРШРУТЫ (требуют аутентификации)
app.use(`/api/${apiVersion}/users`, authenticateToken);
app.use(`/api/${apiVersion}/orders`, authenticateToken);
app.use(`/api/${apiVersion}/notifications`, authenticateToken);

// Removed conflicting demo categories endpoint - using proper routes instead

// 🛍️ FEATURED ТОВАРЫ (отключено - используем MongoDB)
// app.get(`/api/${apiVersion}/products/featured`, ...);

// 🔐 ДЕМО АВТОРИЗАЦИЯ (отключено - используем MongoDB)
// app.post(`/api/${apiVersion}/auth/register`, ...);

// 🔐 ДЕМО ЛОГИН (отключено - используем MongoDB)
// app.post(`/api/${apiVersion}/auth/login`, ...);

// 🔍 ПРОВЕРКА ТОКЕНА
app.get(`/api/${apiVersion}/auth/me`, protect, async (req, res) => {
  try {
    const User = require('./models/User');
    const Seller = require('./models/Seller');

    // Загружаем пользователя из БД (без сохранений, только чтение)
    const freshUser = await User.findById(req.user._id).select('-password').lean();

    if (!freshUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Определяем роль без модификации документа
    let effectiveRole = freshUser.role || req.user.role;
    if (effectiveRole !== 'seller') {
      try {
        const seller = await Seller.findOne({ userId: freshUser._id }).select('_id status').lean();
        if (seller) effectiveRole = 'seller';
      } catch (e) {
        // игнорируем ошибки поиска продавца, не падаем
      }
    }

    console.log('✅ Пользователь проверен через БД:', { id: String(freshUser._id), role: effectiveRole });
    res.json({ success: true, user: { ...freshUser, role: effectiveRole } });
  } catch (e) {
    console.error('auth/me error:', e);
    res.status(500).json({ success: false, error: 'Auth check failed' });
  }
});

// 🔐 АДМИНСКАЯ АУТЕНТИФИКАЦИЯ (отключено - используем MongoDB)
// app.post(`/api/${apiVersion}/auth/admin/login`, ...);

// 🚀 ENDPOINTS ДЛЯ УПРАВЛЕНИЯ ЗАПУСКОМ ПРОЕКТА

// Получить статус запуска (публичный)
app.get(`/api/${apiVersion}/launch/status`, (req, res) => {
  // Проверяем статус перед отправкой ответа
  checkLaunchStatus();

  const now = new Date();
  const timeLeft = LAUNCH_CONFIG.isLaunched ? 0 : Math.max(0, LAUNCH_CONFIG.launchDate - now);

  res.json({
    success: true,
    data: {
      isLaunched: LAUNCH_CONFIG.isLaunched,
      launchDate: LAUNCH_CONFIG.launchDate,
      preLaunchEnabled: LAUNCH_CONFIG.preLaunchEnabled,
      timeLeft: timeLeft,
      days: Math.floor(timeLeft / (1000 * 60 * 60 * 24)),
      hours: Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((timeLeft % (1000 * 60)) / 1000)
    }
  });
});

// Обновить статус запуска (только админ)
app.put(`/api/${apiVersion}/launch/status`, authenticateToken, (req, res) => {
  // Проверяем права админа
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({
      success: false,
      error: 'Недостаточно прав для выполнения действия'
    });
  }

  const { isLaunched, launchDate, preLaunchEnabled } = req.body;

  if (typeof isLaunched === 'boolean') {
    LAUNCH_CONFIG.isLaunched = isLaunched;
    console.log(`🚀 Статус запуска изменен на: ${isLaunched ? 'ЗАПУЩЕН' : 'PRE-LAUNCH'}`);
  }

  if (launchDate) {
    LAUNCH_CONFIG.launchDate = new Date(launchDate);
    console.log(`📅 Дата запуска установлена: ${LAUNCH_CONFIG.launchDate.toISOString()}`);
  }

  if (typeof preLaunchEnabled === 'boolean') {
    LAUNCH_CONFIG.preLaunchEnabled = preLaunchEnabled;
    console.log(`⚙️ Pre-launch режим: ${preLaunchEnabled ? 'ВКЛЮЧЕН' : 'ОТКЛЮЧЕН'}`);
  }

  res.json({
    success: true,
    message: 'Статус запуска обновлен',
    data: {
      isLaunched: LAUNCH_CONFIG.isLaunched,
      launchDate: LAUNCH_CONFIG.launchDate,
      preLaunchEnabled: LAUNCH_CONFIG.preLaunchEnabled
    }
  });
});

// Проверка админ токена
app.get(`/api/${apiVersion}/auth/admin/verify`, authenticateToken, (req, res) => {
  console.log('✅ Админ токен проверен успешно');

  // Проверяем, что пользователь админ
  if (req.user.role === 'admin') {
    res.json({
      success: true,
      user: req.user
    });
  } else {
    res.status(403).json({
      success: false,
      error: 'Недостаточно прав'
    });
  }
});

// 📁 СТАТИЧЕСКИЕ ФАЙЛЫ
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
  }
}));
app.use('/public', express.static(path.join(__dirname, 'public')));

// 🏥 HEALTH CHECK
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Tendo Market API работает нормально',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 🏥 HEALTH CHECK для API
app.get(`/api/${apiVersion}/health`, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Tendo Market API работает нормально',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/products`, productRoutes);
app.use(`/api/${apiVersion}/categories`, categoryRoutes);
app.use(`/api/${apiVersion}/orders`, orderRoutes);
app.use(`/api/${apiVersion}/users`, userRoutes);
app.use(`/api/${apiVersion}/customers`, require('./routes/customers'));
app.use(`/api/${apiVersion}/promotions`, require('./routes/promotions'));
app.use(`/api/${apiVersion}/payouts`, require('./routes/payouts'));
app.use(`/api/${apiVersion}/inventory`, require('./routes/inventory'));
app.use(`/api/${apiVersion}/support`, require('./routes/support'));
app.use(`/api/${apiVersion}/payments`, require('./routes/payments'));
app.use(`/api/${apiVersion}/admin`, require('./routes/admin'));
app.use(`/api/${apiVersion}/upload`, uploadRoutes);
app.use(`/api/${apiVersion}/cities`, cityRoutes);
app.use(`/api/${apiVersion}/seller-applications`, sellerApplicationRoutes);
app.use(`/api/${apiVersion}/sellers`, sellerRoutes);
app.use(`/api/${apiVersion}/chats`, chatRoutes);
app.use(`/api/${apiVersion}/favorites`, favoritesRoutes);
app.use(`/api/${apiVersion}/reviews`, reviewsRoutes);
app.use(`/api/${apiVersion}/banners`, bannersRoutes);
app.use(`/api/${apiVersion}/contacts`, require('./routes/contacts'));
app.use(`/api/${apiVersion}/notifications`, require('./routes/notifications'));
app.use(`/api/${apiVersion}/search`, require('./routes/search')); // Продвинутый поиск
app.use(`/api/${apiVersion}/analytics`, require('./routes/analytics')); // Аналитика
app.use(`/api/${apiVersion}/promotions`, require('./routes/promotions')); // Промокоды
app.use(`/api/${apiVersion}/webhooks`, require('./routes/webhooks'));

// 📋 ГЛАВНАЯ СТРАНИЦА API
app.get('/', (req, res) => {
  res.json({
    message: '🛍️ Добро пожаловать в Tendo Market API',
    version: apiVersion,
    documentation: `/api/${apiVersion}/docs`,
    health: '/health',
    endpoints: {
      auth: `/api/${apiVersion}/auth`,
      products: `/api/${apiVersion}/products`,
      categories: `/api/${apiVersion}/categories`,
      orders: `/api/${apiVersion}/orders`,
      users: `/api/${apiVersion}/users`,
      upload: `/api/${apiVersion}/upload`,
      cities: `/api/${apiVersion}/cities`,
      'seller-applications': `/api/${apiVersion}/seller-applications`,
      sellers: `/api/${apiVersion}/sellers`,
      chats: `/api/${apiVersion}/chats`
    }
  });
});

// 🔍 ДОКУМЕНТАЦИЯ API (заглушка)
app.get(`/api/${apiVersion}/docs`, (req, res) => {
  res.json({
    message: 'API Documentation будет добавлена позже',
    contact: 'support@chexol.uz'
  });
});

// ❌ ОБРАБОТКА ОШИБОК
app.use(notFound);
app.use(errorHandler);

// 🚀 ЗАПУСК СЕРВЕРА
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Подключение к базе данных
    console.log('🗄️  Подключение к MongoDB...');
    await connectDB();
    
    // Запуск сервера
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('🟢 ==========================================');
      console.log('🚀    CHEXOL.UZ BACKEND API ЗАПУЩЕН');
      console.log('🟢 ==========================================');
      console.log(`📍 Сервер:        http://localhost:${PORT}`);
      console.log(`🌐 API:           http://localhost:${PORT}/api/${apiVersion}`);
      console.log(`🏥 Health:        http://localhost:${PORT}/health`);
      console.log(`📋 Документация:  http://localhost:${PORT}/api/${apiVersion}/docs`);
      console.log(`🌍 Среда:         ${process.env.NODE_ENV || 'development'}`);
      console.log('🟢 ==========================================');
      console.log('');
    });

    // Корректное закрытие сервера
    process.on('SIGTERM', () => {
      console.log('🔄 Получен сигнал SIGTERM, закрытие сервера...');
      server.close((err) => {
        if (err) {
          console.error('❌ Ошибка при закрытии сервера:', err);
          process.exit(1);
        }
        console.log('✅ Сервер корректно закрыт');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🔄 Получен сигнал SIGINT, закрытие сервера...');
      server.close((err) => {
        if (err) {
          console.error('❌ Ошибка при закрытии сервера:', err);
          process.exit(1);
        }
        console.log('✅ Сервер корректно закрыт');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error.message);
    process.exit(1);
  }
};

// Запуск сервера
startServer();

module.exports = app;
