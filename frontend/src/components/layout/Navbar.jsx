import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FiSearch, FiShoppingCart, FiUser, FiX,
  FiHeart, FiMapPin, FiPhone, FiMail, FiLogOut,
  FiGrid, FiHome, FiMenu
} from 'react-icons/fi'
import { HiOutlineShoppingBag } from 'react-icons/hi'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'
import { useLanguage } from '../../contexts/LanguageContext'
import CatalogSidebar from './CatalogSidebar'
import { categoriesApi } from '../../services/api'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCatalogOpen, setIsCatalogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()
  const location = useLocation()
  
  const { user, isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  const { totalItems: wishlistItemsCount } = useWishlist()
  const { t } = useLanguage()

  // Загружаем категории при монтировании
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesApi.getCategories()
        const processed = (response?.data || []).map((cat) => ({
          id: cat._id || cat.id,
              name: cat.name?.ru || cat.name || 'Категория',
              slug: cat.slug,
              icon: cat.icon || '📱'
        }))
        setCategories(processed)
      } catch (error) {
        console.error('Ошибка загрузки категорий в Navbar:', error.message)
        setCategories([])
      }
    }
    loadCategories()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      // Hide mobile search on small screens
      if (window.innerWidth < 640) {
        const searchInput = document.querySelector('.mobile-search-input');
        if (searchInput) {
          searchInput.classList.add('hidden');
        }
      }
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Desktop Top Bar */}
      <div className="hidden lg:block bg-white border-b border-gray-100">
        <div className="container-custom">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center space-x-2 text-gray-600">
                <FiMapPin className="h-4 w-4" />
                <span>{t('nav.free_delivery', 'Доставка по Ташкенту за 1 день')}</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="mailto:support@tendomarket.uz" className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                <FiMail className="h-4 w-4" />
                <span>support@tendomarket.uz</span>
              </a>
              <a href="tel:+998781501515" className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                <FiPhone className="h-4 w-4" />
                <span>+998 78 150 15 15</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Header - красивая адаптация */}
      <div className="container-custom lg:hidden">
        <div className="flex items-center justify-between py-3 min-h-[70px]">
          <Link to="/" className="flex items-center group flex-shrink-0">
            <img src="/tendo.png" alt="Tendo Market" className="h-16 w-auto object-contain" />
          </Link>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                const searchInput = document.querySelector('.mobile-search-input');
                if (searchInput) {
                  searchInput.classList.toggle('hidden');
                }
              }}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
            >
              <FiSearch className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
            >
              <FiMenu className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* Mobile Search Bar - красивая */}
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="mobile-search-input hidden px-4 py-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Найти товары..." 
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm placeholder-gray-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                <button 
                  type="submit" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  Найти
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="container-custom hidden lg:block">
        <div className="flex items-center justify-between py-3 min-h-[70px]">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-4 group flex-shrink-0">
              <img src="/tendo.png" alt="Tendo" className="h-16 w-auto object-contain" />
            </Link>
            <button 
              onClick={() => setIsCatalogOpen(true)} 
              className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-100 font-medium transition-colors"
            >
              <FiGrid className="h-5 w-5" />
              <span>{t('nav.categories', 'Каталог')}</span>
            </button>
          </div>
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder={t('nav.search', 'Поиск товаров...')} 
                className="w-full pl-4 pr-12 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm shadow-sm" 
              />
              <button 
                type="submit" 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiSearch className="h-5 w-5" />
              </button>
            </form>
          </div>
          <div className="flex items-center space-x-3">
            <Link 
              to="/wishlist" 
              className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-blue-600 relative bg-white border border-gray-200 hover:border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <FiHeart className="h-5 w-5" />
              {wishlistItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] rounded-full h-5 min-w-5 px-1 flex items-center justify-center font-semibold">
                  {wishlistItemsCount > 99 ? '99+' : wishlistItemsCount}
                </span>
              )}
            </Link>
            <Link 
              to="/cart" 
              className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-blue-600 relative bg-white border border-gray-200 hover:border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <FiShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] rounded-full h-5 min-w-5 px-1 flex items-center justify-center font-semibold">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiUser className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900 text-sm">{user?.name?.split(' ')[0] || 'Профиль'}</span>
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <FiUser className="h-4 w-4" />
                    <span>Профиль</span>
                  </Link>
                  <Link 
                    to="/orders" 
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <HiOutlineShoppingBag className="h-4 w-4" />
                    <span>{t('nav.orders', 'Заказы')}</span>
                  </Link>
                  <Link 
                    to="/wishlist" 
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <FiHeart className="h-4 w-4" />
                    <span>{t('nav.favorites', 'Избранное')}</span>
                  </Link>
                  <div className="border-t border-gray-100 my-2"></div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <FiLogOut className="h-4 w-4" />
                    <span>{t('nav.logout', 'Выйти')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {t('nav.login', 'Войти')}
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('nav.register', 'Регистрация')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories Bar - Desktop */}
      <div className="hidden md:block border-t border-gray-100 py-2 bg-gray-50">
        <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide px-8" role="navigation" aria-label="Categories">
            {categories.map((category) => (
            <Link key={category.slug} to={`/category/${category.slug}`} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 whitespace-nowrap px-2 py-1 rounded hover:bg-blue-50 flex-shrink-0">
                <span className="text-sm">{category.icon}</span>
                <span className="text-sm">{typeof category.name === 'object' ? category.name?.ru || category.name?.en || category.name?.uz || 'Категория' : category.name || 'Категория'}</span>
              </Link>
            ))}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Mobile Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-xs bg-white shadow-xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">

              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FiGrid className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-bold text-xl text-gray-900">Tendo</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Menu Content */}
              <div className="flex-1 overflow-y-auto bg-gray-50">

                {/* User Section */}
                <div className="p-4 bg-white border-b border-gray-100">
                  {isAuthenticated ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiUser className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{user?.name || 'Пользователь'}</p>
                        <p className="text-sm text-gray-500">Личный кабинет</p>
                      </div>
                      <button
                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                        className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <FiUser className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Гость</p>
                        <p className="text-sm text-gray-500">Войдите в аккаунт</p>
                      </div>
                      <Link
                        to="/login"
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Войти
                      </Link>
                    </div>
                  )}
                </div>

                {/* Search Bar - Mobile */}
                <div className="p-4 bg-white border-b border-gray-100">
                  <form onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('nav.search', 'Поиск товаров...')}
                      className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <FiSearch className="h-4 w-4 text-gray-400" />
                    </div>
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600"
                    >
                      <FiSearch className="h-4 w-4" />
                    </button>
                  </form>
                </div>

                {/* Main Navigation Links */}
                <div className="py-2 bg-white">
                  <Link
                    to="/"
                    className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                      location.pathname === '/' 
                        ? 'bg-blue-50 border-r-2 border-blue-600' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiHome className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Главная</span>
                  </Link>
                  <Link
                    to="/catalog"
                    className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                      location.pathname === '/catalog' || location.pathname.startsWith('/category')
                        ? 'bg-blue-50 border-r-2 border-blue-600' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiGrid className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">{t('nav.categories', 'Каталог')}</span>
                  </Link>
                  <Link
                    to="/orders"
                    className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                      location.pathname === '/orders' 
                        ? 'bg-blue-50 border-r-2 border-blue-600' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HiOutlineShoppingBag className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">{t('nav.orders', 'Заказы')}</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                      location.pathname === '/wishlist' 
                        ? 'bg-blue-50 border-r-2 border-blue-600' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiHeart className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">{t('nav.favorites', 'Избранное')}</span>
                    {wishlistItemsCount > 0 && (
                      <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        {wishlistItemsCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/cart"
                    className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                      location.pathname === '/cart' 
                        ? 'bg-blue-50 border-r-2 border-blue-600' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiShoppingCart className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">{t('nav.cart', 'Корзина')}</span>
                    {totalItems > 0 && (
                      <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Additional Links */}
                <div className="py-2 bg-white border-t border-gray-100">
                  <Link
                    to="/about"
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FiUser className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{t('nav.about', 'О нас')}</span>
                  </Link>
                  <Link
                    to="/contacts"
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FiPhone className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{t('nav.contacts', 'Контакты')}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Catalog Sidebar */}
      <CatalogSidebar
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
      />

      {/* Mobile Bottom Navigation - красивая */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white shadow-lg"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 text-xs bg-white">
          {[
            { to: '/', label: t('nav.home'), icon: FiHome },
            { to: '/catalog', label: t('nav.categories'), icon: FiGrid },
            { to: '/wishlist', label: t('nav.favorites'), icon: FiHeart, badge: wishlistItemsCount },
            { to: '/cart', label: t('nav.cart'), icon: FiShoppingCart, badge: totalItems },
            { to: isAuthenticated ? '/profile' : '/login', label: isAuthenticated ? t('nav.profile') : t('nav.login'), icon: FiUser },
          ].map(({ to, label, icon: Icon, badge }, idx) => {
            const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
            return (
              <Link
                key={idx}
                to={to}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center py-3 px-1 relative transition-colors ${
                  active 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                <div className="relative">
                  <div className={`p-1.5 rounded-lg ${active ? 'bg-blue-100' : ''}`}>
                    <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : ''}`} />
                  </div>
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center font-bold">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
                <span className={`mt-1 leading-tight ${active ? 'text-blue-600 font-medium' : ''}`}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navbar