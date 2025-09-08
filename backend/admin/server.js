/**
 * 🛠️ CHEXOL.UZ ADMIN PANEL
 * Административная панель для управления интернет-магазином
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './.env' });

// Импорт конфигураций
const { connectDB } = require('../config/database');

// Импорт админских маршрутов
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const settingsRoutes = require('./routes/settings');

// Создание Express приложения
const app = express();

// 🌐 CORS для админки
const corsOptions = {
  origin: [
    process.env.ADMIN_FRONTEND_URL || 'http://localhost:3001',
    'http://localhost:3001'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// 🔄 ПАРСИНГ ДАННЫХ
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 📁 СТАТИЧЕСКИЕ ФАЙЛЫ (админская панель)
app.use(express.static(path.join(__dirname, 'public')));

// 🏥 HEALTH CHECK
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Chexol.uz Admin Panel работает нормально',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 📍 АДМИНСКИЕ МАРШРУТЫ
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

// 404 для API маршрутов
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// 📋 ГЛАВНАЯ СТРАНИЦА АДМИНКИ И SPA МАРШРУТЫ
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🚀 ЗАПУСК АДМИНСКОГО СЕРВЕРА
const PORT = process.env.ADMIN_PORT || 5001;

const startAdminServer = async () => {
  try {
    // Подключение к базе данных
    await connectDB();
    
    // Запуск сервера
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('🟡 ==========================================');
      console.log('🛠️    CHEXOL.UZ ADMIN PANEL ЗАПУЩЕН');
      console.log('🟡 ==========================================');
      console.log(`📍 Админка:       http://localhost:${PORT}`);
      console.log(`🔐 API:           http://localhost:${PORT}/api`);
      console.log(`🏥 Health:        http://localhost:${PORT}/health`);
      console.log(`🌍 Среда:         ${process.env.NODE_ENV || 'development'}`);
      console.log('🟡 ==========================================');
      console.log('');
    });

    // Корректное закрытие сервера
    process.on('SIGTERM', () => {
      console.log('🔄 Получен сигнал SIGTERM, закрытие админ сервера...');
      server.close(() => {
        console.log('✅ Админ сервер корректно закрыт');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Ошибка запуска админ сервера:', error.message);
    process.exit(1);
  }
};

// Запуск сервера
if (require.main === module) {
  startAdminServer();
}

module.exports = app;
