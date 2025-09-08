import { useState, useEffect } from 'react'
import { FiBell, FiX, FiCheck, FiArchive, FiTrash2 } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { notificationsApi } from '../../services/api'

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications()
      loadNotificationStats()
    }
  }, [isAuthenticated])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationsApi.getNotifications({ limit: 10 })
      if (response.success) {
        setNotifications(response.data.notifications)
      }
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadNotificationStats = async () => {
    try {
      const response = await notificationsApi.getNotificationStats()
      if (response.success) {
        setUnreadCount(response.data.unread)
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики уведомлений:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await notificationsApi.markNotificationAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Ошибка отметки уведомления:', error)
    }
  }

  const archiveNotification = async (notificationId) => {
    try {
      // Пока не реализовано в API
      console.log('Архивирование уведомления:', notificationId)
      // setNotifications(prev =>
      //   prev.filter(n => n._id !== notificationId)
      // )
    } catch (error) {
      console.error('Ошибка архивирования уведомления:', error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      // Пока не реализовано в API
      console.log('Удаление уведомления:', notificationId)
      // setNotifications(prev =>
      //   prev.filter(n => n._id !== notificationId)
      // )
    } catch (error) {
      console.error('Ошибка удаления уведомления:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllNotificationsAsRead()
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Ошибка отметки всех уведомлений:', error)
    }
  }

  const getNotificationIcon = (type) => {
    const icons = {
      'customer_payment_success': '✅',
      'seller_payment_received': '💰',
      'admin_payment_processed': '📊',
      'customer_order_update': '🛒',
      'seller_order_received': '📦',
      'admin_order_created': '📋',
      'customer_support_reply': '💬',
      'admin_new_message': '📧'
    }
    return icons[type] || '🔔'
  }

  const getNotificationColor = (priority) => {
    const colors = {
      'low': 'text-gray-500',
      'normal': 'text-blue-600',
      'high': 'text-orange-600',
      'urgent': 'text-red-600'
    }
    return colors[priority] || 'text-blue-600'
  }

  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Только что'
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`
    return date.toLocaleDateString('ru-RU')
  }

  if (!isAuthenticated) return null

  return (
    <div className="relative">
      {/* Кнопка колокольчика */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <FiBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Выпадающее меню уведомлений */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Заголовок */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Уведомления
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Отметить все как прочитанные
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Список уведомлений */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Загрузка уведомлений...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                У вас пока нет уведомлений
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* Заголовок уведомления */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium ${getNotificationColor(notification.priority)}`}>
                            {notification.title.ru}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message.ru}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Действия */}
                      <div className="flex items-center space-x-1">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Отметить как прочитанное"
                          >
                            <FiCheck className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => archiveNotification(notification._id)}
                          className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                          title="Архивировать"
                        >
                          <FiArchive className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Удалить"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Кнопка действия */}
                    {notification.metadata?.actionUrl && (
                      <div className="mt-3">
                        <a
                          href={notification.metadata.actionUrl}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          {notification.metadata.actionText}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Футер */}
          <div className="p-4 border-t border-gray-200 text-center">
            <a
              href="/notifications"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Посмотреть все уведомления
            </a>
          </div>
        </div>
      )}

      {/* Затемнение при открытом меню */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default NotificationBell



