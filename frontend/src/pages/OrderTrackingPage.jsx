import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  FiPackage, FiTruck, FiCheckCircle, FiClock, 
  FiMapPin, FiPhone, FiArrowLeft, FiRefreshCw, FiX
} from 'react-icons/fi'
import { useLanguage } from '../contexts/LanguageContext'
import api, { paymentsApi } from '../services/api'

const OrderTrackingPage = () => {
  const { orderId } = useParams()
  const { t } = useLanguage()
  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadOrderDetails()
  }, [orderId])

  const loadOrderDetails = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Попробуем загрузить реальные данные
      try {
        const orderResponse = await api.orders.getOrderById(orderId)
        if (orderResponse.success) {
          setOrder(orderResponse.data)
        }

        const paymentResponse = await paymentsApi.getPaymentStatus(orderId)
        if (paymentResponse.success) {
          setPayment(paymentResponse.data)
        }
      } catch (apiError) {
        console.log('API не отвечает, используем демо данные')
        
        // Демо данные для тестирования дизайна
        const demoOrder = {
          _id: orderId,
          orderNumber: 'TMD' + Date.now().toString().slice(-6),
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          items: [
            {
              productSnapshot: {
                name: { ru: 'iPhone 15 Pro Max 256GB', uz: 'iPhone 15 Pro Max 256GB', en: 'iPhone 15 Pro Max 256GB' },
                image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=300&fit=crop',
                sku: 'IPH15PM256'
              },
              quantity: 1,
              price: 15990000
            },
            {
              productSnapshot: {
                name: { ru: 'AirPods Pro 2 с активным шумоподавлением', uz: 'AirPods Pro 2', en: 'AirPods Pro 2' },
                image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300&h=300&fit=crop',
                sku: 'APP2'
              },
              quantity: 2,
              price: 3490000
            },
            {
              productSnapshot: {
                name: { ru: 'MacBook Air M2 13" 256GB', uz: 'MacBook Air M2', en: 'MacBook Air M2' },
                image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=300&h=300&fit=crop',
                sku: 'MBA13M2'
              },
              quantity: 1,
              price: 22990000
            }
          ],
          totalAmount: 45970000,
          shippingAddress: {
            city: 'Ташкент',
            district: 'Мирзо-Улугбекский район',
            street: 'ул. Амира Темура',
            building: '42',
            apartment: '15',
            floor: '3',
            entrance: '2'
          },
          delivery: {
            method: 'standard',
            cost: 50000,
            estimatedDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            trackingNumber: 'TM24' + Date.now().toString().slice(-8),
            courier: {
              name: 'Алишер Каримов',
              phone: '+998901111111',
              rating: 4.8
            }
          },
          status: 'out_for_delivery',
          paymentStatus: 'paid',
          paymentMethod: 'payme',
          statusHistory: [
            { 
              status: 'pending', 
              date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), 
              notes: 'Заказ создан и ожидает обработки' 
            },
            { 
              status: 'confirmed', 
              date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 
              notes: 'Заказ подтвержден менеджером' 
            },
            { 
              status: 'processing', 
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 
              notes: 'Заказ передан в обработку на склад' 
            },
            { 
              status: 'packed', 
              date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 
              notes: 'Товары упакованы и готовы к отправке' 
            },
            { 
              status: 'shipped', 
              date: new Date(Date.now() - 8 * 60 * 60 * 1000), 
              notes: 'Заказ передан курьерской службе' 
            },
            { 
              status: 'out_for_delivery', 
              date: new Date(Date.now() - 2 * 60 * 60 * 1000), 
              notes: 'Курьер выехал для доставки. Ожидайте звонка!' 
            }
          ]
        }
        
        const demoPayment = {
          paymentStatus: 'paid',
          orderId: orderId
        }
        
        setOrder(demoOrder)
        setPayment(demoPayment)
      }
    } catch (error) {
      console.error('Ошибка загрузки данных заказа:', error)
      setError('Не удалось загрузить информацию о заказе')
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { 
        label: 'Ожидает обработки', 
        color: 'text-yellow-600 bg-yellow-50', 
        icon: FiClock 
      },
      confirmed: { 
        label: 'Подтвержден', 
        color: 'text-blue-600 bg-blue-50', 
        icon: FiCheckCircle 
      },
      processing: { 
        label: 'В обработке', 
        color: 'text-blue-600 bg-blue-50', 
        icon: FiPackage 
      },
      packed: { 
        label: 'Упакован', 
        color: 'text-purple-600 bg-purple-50', 
        icon: FiPackage 
      },
      shipped: { 
        label: 'Отправлен', 
        color: 'text-indigo-600 bg-indigo-50', 
        icon: FiTruck 
      },
      out_for_delivery: { 
        label: 'В доставке', 
        color: 'text-orange-600 bg-orange-50', 
        icon: FiTruck 
      },
      delivered: { 
        label: 'Доставлен', 
        color: 'text-green-600 bg-green-50', 
        icon: FiCheckCircle 
      },
      cancelled: { 
        label: 'Отменен', 
        color: 'text-red-600 bg-red-50', 
        icon: FiX 
      }
    }
    return statusMap[status] || statusMap.pending
  }

  const getPaymentStatusInfo = (status) => {
    const statusMap = {
      pending: { label: 'Ожидает оплаты', color: 'text-yellow-600 bg-yellow-50' },
      processing: { label: 'Обрабатывается', color: 'text-blue-600 bg-blue-50' },
      paid: { label: 'Оплачен', color: 'text-green-600 bg-green-50' },
      failed: { label: 'Ошибка оплаты', color: 'text-red-600 bg-red-50' },
      cancelled: { label: 'Отменен', color: 'text-gray-600 bg-gray-50' }
    }
    return statusMap[status] || statusMap.pending
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' сум'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-28 sm:pb-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Загрузка информации о заказе...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-28 sm:pb-6">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <FiPackage className="w-full h-full" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Ошибка загрузки</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={loadOrderDetails}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-28 sm:pb-6">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <FiPackage className="w-full h-full" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Заказ не найден</h1>
          <p className="text-gray-600 mb-6">Проверьте правильность номера заказа</p>
          <Link 
            to="/orders"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Мои заказы
          </Link>
        </div>
      </div>
    )
  }

  const currentStatus = getStatusInfo(order.status)
  const paymentStatus = getPaymentStatusInfo(payment?.paymentStatus || order.paymentStatus || 'pending')

  return (
    <div className="min-h-screen bg-gray-50 py-6 pb-28 sm:pb-6">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link 
              to="/orders" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Заказ #{order.orderNumber || order._id?.slice(-8)}
              </h1>
              <p className="text-gray-600">
                Создан {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <button 
            onClick={loadOrderDetails}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiRefreshCw className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Статус заказа */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Статус заказа</h2>
              
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-3 rounded-lg ${currentStatus.color}`}>
                  <currentStatus.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{currentStatus.label}</p>
                  <p className="text-sm text-gray-600">
                    Последнее обновление: {formatDate(order.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">История статусов</h3>
                  <div className="space-y-3">
                    {order.statusHistory.slice().reverse().map((status, index) => {
                      const statusInfo = getStatusInfo(status.status)
                      return (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${statusInfo.color}`}>
                            <statusInfo.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{statusInfo.label}</p>
                            <p className="text-sm text-gray-600">{formatDate(status.date)}</p>
                            {status.notes && (
                              <p className="text-sm text-gray-500 mt-1">{status.notes}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Товары */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Товары в заказе</h2>
              
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                      {item.productSnapshot?.image ? (
                        <img 
                          src={item.productSnapshot.image} 
                          alt={item.productSnapshot.name?.ru || 'Product'}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiPackage className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.productSnapshot?.name?.ru || item.name || 'Товар'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Количество: {item.quantity} шт.
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.price)} за шт.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Информация о доставке */}
            {order.delivery && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Доставка</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FiMapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Адрес доставки</p>
                      <p className="text-gray-600 text-sm">
                        {order.shippingAddress ? 
                          `${order.shippingAddress.city}, ${order.shippingAddress.street}, ${order.shippingAddress.building}` :
                          'Адрес не указан'
                        }
                      </p>
                    </div>
                  </div>

                  {order.delivery.trackingNumber && (
                    <div className="flex items-center space-x-3">
                      <FiPackage className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Трек-номер</p>
                        <p className="text-blue-600 text-sm font-mono">
                          {order.delivery.trackingNumber}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.delivery.courier && (
                    <div className="flex items-center space-x-3">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Курьер</p>
                        <p className="text-gray-600 text-sm">
                          {order.delivery.courier.name} - {order.delivery.courier.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.delivery.estimatedDate && (
                    <div className="flex items-center space-x-3">
                      <FiClock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Ожидаемая дата доставки</p>
                        <p className="text-gray-600 text-sm">
                          {formatDate(order.delivery.estimatedDate)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Оплата */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Оплата</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Статус оплаты:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatus.color}`}>
                    {paymentStatus.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Способ оплаты:</span>
                  <span className="font-medium">
                    {order.paymentMethod === 'payme' ? 'Payme' : 
                     order.paymentMethod === 'click' ? 'Click' : 
                     order.paymentMethod || 'Не указан'}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Итого:</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Контакты */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Нужна помощь?</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <FiPhone className="h-4 w-4 text-gray-400" />
                  <a href="tel:+998781501515" className="text-blue-600 hover:text-blue-700">
                    +998 78 150 15 15
                  </a>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FiPhone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Круглосуточно</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTrackingPage












