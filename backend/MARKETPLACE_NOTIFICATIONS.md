# 🔔 СИСТЕМА УВЕДОМЛЕНИЙ МАРКЕТПЛЕЙСА

Полноценная система уведомлений для всех участников маркетплейса: покупателей, продавцов и администраторов.

## 📋 ОСОБЕННОСТИ

### 🎯 Автоматические уведомления
- **Создание заказа** → уведомления покупателю, продавцу, админам
- **Успешная оплата** → уведомления всем участникам
- **Изменение статуса** → уведомления о доставке, отмене и т.д.
- **Ошибки платежей** → уведомления об проблемах

### 📱 Множественные каналы доставки
- **В приложении** (in-app) - основной канал
- **Email** - для важных уведомлений
- **SMS** - для срочных сообщений
- **Telegram** - для продавцов
- **Push** - мобильные уведомления

### 🌍 Многоязычность
- Русский (ru)
- Узбекский (uz) 
- Английский (en)

### 🎨 Умная система приоритетов
- **Low** - обычные уведомления
- **Normal** - стандартные сообщения
- **High** - важные уведомления
- **Urgent** - срочные сообщения

## 🏗️ АРХИТЕКТУРА

### Модели данных
```
Notification.js - основная модель уведомлений
User.js - пользователи с ролями
Order.js - заказы
Payment.js - платежи
```

### Сервисы
```
notificationService.js - логика отправки уведомлений
webhookController.js - обработка внешних webhook
```

### API маршруты
```
/notifications - управление уведомлениями
/webhooks - внешние webhook
```

## 🚀 ИСПОЛЬЗОВАНИЕ

### 1. Отправка уведомлений после оплаты

```javascript
const NotificationService = require('./services/notificationService');

// После успешной оплаты
await NotificationService.sendPaymentNotifications(paymentData);
```

### 2. Отправка уведомлений о заказе

```javascript
// При создании заказа
await NotificationService.sendOrderNotifications(orderData);

// При изменении статуса
await NotificationService.sendOrderStatusNotification(orderId, 'shipped', 'confirmed');
```

### 3. Получение уведомлений пользователя

```javascript
const notifications = await NotificationService.getUserNotifications(userId, {
  page: 1,
  limit: 20,
  unreadOnly: false
});
```

## 🔗 WEBHOOK ИНТЕГРАЦИЯ

### Endpoint для платежных систем
```
POST /api/v1/webhooks/payment
```

### Формат webhook
```json
{
  "paymentId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "status": "completed",
  "transactionId": "TXN_123456",
  "amount": 150000,
  "method": "click",
  "signature": "hmac_signature",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Статусы платежей
- `completed` / `success` - успешная оплата
- `failed` / `declined` - неудачная оплата
- `pending` - ожидающая оплата
- `refunded` - возврат средств

## 📱 ФРОНТЕНД ИНТЕГРАЦИЯ

### Компонент колокольчика уведомлений
```jsx
import NotificationBell from '../components/ui/NotificationBell';

// В навбаре
<NotificationBell />
```

### Страница уведомлений
```jsx
import NotificationsPage from '../pages/NotificationsPage';

// В роутинге
<Route path="/notifications" element={<NotificationsPage />} />
```

### API для фронтенда
```javascript
import { notificationsApi } from '../services/api';

// Получить уведомления
const notifications = await notificationsApi.getNotifications();

// Отметить как прочитанное
await notificationsApi.markNotificationAsRead(id);

// Статистика
const stats = await notificationsApi.getNotificationStats();
```

## 🔧 НАСТРОЙКА

### Переменные окружения
```env
# Настройки уведомлений
NOTIFICATION_EMAIL_ENABLED=true
NOTIFICATION_SMS_ENABLED=false
NOTIFICATION_TELEGRAM_ENABLED=true
NOTIFICATION_PUSH_ENABLED=false

# Webhook секреты
WEBHOOK_SECRET=your_webhook_secret
CLICK_WEBHOOK_SECRET=click_secret
PAYME_WEBHOOK_SECRET=payme_secret
```

### Интеграция с платежными системами

#### Click.uz
```javascript
// В webhook контроллере
if (method === 'click') {
  // Проверка подписи Click
  const isValidSignature = verifyClickSignature(payload, signature);
  if (!isValidSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
}
```

#### Payme
```javascript
// В webhook контроллере
if (method === 'payme') {
  // Проверка подписи Payme
  const isValidSignature = verifyPaymeSignature(payload, signature);
  if (!isValidSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
}
```

## 📊 МОНИТОРИНГ И АНАЛИТИКА

### Статистика уведомлений
- Общее количество
- Непрочитанные
- По приоритетам
- По каналам доставки

### Логирование
```javascript
console.log('🔔 Отправка уведомлений после оплаты:', paymentId);
console.log('✅ Создано уведомлений:', notifications.length);
console.log('❌ Ошибка отправки:', error.message);
```

## 🧪 ТЕСТИРОВАНИЕ

### Тестовый webhook
```bash
curl -X POST http://localhost:5000/api/v1/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{
    "test": "data",
    "timestamp": "2024-01-15T10:30:00Z"
  }'
```

### Проверка статуса
```bash
curl http://localhost:5000/api/v1/webhooks/status
```

## 🔒 БЕЗОПАСНОСТЬ

### Проверка подписей webhook
- HMAC-SHA256 подписи для всех webhook
- Секретные ключи для каждой платежной системы
- Валидация timestamp для предотвращения replay атак

### Аутентификация API
- JWT токены для пользователей
- Роли и права доступа
- Защита от CSRF атак

## 📈 РАСШИРЕНИЕ СИСТЕМЫ

### Добавление новых каналов
```javascript
// В notificationService.js
static async sendNewChannelNotification(notification) {
  try {
    // Логика отправки через новый канал
    await notification.markAsSent('new_channel');
  } catch (error) {
    await notification.markAsFailed('new_channel', error.message);
  }
}
```

### Новые типы уведомлений
```javascript
// В модели Notification.js
enum: [
  // ... существующие типы
  'new_type_1',
  'new_type_2'
]
```

### Кастомные шаблоны
```javascript
// В notificationService.js
static getCustomNotificationTemplate(type, data) {
  // Логика для кастомных шаблонов
  return {
    title: customTitle,
    message: customMessage,
    metadata: customMetadata
  };
}
```

## 🚨 УСТРАНЕНИЕ НЕПОЛАДОК

### Частые проблемы

#### Уведомления не отправляются
1. Проверить логи сервера
2. Убедиться в корректности данных
3. Проверить настройки каналов доставки

#### Webhook не работает
1. Проверить URL endpoint
2. Убедиться в корректности подписи
3. Проверить формат данных

#### Ошибки в базе данных
1. Проверить подключение к MongoDB
2. Убедиться в корректности схем
3. Проверить индексы

### Логи и отладка
```javascript
// Включить подробное логирование
console.log('🔍 Debug info:', {
  notification: notification._id,
  recipient: notification.recipient,
  channels: notification.channels,
  data: notification.relatedData
});
```

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- [Документация MongoDB](https://docs.mongodb.com/)
- [Express.js документация](https://expressjs.com/)
- [React документация](https://reactjs.org/)
- [Webhook best practices](https://webhooks.fyi/)

---

**🎯 Система готова к использованию!** 

Все уведомления автоматически отправляются всем участникам маркетплейса при соответствующих событиях. Система легко расширяется и настраивается под ваши потребности.

