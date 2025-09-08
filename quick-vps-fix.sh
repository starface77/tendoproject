#!/bin/bash

echo "🚀 БЫСТРЫЙ ФИКС ПРОБЛЕМЫ С СЕССИЕЙ НА VPS"
echo "=========================================="

# Копируем и запускаем основной фикс
cp backend/fix-jwt-vps.sh /tmp/
chmod +x /tmp/fix-jwt-vps.sh
/tmp/fix-jwt-vps.sh

echo ""
echo "✅ ФИКС ПРИМЕНЕН!"
echo ""
echo "🌐 ПРОВЕРЬТЕ АДМИН ПАНЕЛЬ:"
echo "https://admin.tendo.uz"
echo ""
echo "📧 ДАННЫЕ ДЛЯ ВХОДА:"
echo "Email: admin@tendo.uz"
echo "Password: admin123456"
