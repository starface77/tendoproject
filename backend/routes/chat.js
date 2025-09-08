const express = require('express');
const { body } = require('express-validator');
const {
  startChat,
  sendMessage,
  getCustomerChats,
  getSellerChats,
  getChat,
  closeChat
} = require('../controllers/chat');
const { protect, sellerProtect } = require('../middleware/auth');

const router = express.Router();

// Валидация для создания чата
const createChatValidation = [
  body('sellerId')
    .notEmpty()
    .withMessage('ID продавца обязателен')
    .isMongoId()
    .withMessage('Некорректный ID продавца'),
  body('productId')
    .optional()
    .isMongoId()
    .withMessage('Некорректный ID товара'),
  body('initialMessage')
    .optional()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Сообщение должно быть от 1 до 1000 символов')
];

// Валидация для отправки сообщения
const sendMessageValidation = [
  body('content')
    .notEmpty()
    .withMessage('Содержимое сообщения обязательно')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Сообщение должно быть от 1 до 1000 символов'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Вложения должны быть массивом')
];

// ПОКУПАТЕЛЬСКИЕ МАРШРУТЫ (требуют авторизации покупателя)
router.post('/start', protect, createChatValidation, startChat);
router.get('/customer', protect, getCustomerChats);

// ПРОДАВЧЕСКИЕ МАРШРУТЫ (требуют авторизации продавца)  
router.get('/seller', sellerProtect, getSellerChats);

// ОБЩИЕ МАРШРУТЫ (для покупателей И продавцов)
// Middleware для определения типа пользователя
const protectAny = async (req, res, next) => {
  // Пробуем защиту покупателя
  protect(req, res, (error) => {
    if (!error) {
      req.userType = 'customer';
      return next();
    }
    
    // Если не получилось, пробуем защиту продавца
    sellerProtect(req, res, (sellerError) => {
      if (!sellerError) {
        req.userType = 'seller';
        return next();
      }
      
      // Если оба не сработали, возвращаем ошибку
      return res.status(401).json({
        success: false,
        error: 'Требуется авторизация'
      });
    });
  });
};

router.get('/:chatId', protectAny, getChat);
router.post('/:chatId/messages', protectAny, sendMessageValidation, sendMessage);
router.put('/:chatId/close', protectAny, closeChat);

// ДЕБАГ МАРШРУТЫ (для разработки)
if (process.env.NODE_ENV === 'development') {
  router.get('/debug/test', (req, res) => {
    res.json({
      success: true,
      message: 'Chat routes работают!',
      routes: [
        'POST /start - Создать чат (покупатель)',
        'GET /customer - Чаты покупателя',
        'GET /seller - Чаты продавца',
        'GET /:chatId - Получить чат',
        'POST /:chatId/messages - Отправить сообщение',
        'PUT /:chatId/close - Закрыть чат'
      ]
    });
  });
}

module.exports = router;



