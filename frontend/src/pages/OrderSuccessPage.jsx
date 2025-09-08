/**
 * ✅ СТРАНИЦА УСПЕШНОГО ОФОРМЛЕНИЯ ЗАКАЗА
 * Показывается после успешного оформления заказа
 */

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiCheckCircle, FiPackage, FiHome, FiShoppingBag } from 'react-icons/fi'

const OrderSuccessPage = () => {
  useEffect(() => {
    // Можно добавить аналитику или уведомления
    console.log('Заказ успешно оформлен')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        
        {/* Иконка успеха */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle className="w-10 h-10 text-green-600" />
        </div>

        {/* Заголовок */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Заказ успешно оформлен!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Спасибо за покупку! Мы отправили подтверждение на вашу электронную почту.
        </p>

        {/* Информация о заказе */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">Что дальше?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span>Мы обработаем ваш заказ в течение 1-2 часов</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span>Вы получите SMS с номером для отслеживания</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span>Доставка в течение 1-3 рабочих дней</span>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="space-y-3">
          <Link
            to="/orders"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FiPackage className="mr-2" />
            Отследить заказ
          </Link>
          
          <Link
            to="/catalog"
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <FiShoppingBag className="mr-2" />
            Продолжить покупки
          </Link>
          
          <Link
            to="/"
            className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 transition-colors flex items-center justify-center"
          >
            <FiHome className="mr-2" />
            На главную
          </Link>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Есть вопросы? <Link to="/contacts" className="text-blue-600 hover:text-blue-700">Свяжитесь с нами</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage

