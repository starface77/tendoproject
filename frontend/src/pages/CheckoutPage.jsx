/**
 * 🛒 СТРАНИЦА ОФОРМЛЕНИЯ ЗАКАЗА
 * Финальный этап покупки с вводом данных и выбором способа оплаты
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMapPin, FiCreditCard, FiTruck, FiCheck, FiArrowLeft, FiEdit3 } from 'react-icons/fi'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const CheckoutPage = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { cartItems, getTotalPrice, clearCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  
  const [currentStep, setCurrentStep] = useState(1) // 1-адрес, 2-доставка, 3-оплата, 4-подтверждение
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState({
    // Адрес доставки
    address: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      city: user?.city || 'tashkent',
      street: '',
      house: '',
      apartment: '',
      entrance: '',
      floor: '',
      intercom: '',
      comment: ''
    },
    // Способ доставки
    delivery: {
      type: 'courier', // courier, pickup, express
      date: '',
      timeSlot: '',
      cost: 0
    },
    // Способ оплаты
    payment: {
      method: 'card', // card, cash, online
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCvv: ''
    }
  })

  const cities = [
    { value: 'tashkent', name: t('tashkent', 'Ташкент') },
    { value: 'samarkand', name: t('samarkand', 'Самарканд') },
    { value: 'bukhara', name: t('bukhara', 'Бухара') },
    { value: 'andijan', name: t('andijan', 'Андижан') },
    { value: 'namangan', name: t('namangan', 'Наманган') }
  ]

  const deliveryOptions = [
    {
      type: 'courier',
      name: t('courier_delivery', 'Курьерская доставка'),
      description: t('courier_description', 'Доставка в течение 1-3 дней'),
      cost: 25000,
      icon: '🚚'
    },
    {
      type: 'pickup',
      name: t('pickup_delivery', 'Самовывоз'),
      description: t('pickup_description', 'Забрать из пункта выдачи'),
      cost: 0,
      icon: '📦'
    },
    {
      type: 'express',
      name: t('express_delivery', 'Экспресс доставка'),
      description: t('express_description', 'Доставка в течение 2-4 часов'),
      cost: 75000,
      icon: '⚡'
    }
  ]

  const paymentMethods = [
    {
      method: 'card',
      name: t('card_payment', 'Банковская карта'),
      description: 'Visa, MasterCard, UzCard',
      icon: '💳'
    },
    {
      method: 'cash',
      name: t('cash_payment', 'Наличными курьеру'),
      description: t('cash_description', 'Оплата при получении'),
      icon: '💵'
    },
    {
      method: 'online',
      name: t('online_payment', 'Онлайн платежи'),
      description: t('online_description', 'PayMe, Click, Payme'),
      icon: '📱'
    }
  ]

  // Проверяем авторизацию и наличие товаров
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout')
      return
    }
    
    if (cartItems.length === 0) {
      navigate('/cart')
      return
    }
  }, [isAuthenticated, cartItems.length, navigate])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' сум'
  }

  const updateOrderData = (section, field, value) => {
    setOrderData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const validateStep = (step) => {
    switch (step) {
      case 1: // Адрес
        const { firstName, lastName, phone, city, street, house } = orderData.address
        return firstName && lastName && phone && city && street && house
      case 2: // Доставка
        return orderData.delivery.type
      case 3: // Оплата
        if (orderData.payment.method === 'card') {
          const { cardNumber, cardName, cardExpiry, cardCvv } = orderData.payment
          return cardNumber && cardName && cardExpiry && cardCvv
        }
        return true
      default:
        return true
    }
  }

  const submitOrder = async () => {
    setLoading(true)
    try {
      // Создаем заказ
      const order = {
        items: cartItems,
        address: orderData.address,
        delivery: orderData.delivery,
        payment: { method: orderData.payment.method }, // Не отправляем данные карты
        totalPrice: getTotalPrice() + orderData.delivery.cost,
        createdAt: new Date().toISOString()
      }

      console.log('Отправляем заказ:', order)

      // Имитация отправки заказа (можно заменить на реальный API вызов)
      try {
        // Здесь можно добавить реальный API вызов
        // const response = await ordersApi.createOrder(order)

        // Имитация задержки
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Сохраняем заказ локально
        const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
        savedOrders.push({
          ...order,
          id: Date.now(),
          status: 'pending'
        })
        localStorage.setItem('orders', JSON.stringify(savedOrders))

        // Очищаем корзину
        clearCart()

        // Переходим на страницу успеха
        navigate('/order-success')

      } catch (apiError) {
        console.error('Ошибка API:', apiError)
        alert(t('order_error', 'Ошибка связи с сервером. Попробуйте еще раз.'))
        return
      }

    } catch (error) {
      console.error('Ошибка оформления заказа:', error)
      alert(t('order_validation_error', 'Проверьте правильность введенных данных'))
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return null // Перенаправление уже происходит в useEffect
  }

  const subtotal = getTotalPrice()
  const deliveryCost = orderData.delivery.cost
  const total = subtotal + deliveryCost

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        
        {/* Заголовок */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="mr-2" />
{t('back_to_cart', 'Вернуться в корзину')}
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t('checkout_title', 'Оформление заказа')}</h1>
        </div>

        {/* Прогресс-бар */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: t('delivery_address', 'Адрес'), icon: FiMapPin },
              { step: 2, title: t('delivery_method', 'Доставка'), icon: FiTruck },
              { step: 3, title: t('payment_method', 'Оплата'), icon: FiCreditCard },
              { step: 4, title: t('order_confirmation', 'Подтверждение'), icon: FiCheck }
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {title}
                </span>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-4 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Основная форма */}
          <div className="lg:col-span-2">
            
            {/* Шаг 1: Адрес доставки */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Адрес доставки</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имя *
                    </label>
                    <input
                      type="text"
                      value={orderData.address.firstName}
                      onChange={(e) => updateOrderData('address', 'firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Фамилия *
                    </label>
                    <input
                      type="text"
                      value={orderData.address.lastName}
                      onChange={(e) => updateOrderData('address', 'lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      value={orderData.address.phone}
                      onChange={(e) => updateOrderData('address', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Город *
                    </label>
                    <select
                      value={orderData.address.city}
                      onChange={(e) => updateOrderData('address', 'city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {cities.map(city => (
                        <option key={city.value} value={city.value}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Улица *
                    </label>
                    <input
                      type="text"
                      value={orderData.address.street}
                      onChange={(e) => updateOrderData('address', 'street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дом *
                    </label>
                    <input
                      type="text"
                      value={orderData.address.house}
                      onChange={(e) => updateOrderData('address', 'house', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Квартира
                    </label>
                    <input
                      type="text"
                      value={orderData.address.apartment}
                      onChange={(e) => updateOrderData('address', 'apartment', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Комментарий для курьера
                    </label>
                    <textarea
                      value={orderData.address.comment}
                      onChange={(e) => updateOrderData('address', 'comment', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Дополнительная информация для доставки..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Шаг 2: Способ доставки */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Способ доставки</h2>
                
                <div className="space-y-4">
                  {deliveryOptions.map(option => (
                    <label
                      key={option.type}
                      className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                        orderData.delivery.type === option.type
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value={option.type}
                        checked={orderData.delivery.type === option.type}
                        onChange={(e) => {
                          updateOrderData('delivery', 'type', e.target.value)
                          updateOrderData('delivery', 'cost', option.cost)
                        }}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{option.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900">{option.name}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {option.cost === 0 ? 'Бесплатно' : formatPrice(option.cost)}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Шаг 3: Способ оплаты */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Способ оплаты</h2>
                
                <div className="space-y-4 mb-6">
                  {paymentMethods.map(method => (
                    <label
                      key={method.method}
                      className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                        orderData.payment.method === method.method
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.method}
                        checked={orderData.payment.method === method.method}
                        onChange={(e) => updateOrderData('payment', 'method', e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{method.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{method.name}</div>
                          <div className="text-sm text-gray-600">{method.description}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Форма карты */}
                {orderData.payment.method === 'card' && (
                  <div className="border-t pt-6">
                    <h3 className="font-medium text-gray-900 mb-4">Данные банковской карты</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Номер карты *
                        </label>
                        <input
                          type="text"
                          value={orderData.payment.cardNumber}
                          onChange={(e) => updateOrderData('payment', 'cardNumber', e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Имя на карте *
                        </label>
                        <input
                          type="text"
                          value={orderData.payment.cardName}
                          onChange={(e) => updateOrderData('payment', 'cardName', e.target.value)}
                          placeholder="JOHN SMITH"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Срок действия *
                        </label>
                        <input
                          type="text"
                          value={orderData.payment.cardExpiry}
                          onChange={(e) => updateOrderData('payment', 'cardExpiry', e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={orderData.payment.cardCvv}
                          onChange={(e) => updateOrderData('payment', 'cardCvv', e.target.value)}
                          placeholder="123"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Шаг 4: Подтверждение */}
            {currentStep === 4 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Подтверждение заказа</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Адрес доставки</h3>
                    <div className="text-sm text-gray-600">
                      <p>{orderData.address.firstName} {orderData.address.lastName}</p>
                      <p>{orderData.address.phone}</p>
                      <p>
                        {cities.find(c => c.value === orderData.address.city)?.name}, 
                        {orderData.address.street}, д. {orderData.address.house}
                        {orderData.address.apartment && `, кв. ${orderData.address.apartment}`}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center mt-2"
                    >
                      <FiEdit3 className="mr-1 h-3 w-3" />
                      Изменить
                    </button>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Доставка</h3>
                    <div className="text-sm text-gray-600">
                      <p>{deliveryOptions.find(d => d.type === orderData.delivery.type)?.name}</p>
                      <p>{formatPrice(orderData.delivery.cost)}</p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center mt-2"
                    >
                      <FiEdit3 className="mr-1 h-3 w-3" />
                      Изменить
                    </button>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Оплата</h3>
                    <div className="text-sm text-gray-600">
                      <p>{paymentMethods.find(p => p.method === orderData.payment.method)?.name}</p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center mt-2"
                    >
                      <FiEdit3 className="mr-1 h-3 w-3" />
                      Изменить
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Навигация */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiArrowLeft className="mr-2" />
{t('previous_step', 'Назад')}
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={handleNextStep}
                  disabled={!validateStep(currentStep)}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    validateStep(currentStep)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
{t('next_step', 'Далее')}
                </button>
              ) : (
                <button
                  onClick={submitOrder}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
                >
{loading ? t('processing', 'Оформляем...') : t('place_order', 'Оформить заказ')}
                </button>
              )}
            </div>
          </div>

          {/* Сайдбар с итогами */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ваш заказ</h3>
              
              {/* Товары */}
              <div className="space-y-3 mb-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image || '/images/placeholder-product.jpg'}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAxNkwyNCAzMk0xNiAyNEwzMiAyNCIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+'
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} шт. × {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Товары ({cartItems.length})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Доставка</span>
                  <span>
                    {deliveryCost === 0 ? 'Бесплатно' : formatPrice(deliveryCost)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Итого</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage

