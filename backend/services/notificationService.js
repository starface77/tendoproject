const Notification = require('../models/Notification');
const User = require('../models/User');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

/**
 * 🔔 СЕРВИС УВЕДОМЛЕНИЙ
 * Отправка уведомлений всем участникам маркетплейса
 */

class NotificationService {
  
  /**
   * 📧 ОТПРАВКА УВЕДОМЛЕНИЙ ПОСЛЕ ОПЛАТЫ
   */
  static async sendPaymentNotifications(paymentData) {
    try {
      console.log('🔔 Отправка уведомлений после оплаты:', paymentData._id);
      
      const notifications = [];
      
      // 1. Уведомление для покупателя
      const customerNotification = {
        recipient: paymentData.user,
        type: 'customer_payment_success',
        title: {
          ru: 'Оплата прошла успешно',
          uz: 'To\'lov muvaffaqiyatli amalga oshirildi',
          en: 'Payment successful'
        },
        message: {
          ru: `Ваш платеж на сумму ${paymentData.amount} сум успешно обработан. Заказ #${paymentData.order.orderNumber} подтвержден.`,
          uz: `${paymentData.amount} so'm miqdoridagi to'lovingiz muvaffaqiyatli qayta ishlandi. #${paymentData.order.orderNumber} raqamli buyurtma tasdiqlandi.`,
          en: `Your payment of ${paymentData.amount} UZS has been processed successfully. Order #${paymentData.order.orderNumber} confirmed.`
        },
        relatedData: { 
          payment: paymentData._id,
          order: paymentData.order._id 
        },
        priority: 'high',
        channels: ['in_app', 'email'],
        metadata: {
          icon: '✅',
          color: '#10B981',
          actionUrl: `/orders/${paymentData.order._id}`,
          actionText: 'Посмотреть заказ'
        }
      };
      
      notifications.push(customerNotification);
      
      // 2. Уведомление для продавца (если есть)
      if (paymentData.order.seller) {
        const sellerNotification = {
          recipient: paymentData.order.seller,
          type: 'seller_payment_received',
          title: {
            ru: 'Получен платеж',
            uz: 'To\'lov qabul qilindi',
            en: 'Payment received'
          },
          message: {
            ru: `Получен платеж на сумму ${paymentData.amount} сум за заказ #${paymentData.order.orderNumber}. Подготовьте товар к отправке.`,
            uz: `#${paymentData.order.orderNumber} raqamli buyurtma uchun ${paymentData.amount} so'm miqdorida to'lov qabul qilindi. Mahsulotni yuborishga tayyorlang.`,
            en: `Payment of ${paymentData.amount} UZS received for order #${paymentData.order.orderNumber}. Prepare the product for shipping.`
          },
          relatedData: { 
            payment: paymentData._id,
            order: paymentData.order._id 
          },
          priority: 'high',
          channels: ['in_app', 'email', 'telegram'],
          metadata: {
            icon: '💰',
            color: '#3B82F6',
            actionUrl: `/seller/orders/${paymentData.order._id}`,
            actionText: 'Обработать заказ'
          }
        };
        
        notifications.push(sellerNotification);
      }
      
      // 3. Уведомление для всех админов
      const admins = await User.find({ role: 'admin', isActive: true });
      
      for (const admin of admins) {
        const adminNotification = {
          recipient: admin._id,
          type: 'admin_payment_processed',
          title: {
            ru: 'Платеж обработан',
            uz: 'To\'lov qayta ishlandi',
            en: 'Payment processed'
          },
          message: {
            ru: `Платеж ${paymentData._id} на сумму ${paymentData.amount} сум успешно обработан. Заказ #${paymentData.order.orderNumber}.`,
            uz: `${paymentData.amount} so'm miqdoridagi ${paymentData._id} to'lov muvaffaqiyatli qayta ishlandi. #${paymentData.order.orderNumber} raqamli buyurtma.`,
            en: `Payment ${paymentData._id} of ${paymentData.amount} UZS processed successfully. Order #${paymentData.order.orderNumber}.`
          },
          relatedData: { 
            payment: paymentData._id,
            order: paymentData.order._id 
          },
          priority: 'normal',
          channels: ['in_app', 'email'],
          metadata: {
            icon: '📊',
            color: '#6B7280',
            actionUrl: `/admin/payments/${paymentData._id}`,
            actionText: 'Просмотреть платеж'
          }
        };
        
        notifications.push(adminNotification);
      }
      
      // Создаем все уведомления
      const createdNotifications = await Notification.insertMany(notifications);
      
      console.log(`✅ Создано ${createdNotifications.length} уведомлений`);
      
      // Отправляем уведомления через различные каналы
      await this.sendNotificationsThroughChannels(createdNotifications);
      
      return createdNotifications;
      
    } catch (error) {
      console.error('❌ Ошибка отправки уведомлений об оплате:', error);
      throw error;
    }
  }
  
