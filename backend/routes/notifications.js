const express = require('express');
const { protect } = require('../middleware/auth');
const NotificationService = require('../services/notificationService');
const Notification = require('../models/Notification');

const router = express.Router();

// 🔔 ПОЛУЧИТЬ УВЕДОМЛЕНИЯ ПОЛЬЗОВАТЕЛЯ
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const result = await NotificationService.getUserNotifications(
      req.user._id, 
      { page: parseInt(page), limit: parseInt(limit), unreadOnly: unreadOnly === 'true' }
    );
    
    res.status(200).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения уведомлений'
    });
  }
});

// ✅ ОТМЕТИТЬ УВЕДОМЛЕНИЕ КАК ПРОЧИТАННОЕ
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await NotificationService.markNotificationAsRead(
      req.params.id, 
      req.user._id
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Уведомление не найдено'
      });
    }
    
    res.status(200).json({
      success: true,
      data: notification
    });
    
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка отметки уведомления'
    });
  }
});

// 🗑️ АРХИВИРОВАТЬ УВЕДОМЛЕНИЕ
router.patch('/:id/archive', protect, async (req, res) => {
  try {
    const notification = await NotificationService.archiveNotification(
      req.params.id, 
      req.user._id
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Уведомление не найдено'
      });
    }
    
    res.status(200).json({
      success: true,
      data: notification
    });
    
  } catch (error) {
    console.error('Archive notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка архивирования уведомления'
    });
  }
});

// 📊 ПОЛУЧИТЬ СТАТИСТИКУ УВЕДОМЛЕНИЙ
router.get('/stats', protect, async (req, res) => {
  try {
    const { unreadOnly = false } = req.query;
    
    const result = await NotificationService.getUserNotifications(
      req.user._id, 
      { page: 1, limit: 1000, unreadOnly: unreadOnly === 'true' }
    );
    
    const stats = {
      total: result.pagination.total,
      unread: result.notifications.filter(n => !n.isRead).length,
      read: result.notifications.filter(n => n.isRead).length,
      archived: result.notifications.filter(n => n.isArchived).length,
      byPriority: {
        low: result.notifications.filter(n => n.priority === 'low').length,
        normal: result.notifications.filter(n => n.priority === 'normal').length,
        high: result.notifications.filter(n => n.priority === 'high').length,
        urgent: result.notifications.filter(n => n.priority === 'urgent').length
      }
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения статистики'
    });
  }
});

// 🔄 ОТМЕТИТЬ ВСЕ УВЕДОМЛЕНИЯ КАК ПРОЧИТАННЫЕ
router.patch('/read-all', protect, async (req, res) => {
  try {
    const result = await NotificationService.getUserNotifications(
      req.user._id, 
      { page: 1, limit: 1000, unreadOnly: true }
    );
    
    const updatePromises = result.notifications.map(notification =>
      NotificationService.markNotificationAsRead(notification._id, req.user._id)
    );
    
    await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: `Отмечено ${result.notifications.length} уведомлений как прочитанные`
    });
    
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка отметки уведомлений'
    });
  }
});

// 🗑️ УДАЛИТЬ УВЕДОМЛЕНИЕ
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Уведомление не найдено'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Уведомление удалено'
    });
    
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления уведомления'
    });
  }
});

module.exports = router;

