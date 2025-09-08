import { useState, useEffect } from 'react'
import { FiMessageSquare, FiSend, FiUser, FiMessageCircle, FiClock } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

const MessagesPage = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      loadMessages()
    }
  }, [isAuthenticated])

  const loadMessages = async () => {
    try {
      setLoading(true)
      // Загружаем уведомления типа customer_support_reply
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/notifications?type=customer_support_reply`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessages(data.data.notifications)
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return 'Только что'
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Войдите в аккаунт
          </h1>
          <p className="text-gray-600">
            Для просмотра сообщений необходимо войти в систему
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
            <FiMessageSquare className="mr-3 text-blue-600" />
            Сообщения поддержки
          </h1>
          <p className="text-gray-600 mt-2">
            Ваши переписки с службой поддержки
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{messages.length}</div>
          <div className="text-sm text-gray-500">Всего сообщений</div>
        </div>
      </div>

      {/* Список сообщений */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Загрузка сообщений...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FiMessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              У вас пока нет сообщений
            </h3>
            <p className="text-gray-500 mb-4">
              Здесь будут отображаться ответы от службы поддержки
            </p>
            <a
              href="/contacts"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Написать в поддержку
            </a>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Заголовок сообщения */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <FiMessageCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {message.title.ru}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {message.status === 'read' ? 'Прочитано' : 'Не прочитано'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Содержимое сообщения */}
              <div className="px-6 py-4">
                <p className="text-gray-700 leading-relaxed">
                  {message.message.ru}
                </p>

                {/* Связанные данные */}
                {message.relatedData?.contact && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Тема обращения:</strong> {message.relatedData.contact.subject}
                    </p>
                  </div>
                )}
              </div>

              {/* Действия */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => {/* TODO: Показать историю переписки */}}
                    >
                      Посмотреть историю
                    </button>
                    <button
                      className="text-sm text-gray-600 hover:text-gray-700"
                      onClick={() => {/* TODO: Ответить на сообщение */}}
                    >
                      Ответить
                    </button>
                  </div>

                  <a
                    href="/contacts"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Новое обращение
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MessagesPage