  /**
   * 🛒 ОТПРАВКА УВЕДОМЛЕНИЙ О СОЗДАНИИ ЗАКАЗА
   */
  static async sendOrderNotifications(orderData) {
    try {
      console.log('🔔 Отправка уведомлений о заказе:', orderData._id);
      
      const notifications = [];
      
      // 1. Уведомление для покупателя
      const customerNotification = {
        recipient: orderData.customer,
        type: 'customer_order_update',
        title: {
          ru: 'Заказ создан',
          uz: 'Buyurtma yaratildi',
          en: 'Order created'
        },
        message: {
          ru: `Ваш заказ #${orderData.orderNumber} успешно создан на сумму ${orderData.pricing.total} сум. Ожидайте подтверждения.`,
          uz: `${orderData.pricing.total} so'm miqdoridagi #${orderData.orderNumber} raqamli buyurtmangiz muvaffaqiyatli yaratildi. Tasdiqlanishini kuting.`,
          en: `Your order #${orderData.orderNumber} for ${orderData.pricing.total} UZS has been created successfully. Wait for confirmation.`
        },
        relatedData: { order: orderData._id },
        priority: 'normal',
        channels: ['in_app', 'email'],
        metadata: {
          icon: '🛒',
          color: '#3B82F6',
          actionUrl: `/orders/${orderData._id}`,
          actionText: 'Посмотреть заказ'
        }
      };
      
      notifications.push(customerNotification);
      
      // 2. Уведомление для продавца (если есть)
      if (orderData.seller) {
        const sellerNotification = {
          recipient: orderData.seller,
          type: 'seller_order_received',
          title: {
            ru: 'Новый заказ',
            uz: 'Yangi buyurtma',
            en: 'New order'
          },
          message: {
            ru: `Получен новый заказ #${orderData.orderNumber} на сумму ${orderData.pricing.total} сум. Требует обработки.`,
            uz: `${orderData.pricing.total} so'm miqdoridagi #${orderData.orderNumber} raqamli yangi buyurtma qabul qilindi. Qayta ishlash talab qilinadi.`,
            en: `New order #${orderData.orderNumber} received for ${orderData.pricing.total} UZS. Requires processing.`
          },
          relatedData: { order: orderData._id },
          priority: 'high',
          channels: ['in_app', 'email', 'telegram'],
          metadata: {
            icon: '📦',
            color: '#F59E0B',
            actionUrl: `/seller/orders/${orderData._id}`,
            actionText: 'Обработать заказ'
          }
        };
        
        notifications.push(sellerNotification);
      }
      
      // 3. Уведомление для всех админов
      const admins = await User.find({ role: 'admin', isActive: true });
      
      for (const admin of admins) {
        const adminNotification = {
          recipient: admin._id,
          type: 'admin_order_created',
          title: {
            ru: 'Новый заказ в системе',
            uz: 'Tizimda yangi buyurtma',
            en: 'New order in system'
          },
          message: {
            ru: `В системе создан новый заказ #${orderData.orderNumber} от ${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName} на сумму ${orderData.pricing.total} сум.`,
            uz: `Tizimda ${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName} tomonidan ${orderData.pricing.total} so'm miqdoridagi #${orderData.orderNumber} raqamli yangi buyurtma yaratildi.`,
            en: `New order #${orderData.orderNumber} created in system by ${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName} for ${orderData.pricing.total} UZS.`
          },
          relatedData: { order: orderData._id },
          priority: 'normal',
          channels: ['in_app', 'email'],
          metadata: {
            icon: '📋',
            color: '#6B7280',
            actionUrl: `/admin/orders/${orderData._id}`,
            actionText: 'Просмотреть заказ'
          }
        };
        
        notifications.push(adminNotification);
      }
      
      // Создаем все уведомления
      const createdNotifications = await Notification.insertMany(notifications);
      
      console.log(`✅ Создано ${createdNotifications.length} уведомлений о заказе`);
      
      // Отправляем уведомления через различные каналы
      await this.sendNotificationsThroughChannels(createdNotifications);
      
      return createdNotifications;
      
    } catch (error) {
      console.error('❌ Ошибка отправки уведомлений о заказе:', error);
      throw error;
    }
  }
  
