import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiArrowLeft, FiEye } from 'react-icons/fi'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { ordersApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const OrdersPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders()
    }
  }, [isAuthenticated])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Загружаем заказы пользователя...')
      const response = await ordersApi.getUserOrders()

      console.log('✅ Заказы загружены:', response)
      setOrders(response.data || [])
    } catch (error) {
      console.error('❌ Ошибка загрузки заказов:', error)
      setError('Не удалось загрузить заказы. Проверьте подключение к интернету.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { text: t('order_status_pending', 'Ожидает подтверждения'), color: 'text-yellow-600', bg: 'bg-yellow-100', icon: FiClock }
      case 'confirmed':
        return { text: t('order_status_confirmed', 'Подтвержден'), color: 'text-blue-600', bg: 'bg-blue-100', icon: FiPackage }
      case 'shipped':
        return { text: t('order_status_shipped', 'Отправлен'), color: 'text-purple-600', bg: 'bg-purple-100', icon: FiTruck }
      case 'delivered':
        return { text: t('order_status_delivered', 'Доставлен'), color: 'text-green-600', bg: 'bg-green-100', icon: FiCheckCircle }
      default:
        return { text: t('order_status_unknown', 'Неизвестно'), color: 'text-gray-600', bg: 'bg-gray-100', icon: FiPackage }
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        
        {/* Кнопка Назад */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-6"
          >
            <FiArrowLeft className="mr-2" />
{t('back', 'Назад')}
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiPackage className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('my_orders', 'Мои заказы')}</h1>
              <p className="text-gray-600">{t('purchase_history', 'История ваших покупок')}</p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('loading_error', 'Ошибка загрузки')}</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadOrders}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {t('try_again', 'Попробовать снова')}
            </button>
          </div>
        )}

        {/* Content */}
        {!error && orders.length === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('no_orders_yet', 'Заказов пока нет')}</h3>
            <p className="text-gray-600 mb-6">{t('make_first_order', 'Сделайте свой первый заказ и он появится здесь')}</p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {t('start_shopping', 'Перейти к покупкам')}
            </Link>
          </div>
        ) : !error && (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status)
              const StatusIcon = statusInfo.icon
              
              return (
                <div key={order.id || order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Заказ {order.orderNumber || order.id}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full ${statusInfo.bg}`}>
                          <span className={`text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        
                        <Link
                          to={`/order/${order.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <FiEye className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                          <div key={item.id || item._id || index} className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                                <span className="text-lg">📱</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{item.name || t('product', 'Товар')}</p>
                                <p className="text-sm text-gray-500">{t('quantity', 'Количество')}: {item.quantity || 1}</p>
                              </div>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {new Intl.NumberFormat('uz-UZ').format(item.price || 0)} сум
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500">{t('product_info_unavailable', 'Информация о товарах недоступна')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="px-6 py-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                        <span className="text-sm text-gray-600">
{t('status', 'Статус')}: {statusInfo.text}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{t('total', 'Итого')}:</p>
                        <p className="text-xl font-bold text-gray-900">
                          {new Intl.NumberFormat('uz-UZ').format(order.pricing?.total || order.total || 0)} сум
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage
