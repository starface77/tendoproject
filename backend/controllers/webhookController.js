const NotificationService = require('../services/notificationService')
const Payment = require('../models/Payment')
const Order = require('../models/Order')

/**
 * 🔗 WEBHOOK КОНТРОЛЛЕР
 * Обработка внешних уведомлений от платежных систем
 */

class WebhookController {
  
  /**
   * 🔔 ОБРАБОТКА WEBHOOK ОТ ПЛАТЕЖНОЙ СИСТЕМЫ
   */
  static async handlePaymentWebhook(req, res) {
    try {
      const { 
        paymentId, 
        status, 
        transactionId, 
        amount, 
        method,
        signature,
        timestamp 
      } = req.body

      console.log('🔗 Webhook получен:', { paymentId, status, method })

      // Проверяем подпись для безопасности
      if (!this.verifyWebhookSignature(req.body, signature)) {
        console.error('❌ Неверная подпись webhook')
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized' 
        })
      }

      // Находим платеж
      const payment = await Payment.findById(paymentId)
        .populate('order')
        .populate('user')

      if (!payment) {
        console.error('❌ Платеж не найден:', paymentId)
        return res.status(404).json({ 
          success: false, 
          message: 'Payment not found' 
        })
      }

      // Обрабатываем статус платежа
      switch (status) {
        case 'completed':
        case 'success':
          await this.handleSuccessfulPayment(payment, transactionId, method)
          break
          
        case 'failed':
        case 'declined':
          await this.handleFailedPayment(payment, req.body.error || 'Payment failed')
          break
          
        case 'pending':
          await this.handlePendingPayment(payment)
          break
          
        case 'refunded':
          await this.handleRefundedPayment(payment, req.body.refundAmount)
          break
          
        default:
          console.log('⚠️ Неизвестный статус платежа:', status)
      }