  /**
   * 📱 ОТПРАВКА УВЕДОМЛЕНИЙ ЧЕРЕЗ РАЗЛИЧНЫЕ КАНАЛЫ
   */
  static async sendNotificationsThroughChannels(notifications) {
    for (const notification of notifications) {
      try {
        // Отправляем через каждый канал
        for (const channel of notification.channels) {
          switch (channel) {
            case 'in_app':
              // В приложении - уже создано в БД
              await notification.markAsSent('in_app');
              break;
              
            case 'email':
              await this.sendEmailNotification(notification);
              break;
              
            case 'sms':
              await this.sendSMSNotification(notification);
              break;
              
            case 'telegram':
              await this.sendTelegramNotification(notification);
              break;
              
            case 'push':
              await this.sendPushNotification(notification);
              break;
          }
        }
        
        // Помечаем как доставленное
        await notification.markAsDelivered();
        
      } catch (error) {
        console.error(`❌ Ошибка отправки уведомления ${notification._id}:`, error);
        await notification.markAsFailed('system', error.message);
      }
    }
  }
  
  /**
   * 📧 ОТПРАВКА EMAIL УВЕДОМЛЕНИЯ
   */
  static async sendEmailNotification(notification) {
    try {
      // TODO: Интеграция с email сервисом (Nodemailer, SendGrid, etc.)
      console.log(`📧 Email уведомление отправлено: ${notification._id}`);
      await notification.markAsSent('email');
    } catch (error) {
      console.error('❌ Ошибка отправки email:', error);
      throw error;
    }
  }
  
  /**
   * 📱 ОТПРАВКА SMS УВЕДОМЛЕНИЯ
   */
  static async sendSMSNotification(notification) {
    try {
      // TODO: Интеграция с SMS сервисом
      console.log(`📱 SMS уведомление отправлено: ${notification._id}`);
      await notification.markAsSent('sms');
    } catch (error) {
      console.error('❌ Ошибка отправки SMS:', error);
      throw error;
    }
  }
  
  /**
   * 📱 ОТПРАВКА TELEGRAM УВЕДОМЛЕНИЯ
   */
  static async sendTelegramNotification(notification) {
    try {
      // TODO: Интеграция с Telegram Bot API
      console.log(`📱 Telegram уведомление отправлено: ${notification._id}`);
      await notification.markAsSent('telegram');
    } catch (error) {
      console.error('❌ Ошибка отправки Telegram:', error);
      throw error;
    }
  }
  
