import React from 'react'
import { Link } from 'react-router-dom'

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🧪 Тестовая страница
        </h1>
        <p className="text-gray-600 mb-6">
          Если вы видите эту страницу, значит роутинг работает!
        </p>
        
        <div className="space-y-3">
          <Link 
            to="/" 
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🏠 Главная страница
          </Link>
          
          <Link 
            to="/profile" 
            className="block w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            👤 Профиль
          </Link>
          
          <Link 
            to="/cart" 
            className="block w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            🛒 Корзина
          </Link>
          
          <Link 
            to="/wishlist" 
            className="block w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            ❤️ Избранное
          </Link>
        </div>
        
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Статус системы:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>✅ React работает</div>
            <div>✅ Роутинг работает</div>
            <div>✅ Страница загружается</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPage


