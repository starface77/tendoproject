/**
 * 🛠️ CHEXOL.UZ ADMIN PANEL - MINIMAL VERSION
 * Минимальная версия для поиска ошибки
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './.env' });

// Импорт конфигураций
const { connectDB } = require('../config/database');

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

// 📋 ГЛАВНАЯ СТРАНИЦА АДМИНКИ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Простой API endpoint для тестирования
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API работает!'
  });
});

// 404 для API маршрутов
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// SPA маршруты
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🚀 ЗАПУСК АДМИНСКОГО СЕРВЕРА
const PORT = process.env.ADMIN_PORT || 5001;

const startAdminServer = async () => {
  try {
    // Подключение к базе данных
    console.log('🔄 Подключение к базе данных...');
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
      console.log('✅ Минимальная версия запущена успешно!');
      console.log('🔍 Если это работает, проблема в одном из роутов.');
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
