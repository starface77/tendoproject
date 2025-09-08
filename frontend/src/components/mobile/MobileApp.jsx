import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'

const MobileApp = ({ children }) => {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  const { totalItems } = useCart()
  
  const [activeTab, setActiveTab] = useState(() => {
    // Определяем активную вкладку на основе текущего пути
    const path = location.pathname
    if (path === '/') return 'home'
    if (path === '/search') return 'search'
    if (path === '/cart') return 'cart'
    if (path === '/orders') return 'orders'
    if (path === '/profile' || path === '/login' || path === '/register') return 'profile'
    return 'home'
  })

  const navigationItems = [
    {
      id: 'home',
      label: 'Главная',
      icon: '/images/Иконка - Главная.png',
      path: '/',
      active: activeTab === 'home'
    },
    {
      id: 'search',
      label: 'Поиск',
      icon: '/images/Тендо Айди 2D иконка поиск.png',
      path: '/search',
      active: activeTab === 'search'
    },
    {
      id: 'cart',
      label: 'Корзина',
      icon: '/images/Тендо Айди 2D иконка корзина.png',
      path: '/cart',
      active: activeTab === 'cart',
      badge: totalItems > 0 ? totalItems : null
    },
    {
      id: 'orders',
      label: 'Заказы',
      icon: '/images/Иконка - Новый заказ.png',
      path: '/orders',
      active: activeTab === 'orders'
    },
    {
      id: 'profile',
      label: 'Профиль',
      icon: '/images/Тендо Айди 2D иконка профиль.png',
      path: isAuthenticated ? '/profile' : '/login',
      active: activeTab === 'profile'
    }
  ]

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-all duration-200 ${
                item.active 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              <div className="relative">
                <img 
                  src={item.icon} 
                  alt={item.label}
                  className={`w-6 h-6 transition-all duration-200 ${
                    item.active ? 'scale-110' : 'scale-100'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium transition-all duration-200 ${
                item.active ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default MobileApp
