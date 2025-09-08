import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMinus, FiPlus, FiTrash2, FiShoppingCart, FiArrowLeft, FiCreditCard } from 'react-icons/fi'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import api, { paymentsApi } from '../services/api'

const CartPage = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const {
    items: cartItems,
    totalAmount,
    totalItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    formatPrice
  } = useCart()
  const { isAuthenticated } = useAuth()
  
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  const getDeliveryFee = () => {
    return totalAmount > 1000000 ? 0 : 50000 // Бесплатная доставка от 1 млн сум
  }

  const getTotal = () => {
    return totalAmount + getDeliveryFee()
  }

  const getItemImage = (image) => {
    if (!image) return null
    
    if (typeof image === 'object') {
      return image?.url || image?.src
    }
    
    return image
  }

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }

    setIsCheckingOut(true)
    setCheckoutError('')

    try {
      // Создаем реальный заказ через API
      console.log('🛒 Создание заказа с товарами:', cartItems)
      console.log('💰 Общая сумма:', getTotal())
      
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: getTotal(),
        status: 'pending'
      }
      
      const orderResponse = await api.orders.createOrder(orderData)
      
      if (orderResponse.success && orderResponse.data) {
        console.log('✅ Заказ создан:', orderResponse.data._id)
        
        // Создаем платеж через Payme
        const paymentData = {
          orderId: orderResponse.data._id,
          paymentMethod: 'payme'
        }
        
        const paymentResponse = await paymentsApi.createPayment(paymentData)
        
        if (paymentResponse.success && paymentResponse.data.paymentUrl) {
          console.log('💳 Перенаправляем на Payme:', paymentResponse.data.paymentUrl)
          clearCart()
          // Перенаправляем на Payme для оплаты
          window.location.href = paymentResponse.data.paymentUrl
        } else {
          // Если нет URL для оплаты, перенаправляем на страницу подтверждения
          clearCart()
          navigate(`/order-confirmation/${orderResponse.data._id}`)
        }
      } else {
        throw new Error('Не удалось создать заказ')
      }
      
    } catch (error) {
      console.error('Ошибка создания заказа:', error)
      setCheckoutError('Ошибка при создании заказа. Попробуйте еще раз.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  // Если корзина пуста
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-md mx-auto text-center">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
              <FiShoppingCart className="h-16 w-16 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {t('cart.empty', 'Your cart is empty')}
            </h1>
            <p className="text-gray-600 mb-8">
              {t('cart.empty_desc', 'Add items to your cart to continue shopping')}
            </p>
            <Link
              to="/"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <FiShoppingCart className="h-5 w-5" />
              <span>{t('cart.go_shopping', 'Go Shopping')}</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
            <span>{t('cart.back', 'Back')}</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            {t('cart.title', 'Shopping Cart')} ({totalItems})
          </h1>

          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            {t('cart.clear_cart', 'Clear Cart')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t('cart.items_count', 'Items')} ({totalItems})
                </h2>
                
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={getItemImage(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-lg font-bold text-blue-600">
                          {formatPrice ? formatPrice(item.price) : `${item.price} сум`}
                        </p>
                      </div>
                      
                      {/* Quantity Controls - красивые кнопки */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <FiMinus className="h-4 w-4 text-gray-600" />
                        </button>
                        
                        <span className="w-12 text-center font-semibold text-lg">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                          <FiPlus className="h-4 w-4 text-white" />
                        </button>
                      </div>
                      
                      {/* Remove Button - красивая */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-9 h-9 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-lg transition-colors"
                        title={t('cart.remove_item', 'Remove Item')}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {t('cart.order_summary', 'Order Summary')}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>{t('cart.items_count', 'Items')} ({totalItems})</span>
                  <span>{formatPrice ? formatPrice(totalAmount) : `${totalAmount} сум`}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>{t('cart.delivery', 'Delivery')}</span>
                  <span>
                    {getDeliveryFee() === 0 ? t('cart.free_delivery', 'Free') : `${getDeliveryFee()} сум`}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>{t('cart.total', 'Total')}</span>
                    <span>{formatPrice ? formatPrice(getTotal()) : `${getTotal()} сум`}</span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {checkoutError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                  {checkoutError}
                </div>
              )}

              {/* Checkout Button - красивая */}
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingOut ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Обработка заказа...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <FiCreditCard className="h-6 w-6" />
                    <span>Оформить заказ</span>
                  </div>
                )}
              </button>

              {/* Additional Info */}
              <div className="mt-6 text-sm text-gray-500 text-center">
                <p>{t('cart.checkout_agreement', 'By clicking the button, you agree to the purchase terms')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage

