/**
 * 🛠️ CHEXOL.UZ ADMIN PANEL - DEBUG VERSION
 * Упрощенная версия для отладки API
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
  origin: '*', // Разрешаем все источники для отладки
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// 🔄 ПАРСИНГ ДАННЫХ
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// 📁 СТАТИЧЕСКИЕ ФАЙЛЫ (админская панель)
app.use(express.static(path.join(__dirname, 'public')));

// 🏥 HEALTH CHECK
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Chexol.uz Admin Panel работает нормально',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    jwt_secret: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
  });
});

// 📍 ПРОСТОЙ API ДЛЯ ТЕСТИРОВАНИЯ
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API работает!',
    environment: process.env.NODE_ENV,
    jwt_secret_exists: !!process.env.JWT_SECRET
  });
});

// 🔐 ПРОСТАЯ АВТОРИЗАЦИЯ (БЕЗ ВНЕШНИХ РОУТОВ)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Попытка входа:', { email, password: password ? '***' : 'пусто' });
    console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? 'ЕСТЬ' : 'НЕТ');
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email и пароль обязательны'
      });
    }
    
    if (email === 'admin@chexoluz.com' && password === 'admin123456') {
      const jwt = require('jsonwebtoken');
      
      const token = jwt.sign(
        { id: 'admin123', email: 'admin@chexoluz.com' },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );
      
      res.status(200).json({
        success: true,
        message: 'Успешный вход',
        token,
        user: {
          id: 'admin123',
          email: 'admin@chexoluz.com',
          firstName: 'Супер',
          lastName: 'Администратор',
          role: 'super_admin'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Неверные учетные данные'
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка авторизации:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера',
      details: error.message
    });
  }
});

// 📋 ГЛАВНАЯ СТРАНИЦА АДМИНКИ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 для API маршрутов
app.use('/api/*', (req, res) => {
  console.log('❌ 404 API:', req.method, req.url);
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    method: req.method,
    url: req.url
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
    console.log('🔄 Подключение к базе данных...');
    await connectDB();
    
    console.log('🔍 DEBUG INFO:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'УСТАНОВЛЕН' : 'НЕ УСТАНОВЛЕН');
    console.log('- MONGO_URI:', process.env.MONGO_URI ? 'УСТАНОВЛЕН' : 'НЕ УСТАНОВЛЕН');
    
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('🟡 ==========================================');
      console.log('🐛    DEBUG ADMIN PANEL ЗАПУЩЕН');
      console.log('🟡 ==========================================');
      console.log(`📍 Админка:       http://localhost:${PORT}`);
      console.log(`🔐 API:           http://localhost:${PORT}/api`);
      console.log(`🏥 Health:        http://localhost:${PORT}/health`);
      console.log(`🧪 Test API:      http://localhost:${PORT}/api/test`);
      console.log('🟡 ==========================================');
      console.log('');
    });

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
