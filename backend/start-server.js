/**
 * 🚀 СКРИПТ ЗАПУСКА СЕРВЕРА В ФОНОВОМ РЕЖИМЕ
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск сервера в фоновом режиме...');

const server = spawn('node', ['server.js'], {
  stdio: 'pipe',
  detached: true
});

server.stdout.on('data', (data) => {
  console.log(`📤 ${data}`);
});

server.stderr.on('data', (data) => {
  console.log(`❌ ${data}`);
});

server.on('close', (code) => {
  console.log(`🔚 Сервер завершен с кодом ${code}`);
});

// Отключаем от родительского процесса
server.unref();

console.log('✅ Сервер запущен в фоновом режиме');
console.log('📍 API доступен по адресу: http://localhost:5000');
console.log('🛑 Для остановки используйте: taskkill /F /IM node.exe');

// Выходим из процесса
setTimeout(() => {
  process.exit(0);
}, 2000);


