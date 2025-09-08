/**
 * 💳 СТАТУС ПЛАТЕЖА
 * Страница отображения статуса платежа
 */

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiCheck, FiX, FiClock, FiArrowLeft, FiRefreshCw, FiCreditCard } from 'react-icons/fi'
import { paymentsApi } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const PaymentStatusPage = () => {
  const { paymentId } = useParams()
  const navigate = useNavigate()
  
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (paymentId) {
      loadPayment()
    }
  }, [paymentId])

  const loadPayment = async () => {
    try {
      setError('')
      const response = await paymentsApi.getPayment(paymentId)
      
      if (response.success) {
        setPayment(response.data)
      } else {
        setError('Платеж не найден')
      }
    } catch (err) {
      console.error('Error loading payment:', err)
      setError('Ошибка загрузки платежа')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadPayment()
    setRefreshing(false)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' сум'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheck className="h-8 w-8 text-green-600" />
      case 'failed':
      case 'cancelled':
        return <FiX className="h-8 w-8 text-red-600" />
      case 'processing':
        return <FiClock className="h-8 w-8 text-blue-600" />
      default:
        return <FiClock className="h-8 w-8 text-yellow-600" />
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Ожидает оплаты',
      processing: 'Обрабатывается',
      completed: 'Оплачен',
      failed: 'Ошибка оплаты',
      cancelled: 'Отменен',
      refunded: 'Возврат средств'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status) => {
    const colorMap = {
      pending: 'text-yellow-600 bg-yellow-100',
      processing: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      failed: 'text-red-600 bg-red-100',
      cancelled: 'text-gray-600 bg-gray-100',
      refunded: 'text-purple-600 bg-purple-100'
    }
    return colorMap[status] || 'text-gray-600 bg-gray-100'
  }

  const getPaymentMethodName = (method) => {
    const methodMap = {
      click: 'Click',
      payme: 'Payme',
      uzcard: 'UzCard',
      humo: 'Humo',
      visa: 'Visa',
      mastercard: 'MasterCard',
      cash_on_delivery: 'Наличными при доставке',
      bank_transfer: 'Банковский перевод'
    }
    return methodMap[method] || method
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !payment) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <FiX className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-900 mb-4">
            {error || 'Платеж не найден'}
          </h1>
          <div className="space-x-4">
            <Link 
              to="/profile"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              К заказам
            </Link>
            <Link 
              to="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700"
        >
          <FiArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          Статус платежа
        </h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
        >
          <FiRefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Payment Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              {getStatusIcon(payment.status)}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {getStatusText(payment.status)}
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
              {getStatusText(payment.status)}
            </span>
          </div>

          {/* Payment Timeline */}
          <div className="space-y-4">
            {payment.requestedAt && (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Платеж создан</p>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.requestedAt).toLocaleString('ru-RU')}
                  </p>
                </div>
              </div>
            )}

            {payment.processedAt && (
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  payment.status === 'processing' ? 'bg-blue-600' : 'bg-gray-300'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-900">Обработка начата</p>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.processedAt).toLocaleString('ru-RU')}
                  </p>
                </div>
              </div>
            )}

            {payment.completedAt && (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Платеж завершен</p>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.completedAt).toLocaleString('ru-RU')}
                  </p>
                </div>
              </div>
            )}

            {payment.failedAt && (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Ошибка платежа</p>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.failedAt).toLocaleString('ru-RU')}
                  </p>
                  {payment.transactionInfo?.errorMessage && (
                    <p className="text-sm text-red-600 mt-1">
                      {payment.transactionInfo.errorMessage}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            {payment.status === 'completed' && (
              <Link
                to={`/order-confirmation/${payment.order._id}`}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center block"
              >
                Перейти к заказу
              </Link>
            )}

            {payment.status === 'failed' && (
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Повторить оплату
              </button>
            )}

            {payment.isPending && (
              <div className="text-center text-gray-600 text-sm">
                Обновление статуса может занять несколько минут
              </div>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-6">
          
          {/* Amount Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiCreditCard className="h-5 w-5 mr-2" />
              Детали платежа
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Сумма:</span>
                <span className="font-medium text-2xl text-blue-600">
                  {formatPrice(payment.amount)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Способ оплаты:</span>
                <span className="font-medium">
                  {getPaymentMethodName(payment.paymentMethod)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">ID платежа:</span>
                <span className="font-mono text-sm">
                  {payment._id}
                </span>
              </div>

              {payment.cardDetails?.maskedNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Карта:</span>
                  <span className="font-mono">
                    {payment.cardDetails.maskedNumber}
                  </span>
                </div>
              )}

              {payment.transactionInfo?.merchantFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Комиссия:</span>
                  <span className="text-orange-600">
                    {formatPrice(payment.transactionInfo.merchantFee)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Info */}
          {payment.order && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Информация о заказе
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Номер заказа:</span>
                  <span className="font-medium">
                    #{payment.order._id?.slice(-8)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Статус заказа:</span>
                  <span className="font-medium">
                    {payment.order.status}
                  </span>
                </div>

                <Link
                  to={`/order-confirmation/${payment.order._id}`}
                  className="block w-full text-center bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  Подробности заказа
                </Link>
              </div>
            </div>
          )}

          {/* Support */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Нужна помощь?
            </h3>
            
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                Если у вас возникли вопросы по платежу, свяжитесь с нашей службой поддержки:
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>+998 90 123 45 67</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✉️</span>
                  <span>support@navatmarket.uz</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>💬</span>
                  <span>Telegram: @navatmarket_support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentStatusPage





