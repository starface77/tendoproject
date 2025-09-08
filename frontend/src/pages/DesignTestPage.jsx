/**
 * ТЕСТОВАЯ СТРАНИЦА ДЛЯ ПРОВЕРКИ ДИЗАЙНА
 * Содержит ссылки на все созданные страницы для проверки
 */

import { Link } from 'react-router-dom'
import { 
  FiHome, FiShoppingBag, FiGrid, FiSearch, FiShoppingCart, 
  FiHeart, FiUser, FiSettings, FiPackage, FiHelpCircle,
  FiInfo, FiPhone, FiTruck, FiFileText, FiShield,
  FiCheckCircle, FiCreditCard
} from 'react-icons/fi'

const DesignTestPage = () => {
  const pageGroups = [
    {
      title: 'Основные страницы для покупок',
      pages: [
        { to: '/', icon: FiHome, name: 'Главная страница', description: 'Витрина маркетплейса с популярными товарами' },
        { to: '/catalog', icon: FiGrid, name: 'Каталог товаров', description: 'Все товары с фильтрацией и сортировкой' },
        { to: '/category/electronics', icon: FiShoppingBag, name: 'Страница категории', description: 'Товары электроники с подкатегориями' },
        { to: '/search?q=iphone', icon: FiSearch, name: 'Результаты поиска', description: 'Поиск товаров с фильтрами' },
        { to: '/product/1', icon: FiPackage, name: 'Карточка товара', description: 'Детальная информация о товаре' }
      ]
    },
    {
      title: 'Корзина и заказы',
      pages: [
        { to: '/cart', icon: FiShoppingCart, name: 'Корзина', description: 'Выбранные товары перед покупкой' },
        { to: '/checkout', icon: FiCreditCard, name: 'Оформление заказа', description: '4-этапный процесс оформления' },
        { to: '/order-success', icon: FiCheckCircle, name: 'Успешный заказ', description: 'Страница после оформления заказа' }
      ]
    },
    {
      title: 'Личный кабинет',
      pages: [
        { to: '/profile', icon: FiUser, name: 'Профиль пользователя', description: 'Личные данные и статистика' },
        { to: '/orders', icon: FiPackage, name: 'Мои заказы', description: 'История покупок и статусы' },
        { to: '/wishlist', icon: FiHeart, name: 'Избранное', description: 'Сохраненные товары' },
        { to: '/settings', icon: FiSettings, name: 'Настройки', description: 'Настройки аккаунта' }
      ]
    },
    {
      title: '🔐 Авторизация',
      pages: [
        { to: '/login', icon: FiUser, name: 'Вход в систему', description: 'Форма авторизации' },
        { to: '/register', icon: FiUser, name: 'Регистрация', description: 'Создание нового аккаунта' }
      ]
    },
    {
      title: 'Для продавцов',
      pages: [
        { to: '/become-seller', icon: FiShoppingBag, name: 'Стать продавцом', description: 'Заявка на статус продавца' },
        { to: '/seller', icon: FiGrid, name: 'Панель продавца', description: 'Личный кабинет продавца' }
      ]
    },
    {
      title: 'Информационные страницы',
      pages: [
        { to: '/about', icon: FiInfo, name: 'О компании', description: 'История, миссия и команда' },
        { to: '/contacts', icon: FiPhone, name: 'Контакты', description: 'Связь с поддержкой и офис' },
        { to: '/faq', icon: FiHelpCircle, name: 'Вопросы и ответы', description: 'Часто задаваемые вопросы' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎨 Тестирование дизайна Tendo Market
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Нажмите на ссылки ниже для проверки дизайна всех созданных страниц. 
            Каждая страница оптимизирована под ваши требования к маркетплейсу.
          </p>
        </div>

        {/* Статус создания */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Статус создания страниц</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span><strong>Создано:</strong> 9 основных страниц</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span><strong>Роутинг:</strong> Настроен и работает</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span><strong>Дизайн:</strong> Готов к тестированию</span>
            </div>
          </div>
        </div>

        {/* Группы страниц */}
        <div className="space-y-8">
          {pageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{group.title}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.pages.map((page, pageIndex) => {
                  const IconComponent = page.icon
                  return (
                    <Link
                      key={pageIndex}
                      to={page.to}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <IconComponent className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {page.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {page.description}
                          </p>
                          <div className="text-xs text-blue-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Перейти на страницу →
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Быстрые ссылки для разработки */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">🚀 Быстрые ссылки для тестирования</h2>
          <p className="text-blue-100 mb-6">
            Самые важные страницы для проверки функционала маркетплейса
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/catalog"
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-colors"
            >
              <FiGrid className="h-8 w-8 mx-auto mb-2" />
              <div className="font-semibold">Каталог</div>
            </Link>
            
            <Link
              to="/category/electronics"
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-colors"
            >
              <FiShoppingBag className="h-8 w-8 mx-auto mb-2" />
              <div className="font-semibold">Категория</div>
            </Link>
            
            <Link
              to="/checkout"
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-colors"
            >
              <FiCreditCard className="h-8 w-8 mx-auto mb-2" />
              <div className="font-semibold">Оформление</div>
            </Link>
            
            <Link
              to="/about"
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-colors"
            >
              <FiInfo className="h-8 w-8 mx-auto mb-2" />
              <div className="font-semibold">О нас</div>
            </Link>
          </div>
        </div>

        {/* Информация для разработчика */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6 text-sm text-gray-600">
          <h3 className="font-semibold text-gray-900 mb-2">📝 Заметки для разработки:</h3>
          <ul className="space-y-1 list-disc list-inside">
            <li>Все страницы адаптивны и работают на мобильных устройствах</li>
            <li>Используется Tailwind CSS для стилизации</li>
            <li>Демо данные заменяются на реальные API вызовы</li>
            <li>Роутинг настроен с lazy loading для оптимизации</li>
            <li>Страницы интегрированы с контекстами (Auth, Cart, Wishlist)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DesignTestPage
