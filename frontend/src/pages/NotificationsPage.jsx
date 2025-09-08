import { useState, useEffect } from 'react'
import { FiBell, FiCheck, FiArchive, FiTrash2, FiFilter, FiX } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { notificationsApi } from '../services/api'

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, unread, read, archived
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [stats, setStats] = useState({})
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications()
      loadStats()
    }
  }, [isAuthenticated, filter, page])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const options = { page, limit: 20 }
      
      if (filter === 'unread') options.unreadOnly = true
      if (filter === 'archived') options.archived = true
      
      const response = await notificationsApi.getNotifications(options)
      if (response.success) {
        if (page === 1) {
          setNotifications(response.data.notifications)
        } else {
          setNotifications(prev => [...prev, ...response.data.notifications])
        }
        setHasMore(response.data.pagination.page < response.data.pagination.pages)
      }
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await notificationsApi.getNotificationStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error)
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
      loadStats() // Обновляем статистику
    } catch (error) {
      console.error('Ошибка отметки уведомления:', error)
    }
  }

  const archiveNotification = async (notificationId) => {
    try {
      await notificationsApi.archiveNotification(notificationId)
      setNotifications(prev => 
        prev.filter(n => n._id !== notificationId)
      )
      loadStats() // Обновляем статистику
    } catch (error) {
      console.error('Ошибка архивирования уведомления:', error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await notificationsApi.deleteNotification(notificationId)
      setNotifications(prev => 
        prev.filter(n => n._id !== notificationId)
      )
      loadStats() // Обновляем статистику
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
      loadStats() // Обновляем статистику
    } catch (error) {
      console.error('Ошибка отметки всех уведомлений:', error)
    }
  }

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    setPage(1)
    setNotifications([])
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
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

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Войдите в аккаунт
          </h1>
          <p className="text-gray-600">
            Для просмотра уведомлений необходимо войти в систему
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FiBell className="mr-3 text-blue-600" />
            Уведомления
          </h1>
          <p className="text-gray-600 mt-2">
            Оставайтесь в курсе всех событий вашего аккаунта
          </p>
        </div>
        
        {/* Статистика */}
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
            <div className="text-sm text-gray-500">Всего</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.unread || 0}</div>
            <div className="text-sm text-gray-500">Непрочитанные</div>
          </div>
          {stats.unread > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Отметить все как прочитанные
            </button>
          )}
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex items-center space-x-4 mb-6">
        <span className="text-sm font-medium text-gray-700">Фильтр:</span>
        {['all', 'unread', 'read', 'archived'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => handleFilterChange(filterType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterType
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterType === 'all' && 'Все'}
            {filterType === 'unread' && 'Непрочитанные'}
            {filterType === 'read' && 'Прочитанные'}
            {filterType === 'archived' && 'Архив'}
          </button>
        ))}
      </div>

      {/* Список уведомлений */}
      <div className="space-y-4">
        {notifications.length === 0 && !loading ? (
          <div className="text-center py-12">
            <FiBell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Уведомлений не найдено
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'У вас пока нет уведомлений'
                : `Нет уведомлений в категории "${filter}"`
              }
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-lg border p-6 hover:shadow-md transition-shadow ${
                !notification.isRead ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className={`text-lg font-semibold ${getNotificationColor(notification.priority)}`}>
                        {notification.title.ru}
                      </h4>
                      {!notification.isRead && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Новое
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">
                      {notification.message.ru}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{formatNotificationTime(notification.createdAt)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        notification.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {notification.priority === 'urgent' ? 'Срочно' :
                         notification.priority === 'high' ? 'Важно' :
                         notification.priority === 'normal' ? 'Обычно' : 'Низкий'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Действия */}
                <div className="flex items-center space-x-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Отметить как прочитанное"
                    >
                      <FiCheck className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => archiveNotification(notification._id)}
                    className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                    title="Архивировать"
                  >
                    <FiArchive className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Удалить"
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Кнопка действия */}
              {notification.metadata?.actionUrl && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <a
                    href={notification.metadata.actionUrl}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {notification.metadata.actionText}
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Кнопка "Загрузить еще" */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Загрузка...' : 'Загрузить еще'}
          </button>
        </div>
      )}

      {/* Индикатор загрузки */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-2">Загрузка уведомлений...</p>
        </div>
      )}
    </div>
  )
}

export default NotificationsPage

