const express = require('express');
const { body, query } = require('express-validator');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getMyOrders,
  cancelOrder,
  updateOrderStatus,
  trackOrder
} = require('../controllers/orders');

const { protect, authorize, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// 🔐 ЗАЩИЩЕННЫЕ МАРШРУТЫ

// Получить свои заказы
router.get('/my', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Номер страницы должен быть положительным числом'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Лимит должен быть от 1 до 50'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']).withMessage('Некорректный статус')
], getMyOrders);

// Создать заказ
router.post('/', protect, [
  body('items').isArray({ min: 1 }).withMessage('Товары обязательны'),
  body('items.*.product').isMongoId().withMessage('Некорректный ID товара'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Количество должно быть положительным числом'),
  body('shippingAddress.city').notEmpty().withMessage('Город обязателен'),
  body('shippingAddress.street').notEmpty().withMessage('Улица обязательна'),
  body('shippingAddress.building').notEmpty().withMessage('Дом обязателен'),
  body('payment.method').isIn(['cash', 'card', 'transfer', 'click', 'payme', 'uzcard']).withMessage('Некорректный способ оплаты'),
  body('delivery.method').optional().isIn(['standard', 'express', 'pickup', 'same_day']).withMessage('Некорректный способ доставки')
], createOrder);

// Отслеживание заказа (публичный маршрут)
router.get('/track/:orderNumber', trackOrder);

// Получить конкретный заказ
router.get('/:id', protect, checkOwnership('Order'), getOrder);

// Отменить заказ
router.patch('/:id/cancel', protect, checkOwnership('Order'), [
  body('reason').optional().notEmpty().withMessage('Причина отмены не может быть пустой')
], cancelOrder);

// 👨‍💼 АДМИНИСТРАТИВНЫЕ МАРШРУТЫ

// Получить все заказы (админ)
router.get('/', protect, authorize('admin', 'super_admin', 'moderator'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Номер страницы должен быть положительным числом'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Лимит должен быть от 1 до 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']).withMessage('Некорректный статус'),
  query('city').optional().notEmpty().withMessage('Город не может быть пустым'),
  query('paymentStatus').optional().isIn(['pending', 'processing', 'paid', 'failed', 'refunded']).withMessage('Некорректный статус оплаты')
], getOrders);

// Обновить заказ (админ)
router.put('/:id', protect, authorize('admin', 'super_admin'), [
  body('status').optional().isIn(['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']).withMessage('Некорректный статус')
], updateOrder);

// Обновить статус заказа (админ/модератор)
router.patch('/:id/status', protect, authorize('admin', 'super_admin', 'moderator'), [
  body('status').isIn(['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']).withMessage('Некорректный статус'),
  body('notes').optional().notEmpty().withMessage('Заметки не могут быть пустыми')
], updateOrderStatus);

// Удалить заказ (только супер-админ)
router.delete('/:id', protect, authorize('super_admin'), deleteOrder);

module.exports = router;