  /**
   * 📱 ОТПРАВКА PUSH УВЕДОМЛЕНИЯ
   */
  static async sendPushNotification(notification) {
    try {
      // TODO: Интеграция с Push сервисом (Firebase, OneSignal, etc.)
      console.log(`📱 Push уведомление отправлено: ${notification._id}`);
      await notification.markAsSent('push');
    } catch (error) {
      console.error('❌ Ошибка отправки Push:', error);
      throw error;
    }
  }
  
  /**
   * 🔄 ОТПРАВКА УВЕДОМЛЕНИЙ О СТАТУСЕ ЗАКАЗА
   */
  static async sendOrderStatusNotification(orderId, newStatus, oldStatus) {
    try {
      const order = await Order.findById(orderId)
        .populate('customer', 'firstName lastName email')
        .populate('seller', 'firstName lastName email');
      
      if (!order) {
        throw new Error('Заказ не найден');
      }
      
      const statusMessages = {
        confirmed: {
          ru: 'Заказ подтвержден',
          uz: 'Buyurtma tasdiqlandi',
          en: 'Order confirmed'
        },
        shipped: {
          ru: 'Заказ отправлен',
          uz: 'Buyurtma yuborildi',
          en: 'Order shipped'
        },
        delivered: {
          ru: 'Заказ доставлен',
          uz: 'Buyurtma yetkazildi',
          en: 'Order delivered'
        },
        cancelled: {
          ru: 'Заказ отменен',
          uz: 'Buyurtma bekor qilindi',
          en: 'Order cancelled'
        }
      };
      
      const message = statusMessages[newStatus];
      if (!message) return;
      
      // Уведомление для покупателя
      const customerNotification = {
        recipient: order.customer._id,
        type: 'customer_order_update',
        title: message,
        message: {
          ru: `Статус вашего заказа #${order.orderNumber} изменен на "${message.ru}".`,
          uz: `#${order.orderNumber} raqamli buyurtmangizning holati "${message.uz}" ga o'zgartirildi.`,
          en: `Status of your order #${order.orderNumber} changed to "${message.en}".`
        },
        relatedData: { order: order._id },
        priority: 'normal',
        channels: ['in_app', 'email'],
        metadata: {
          icon: '📋',
          color: '#3B82F6',
          actionUrl: `/orders/${order._id}`,
          actionText: 'Посмотреть заказ'
        }
      };
      
      await Notification.create(customerNotification);
      
      console.log(`✅ Уведомление о статусе заказа отправлено: ${order._id}`);
      
    } catch (error) {
      console.error('❌ Ошибка отправки уведомления о статусе заказа:', error);
    }
  }
  
  /**
   * 📊 ПОЛУЧЕНИЕ УВЕДОМЛЕНИЙ ПОЛЬЗОВАТЕЛЯ
   */
  static async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = options;
      
      const query = { recipient: userId };
      if (unreadOnly) {
        query.isRead = false;
      }
      
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('relatedData.order', 'orderNumber')
        .populate('relatedData.payment', 'amount');
      
      const total = await Notification.countDocuments(query);
      
      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
      
    } catch (error) {
      console.error('❌ Ошибка получения уведомлений пользователя:', error);
      throw error;
    }
  }
  
  /**
   * ✅ ОТМЕТИТЬ УВЕДОМЛЕНИЕ КАК ПРОЧИТАННОЕ
   */
  static async markNotificationAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true, readAt: new Date() },
        { new: true }
      );
      
      return notification;
      
    } catch (error) {
      console.error('❌ Ошибка отметки уведомления как прочитанного:', error);
      throw error;
    }
  }
  
  /**
   * 🗑️ АРХИВИРОВАТЬ УВЕДОМЛЕНИЕ
   */
  static async archiveNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isArchived: true },
        { new: true }
      );
      
      return notification;
      
    } catch (error) {
      console.error('❌ Ошибка архивирования уведомления:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;

