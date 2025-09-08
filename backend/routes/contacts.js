const express = require('express');
const { body } = require('express-validator');
const { createContactMessage, getContactMessages, updateContactStatus, replyToContact } = require('../controllers/contacts');

const router = express.Router();

// Создать сообщение обратной связи
router.post('/', [
  body('name').notEmpty().withMessage('Имя обязательно'),
  body('email').isEmail().withMessage('Некорректный email'),
  body('subject').notEmpty().withMessage('Тема обязательна'),
  body('message').isLength({ min: 5, max: 1000 }).withMessage('Сообщение должно содержать минимум 5 символов')
], createContactMessage);

// Получить сообщения обратной связи (только для админов)
router.get('/', require('../middleware/auth').protect, require('../middleware/auth').authorize('admin', 'super_admin'), getContactMessages);

// Обновить статус сообщения
router.patch('/:id/status', require('../middleware/auth').protect, require('../middleware/auth').authorize('admin', 'super_admin'), [
  require('express-validator').body('status').isIn(['new', 'read', 'replied', 'closed']).withMessage('Некорректный статус')
], updateContactStatus);

// Отправить ответ на сообщение
router.post('/:id/reply', require('../middleware/auth').protect, require('../middleware/auth').authorize('admin', 'super_admin'), [
  require('express-validator').body('replyMessage').isLength({ min: 5, max: 1000 }).withMessage('Ответ должен содержать минимум 5 символов')
], replyToContact);

module.exports = router;
