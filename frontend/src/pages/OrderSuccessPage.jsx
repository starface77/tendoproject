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
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
        
        {/* Иконка успеха */}
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle className="w-8 h-8 text-blue-600" />
        </div>

        {/* Заголовок */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Заказ успешно оформлен!
        </h1>
        
        <p className="text-gray-600 mb-8 text-sm">
          Спасибо за покупку! Мы отправили подтверждение на вашу электронную почту.
        </p>

        {/* Информация о заказе */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Что дальше?</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-3"></div>
              <span>Мы обработаем ваш заказ в течение 1-2 часов</span>
            </div>
            <div className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-3"></div>
              <span>Вы получите SMS с номером для отслеживания</span>
            </div>
            <div className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-3"></div>
              <span>Доставка в течение 1-3 рабочих дней</span>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="space-y-3">
          <Link
            to="/orders"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-semibold"
          >
            <FiPackage className="mr-2 h-5 w-5" />
            <span>Отследить заказ</span>
          </Link>
          
          <Link
            to="/catalog"
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center font-semibold"
          >
            <FiShoppingBag className="mr-2 h-5 w-5" />
            <span>Продолжить покупки</span>
          </Link>
          
          <Link
            to="/"
            className="w-full text-gray-600 hover:text-blue-600 py-3 px-4 transition-colors flex items-center justify-center font-semibold"
          >
            <FiHome className="mr-2 h-5 w-5" />
            <span>На главную</span>
          </Link>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Есть вопросы? <Link to="/contacts" className="text-blue-600 hover:text-blue-700 font-semibold">Свяжитесь с нами</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage