const Favorite = require('../models/Favorite');
const Notification = require('../models/Notification');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * 🔔 СЕРВИС УВЕДОМЛЕНИЙ ОБ ИЗБРАННОМ
 * Отправка уведомлений о снижении цены и поступлении товаров
 */

class FavoriteNotificationService {
  
  /**
   * 📉 ОТПРАВКА УВЕДОМЛЕНИЙ О СНИЖЕНИИ ЦЕНЫ
   */
  static async sendPriceDropNotifications() {
    try {
      console.log('🔔 Проверка уведомлений о снижении цен...');
      
      // Найдем все избранные товары с включенными уведомлениями
      const favorites = await Favorite.find({
        'notifications.priceDropEnabled': true
      }).populate(['user', 'product']);
      
      let notificationsSent = 0;
      
      for (const favorite of favorites) {
        try {
          // Проверим, есть ли снижение цены
          if (favorite.hasPriceDropped()) {
            // Проверим, не отправляли ли мы уже уведомление об этом
            const existingNotification = await Notification.findOne({
              recipient: favorite.user._id,
              type: 'favorite_price_drop',
              'relatedData.product': favorite.product._id,
              'relatedData.favorite': favorite._id,
              createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // За последние 24 часа
            });
            
            if (!existingNotification) {
              // Создаем уведомление
              const priceChange = favorite.priceWhenAdded - favorite.product.price;
              const priceChangePercent = ((priceChange / favorite.priceWhenAdded) * 100).toFixed(1);
              
              const notification = new Notification({
                recipient: favorite.user._id,
                type: 'favorite_price_drop',
                title: {
                  ru: 'Снижение цены на избранный товар',
                  uz: 'Sevimli mahsulot narxi tushdi',
                  en: 'Price drop on favorite product'
                },
                message: {
                  ru: `Цена на "${favorite.product.name.ru || favorite.product.name}" снизилась на ${priceChangePercent}% (-${priceChange} сум)`,
                  uz: `"${favorite.product.name.uz || favorite.product.name}" narxi ${priceChangePercent}% (-${priceChange} so'm) ga tushdi`,
                  en: `Price of "${favorite.product.name.en || favorite.product.name}" dropped by ${priceChangePercent}% (-${priceChange} UZS)`
                },
                relatedData: { 
                  product: favorite.product._id,
                  favorite: favorite._id 
                },
                priority: 'normal',
                channels: ['in_app', 'email'], // TODO: Добавить SMS/Telegram/Push
                metadata: {
                  icon: '💰',
                  color: '#10B981',
                  actionUrl: `/product/${favorite.product._id}`,
                  actionText: {
                    ru: 'Посмотреть товар',
                    uz: 'Mahsulotni ko\'rish',
                    en: 'View product'
                  }
                }
              });
              
              await notification.save();
              notificationsSent++;
              console.log(`✅ Уведомление о снижении цены отправлено: ${favorite.user.email}`);
            }
          }
        } catch (error) {
          console.error(`❌ Ошибка обработки избранного ${favorite._id}:`, error);
        }
      }
      
      console.log(`🔔 Проверка уведомлений о снижении цен завершена. Отправлено: ${notificationsSent}`);
      return notificationsSent;
      
    } catch (error) {
      console.error('❌ Ошибка отправки уведомлений о снижении цен:', error);
      throw error;
    }
  }
  
  /**
   * 📦 ОТПРАВКА УВЕДОМЛЕНИЙ О ПОСТУПЛЕНИИ ТОВАРОВ
   */
  static async sendBackInStockNotifications() {
    try {
      console.log('🔔 Проверка уведомлений о поступлении товаров...');
      
      // Найдем все избранные товары с включенными уведомлениями
      const favorites = await Favorite.find({
        'notifications.backInStockEnabled': true
      }).populate(['user', 'product']);
      
      let notificationsSent = 0;
      
      for (const favorite of favorites) {
        try {
          // Проверим, есть ли товар в наличии (если был недоступен)
          if (favorite.isBackInStock()) {
            // Проверим, не отправляли ли мы уже уведомление об этом
            const existingNotification = await Notification.findOne({
              recipient: favorite.user._id,
              type: 'favorite_back_in_stock',
              'relatedData.product': favorite.product._id,
              'relatedData.favorite': favorite._id,
              createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // За последние 24 часа
            });
            
            if (!existingNotification) {
              // Создаем уведомление
              const notification = new Notification({
                recipient: favorite.user._id,
                type: 'favorite_back_in_stock',
                title: {
                  ru: 'Избранный товар снова в наличии',
                  uz: 'Sevimli mahsulot yana mavjud',
                  en: 'Favorite product back in stock'
                },
                message: {
                  ru: `"${favorite.product.name.ru || favorite.product.name}" снова в наличии!`,
                  uz: `"${favorite.product.name.uz || favorite.product.name}" yana mavjud!`,
                  en: `"${favorite.product.name.en || favorite.product.name}" is back in stock!`
                },
                relatedData: { 
                  product: favorite.product._id,
                  favorite: favorite._id 
                },
                priority: 'normal',
                channels: ['in_app', 'email'], // TODO: Добавить SMS/Telegram/Push
                metadata: {
                  icon: '📦',
                  color: '#3B82F6',
                  actionUrl: `/product/${favorite.product._id}`,
                  actionText: {
                    ru: 'Посмотреть товар',
                    uz: 'Mahsulotni ko\'rish',
                    en: 'View product'
                  }
                }
              });
              
              await notification.save();
              notificationsSent++;
              console.log(`✅ Уведомление о поступлении товара отправлено: ${favorite.user.email}`);
            }
          }
        } catch (error) {
          console.error(`❌ Ошибка обработки избранного ${favorite._id}:`, error);
        }
      }
      
      console.log(`🔔 Проверка уведомлений о поступлении товаров завершена. Отправлено: ${notificationsSent}`);
      return notificationsSent;
      
    } catch (error) {
      console.error('❌ Ошибка отправки уведомлений о поступлении товаров:', error);
      throw error;
    }
  }
  
  /**
   * 🔄 ПРОВЕРКА И ОТПРАВКА ВСЕХ УВЕДОМЛЕНИЙ
   */
  static async checkAndSendAllNotifications() {
    try {
      console.log('🔔 Запуск проверки всех уведомлений об избранных товарах...');
      
      // Проверяем уведомления о снижении цен
      const priceDropCount = await this.sendPriceDropNotifications();
      
      // Проверяем уведомления о поступлении товаров
      const backInStockCount = await this.sendBackInStockNotifications();
      
      console.log(`🔔 Все уведомления проверены. Снижение цен: ${priceDropCount}, Поступление: ${backInStockCount}`);
      
      return {
        priceDropCount,
        backInStockCount
      };
      
    } catch (error) {
      console.error('❌ Ошибка при проверке всех уведомлений:', error);
      throw error;
    }
  }
}

module.exports = FavoriteNotificationService;