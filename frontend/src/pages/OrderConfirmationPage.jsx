/**
 * ✅ СТРАНИЦА ПОДТВЕРЖДЕНИЯ ЗАКАЗА
 * Показывается после успешного создания заказа
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiCheck, FiPackage, FiTruck, FiMapPin, FiPhone, FiClock } from 'react-icons/fi'
import { ordersApi } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const OrderConfirmationPage = () => {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const loadOrder = async () => {
    try {
      const response = await ordersApi.getOrder(orderId)
      
      if (response.success) {
        setOrder(response.data)
      } else {
        setError('Заказ не найден')
      }
    } catch (err) {
      console.error('Error loading order:', err)
      setError('Ошибка загрузки заказа')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' сум'
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'В обработке',
      confirmed: 'Подтвержден',
      processing: 'Собирается',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменен'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status) => {
    const colorMap = {
      pending: 'text-yellow-600 bg-yellow-100',
      confirmed: 'text-blue-600 bg-blue-100', 
      processing: 'text-indigo-600 bg-indigo-100',
      shipped: 'text-purple-600 bg-purple-100',
      delivered: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100'
    }
    return colorMap[status] || 'text-gray-600 bg-gray-100'
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-red-900 mb-4">Ошибка</h1>
          <p className="text-red-700 mb-6">{error}</p>
          <Link 
            to="/profile"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Перейти к заказам
          </Link>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Заказ не найден</h1>
        <Link 
          to="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Вернуться на главную
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Спасибо за заказ!
        </h1>
        <p className="text-lg text-gray-600">
          Ваш заказ успешно создан и находится в обработке
        </p>
      </div>

      {/* Order Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Заказ №{order._id?.slice(-8) || order.id}
            </h2>
            <p className="text-gray-600">
              Создан: {new Date(order.createdAt).toLocaleString('ru-RU')}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
        </div>

        {/* Order Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheck className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Заказ создан</p>
              <p className="text-sm text-gray-500">Сейчас</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-400'
            }`}>
              <FiPackage className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Подтверждение</p>
              <p className="text-sm text-gray-500">В течение часа</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              ['shipped', 'delivered'].includes(order.status)
                ? 'bg-purple-100 text-purple-600'
                : 'bg-gray-100 text-gray-400'
            }`}>
              <FiTruck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Доставка</p>
              <p className="text-sm text-gray-500">1-3 дня</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              order.status === 'delivered'
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-400'
            }`}>
              <FiCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Получено</p>
              <p className="text-sm text-gray-500">По адресу</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Товары в заказе</h3>
          
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex space-x-3">
                <img
                  src={item.product?.images?.[0] || '/placeholder-product.jpg'}
                  alt={item.product?.name}
                  className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {item.product?.name || 'Товар'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {item.quantity} шт × {formatPrice(item.price)}
                  </p>
                  <p className="font-medium text-blue-600">
                    {formatPrice(item.quantity * item.price)}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500">Товары загружаются...</p>
            )}
          </div>

          {/* Order Total */}
          <div className="border-t border-gray-200 mt-6 pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Товары:</span>
              <span className="font-medium">{formatPrice(order.totalAmount - (order.deliveryFee || 0))}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Доставка:</span>
                <span className="font-medium">{formatPrice(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span>Итого:</span>
              <span className="text-blue-600">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Delivery and Contact Info */}
        <div className="space-y-6">
          
          {/* Delivery Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiTruck className="h-5 w-5 mr-2" />
              Доставка
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FiMapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Адрес доставки</p>
                  <p className="text-gray-600">
                    {order.deliveryAddress || 'Не указан'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FiClock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Время доставки</p>
                  <p className="text-gray-600">1-3 рабочих дня</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiPhone className="h-5 w-5 mr-2" />
              Контакты
            </h3>
            
            <div className="space-y-3">
              <p className="text-gray-600">
                Мы свяжемся с вами для подтверждения заказа и уточнения деталей доставки.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900">
                  📞 Горячая линия: +998 90 123 45 67
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Работаем 24/7
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
        <Link
          to="/profile"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
        >
          Отслеживать заказ
        </Link>
        <Link
          to="/"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
        >
          Продолжить покупки
        </Link>
      </div>
    </div>
  )
}

export default OrderConfirmationPage