      // Отправляем подтверждение
      res.status(200).json({ 
        success: true, 
        message: 'Webhook processed successfully' 
      })

    } catch (error) {
      console.error('❌ Ошибка обработки webhook:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      })
    }
  }

  /**
   * ✅ ОБРАБОТКА УСПЕШНОГО ПЛАТЕЖА
   */
  static async handleSuccessfulPayment(payment, transactionId, method) {
    try {
      console.log('✅ Обработка успешного платежа:', payment._id)

      // Обновляем статус платежа
      await payment.markAsCompleted({ 
        transactionId, 
        method,
        processedAt: new Date()
      })

      // Обновляем статус заказа
      if (payment.order) {
        await Order.findByIdAndUpdate(payment.order._id, {
          status: 'confirmed',
          paymentStatus: 'paid',
          confirmedAt: new Date()
        })
      }

      // Отправляем уведомления всем участникам
      await NotificationService.sendPaymentNotifications(payment)

      console.log('✅ Платеж успешно обработан:', payment._id)

    } catch (error) {
      console.error('❌ Ошибка обработки успешного платежа:', error)
      throw error
    }
  }

  /**
   * ❌ ОБРАБОТКА НЕУДАЧНОГО ПЛАТЕЖА
   */
  static async handleFailedPayment(payment, errorMessage) {
    try {
      console.log('❌ Обработка неудачного платежа:', payment._id)

      // Обновляем статус платежа
      await payment.markAsFailed('WEBHOOK_ERROR', errorMessage)

      // Обновляем статус заказа
      if (payment.order) {
        await Order.findByIdAndUpdate(payment.order._id, {
          status: 'payment_failed',
          paymentStatus: 'failed'
        })
      }

      // Отправляем уведомления об ошибке
      await this.sendPaymentFailureNotifications(payment, errorMessage)

      console.log('❌ Платеж помечен как неудачный:', payment._id)

    } catch (error) {
      console.error('❌ Ошибка обработки неудачного платежа:', error)
      throw error
    }
  }

  /**
   * ⏳ ОБРАБОТКА ОЖИДАЮЩЕГО ПЛАТЕЖА
   */
  static async handlePendingPayment(payment) {
    try {
      console.log('⏳ Обработка ожидающего платежа:', payment._id)

      // Обновляем статус платежа
      await payment.markAsProcessing()

      // Обновляем статус заказа
      if (payment.order) {
        await Order.findByIdAndUpdate(payment.order._id, {
          status: 'payment_pending',
          paymentStatus: 'pending'
        })
      }

      console.log('⏳ Платеж помечен как ожидающий:', payment._id)

    } catch (error) {
      console.error('❌ Ошибка обработки ожидающего платежа:', error)
      throw error
    }
  }

  /**
   * 💰 ОБРАБОТКА ВОЗВРАТА СРЕДСТВ
   */
  static async handleRefundedPayment(payment, refundAmount) {
    try {
      console.log('💰 Обработка возврата средств:', payment._id)

      // Обновляем статус платежа
      await payment.markAsRefunded(refundAmount)

      // Обновляем статус заказа
      if (payment.order) {
        await Order.findByIdAndUpdate(payment.order._id, {
          status: 'refunded',
          paymentStatus: 'refunded'
        })
      }

      // Отправляем уведомления о возврате
      await this.sendRefundNotifications(payment, refundAmount)

      console.log('💰 Возврат средств обработан:', payment._id)

    } catch (error) {
      console.error('❌ Ошибка обработки возврата средств:', error)
      throw error
    }
  }

  /**
   * 🔔 ОТПРАВКА УВЕДОМЛЕНИЙ О НЕУДАЧНОМ ПЛАТЕЖЕ
   */
  static async sendPaymentFailureNotifications(payment, errorMessage) {
    try {
      const Notification = require('../models/Notification')
      const User = require('../models/User')

      // Уведомление для покупателя
      const customerNotification = {
        recipient: payment.user._id,
        type: 'customer_payment_failed',
        title: {
          ru: 'Ошибка оплаты',
          uz: 'To\'lov xatosi',
          en: 'Payment error'
        },
        message: {
          ru: `Ошибка при обработке платежа: ${errorMessage}. Попробуйте еще раз или выберите другой способ оплаты.`,
          uz: `To'lovni qayta ishlashda xatolik: ${errorMessage}. Qaytadan urinib ko'ring yoki boshqa to'lov usulini tanlang.`,
          en: `Error processing payment: ${errorMessage}. Please try again or choose another payment method.`
        },
        relatedData: { 
          payment: payment._id,
          order: payment.order?._id 
        },
        priority: 'high',
        channels: ['in_app', 'email'],
        metadata: {
          icon: '❌',
          color: '#EF4444',
          actionUrl: `/orders/${payment.order?._id}`,
          actionText: 'Попробовать снова'
        }
      }

      await Notification.create(customerNotification)

      // Уведомление для админов
      const admins = await User.find({ role: 'admin', isActive: true })
      
      for (const admin of admins) {
        const adminNotification = {
          recipient: admin._id,
          type: 'admin_payment_issue',
          title: {
            ru: 'Проблема с платежом',
            uz: 'To\'lov bilan bog\'liq muammo',
            en: 'Payment issue'
          },
          message: {
            ru: `Платеж ${payment._id} не прошел. Ошибка: ${errorMessage}. Требует внимания.`,
            uz: `To'lov ${payment._id} amalga oshmadi. Xato: ${errorMessage}. E'tibor talab qilinadi.`,
            en: `Payment ${payment._id} failed. Error: ${errorMessage}. Requires attention.`
          },
          relatedData: { 
            payment: payment._id,
            order: payment.order?._id 
          },
          priority: 'high',
          channels: ['in_app', 'email'],
          metadata: {
            icon: '⚠️',
            color: '#F59E0B',
            actionUrl: `/admin/payments/${payment._id}`,
            actionText: 'Просмотреть платеж'
          }
        }

        await Notification.create(adminNotification)
      }

      console.log('🔔 Уведомления об ошибке платежа отправлены')

    } catch (error) {
      console.error('❌ Ошибка отправки уведомлений об ошибке платежа:', error)
    }
  }

  /**
   * 🔔 ОТПРАВКА УВЕДОМЛЕНИЙ О ВОЗВРАТЕ
   */
  static async sendRefundNotifications(payment, refundAmount) {
    try {
      const Notification = require('../models/Notification')
      const User = require('../models/User')

      // Уведомление для покупателя
      const customerNotification = {
        recipient: payment.user._id,
        type: 'customer_payment_refunded',
        title: {
          ru: 'Возврат средств',
          uz: 'Pulni qaytarish',
          en: 'Refund processed'
        },
        message: {
          ru: `Возврат средств на сумму ${refundAmount} сум обработан. Деньги поступят на ваш счет в течение 3-5 рабочих дней.`,
          uz: `${refundAmount} so'm miqdoridagi pulni qaytarish qayta ishlandi. Pullar 3-5 ish kunida hisobingizga tushadi.`,
          en: `Refund of ${refundAmount} UZS has been processed. Funds will be credited to your account within 3-5 business days.`
        },
        relatedData: { 
          payment: payment._id,
          order: payment.order?._id 
        },
        priority: 'normal',
        channels: ['in_app', 'email'],
        metadata: {
          icon: '💰',
          color: '#10B981',
          actionUrl: `/orders/${payment.order?._id}`,
          actionText: 'Посмотреть заказ'
        }
      }

      await Notification.create(customerNotification)

      // Уведомление для админов
      const admins = await User.find({ role: 'admin', isActive: true })
      
      for (const admin of admins) {
        const adminNotification = {
          recipient: admin._id,
          type: 'admin_payment_refunded',
          title: {
            ru: 'Возврат средств обработан',
            uz: 'Pulni qaytarish qayta ishlandi',
            en: 'Refund processed'
          },
          message: {
            ru: `Возврат средств на сумму ${refundAmount} сум для платежа ${payment._id} обработан.`,
            uz: `${refundAmount} so'm miqdoridagi pulni qaytarish ${payment._id} to'lov uchun qayta ishlandi.`,
            en: `Refund of ${refundAmount} UZS for payment ${payment._id} has been processed.`
          },
          relatedData: { 
            payment: payment._id,
            order: payment.order?._id 
          },
          priority: 'normal',
          channels: ['in_app', 'email'],
          metadata: {
            icon: '💰',
            color: '#10B981',
            actionUrl: `/admin/payments/${payment._id}`,
            actionText: 'Просмотреть платеж'
          }
        }

        await Notification.create(adminNotification)
      }

      console.log('🔔 Уведомления о возврате средств отправлены')

    } catch (error) {
      console.error('❌ Ошибка отправки уведомлений о возврате:', error)
    }
  }

  /**
   * 🔐 ПРОВЕРКА ПОДПИСИ WEBHOOK
   */
  static verifyWebhookSignature(payload, signature) {
    try {
      // TODO: Реализовать проверку подписи для безопасности
      // Пока возвращаем true для демо
      console.log('🔐 Проверка подписи webhook (демо режим)')
      return true
      
      // Пример реальной проверки:
      // const secret = process.env.WEBHOOK_SECRET
      // const expectedSignature = crypto
      //   .createHmac('sha256', secret)
      //   .update(JSON.stringify(payload))
      //   .digest('hex')
      // return signature === expectedSignature
      
    } catch (error) {
      console.error('❌ Ошибка проверки подписи webhook:', error)
      return false
    }
  }

  /**
   * 📊 ПОЛУЧЕНИЕ СТАТУСА WEBHOOK
   */
  static async getWebhookStatus(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: 'Webhook system is working',
        timestamp: new Date().toISOString(),
        endpoints: {
          payment: '/api/v1/webhooks/payment',
          order: '/api/v1/webhooks/order'
        }
      })
    } catch (error) {
      console.error('❌ Ошибка получения статуса webhook:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }
}

module.exports = WebhookController

