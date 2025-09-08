/**
 * 🛠️ CHEXOL.UZ ADMIN - ULTRA MINIMAL
 * Самая простая версия для изоляции ошибки
 */

const express = require('express');
const path = require('path');

// Создание Express приложения
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Простые роуты
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Работает!' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🚀 ЗАПУСК
const PORT = 5001;

app.listen(PORT, () => {
  console.log('✅ Ultra-minimal сервер запущен на порту', PORT);
  console.log('🌍 Откройте: http://localhost:5001');
});

console.log('🔄 Запускаем ultra-minimal сервер...');
