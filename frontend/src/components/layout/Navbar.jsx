import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FiSearch, FiShoppingCart, FiUser, FiX,
  FiHeart, FiMapPin, FiPhone, FiMail, FiLogOut,
  FiGrid, FiHome
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
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Desktop Top Bar */}
      <div className="hidden lg:block bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container-custom">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center space-x-2">
                <FiMapPin className="h-4 w-4" />
                <span>{t('nav.free_delivery', 'Доставка по Ташкенту за 1 день')}</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="mailto:support@tendomarket.uz" className="inline-flex items-center space-x-2 hover:opacity-90">
                <FiMail className="h-4 w-4" />
                <span>support@tendomarket.uz</span>
              </a>
              <a href="tel:+998781501515" className="inline-flex items-center space-x-2 hover:opacity-90">
                <FiPhone className="h-4 w-4" />
                <span>+998 78 150 15 15</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Header - красивая адаптация */}
      <div className="container-custom lg:hidden">
        <div className="flex items-center justify-between py-4 min-h-[80px]">
          <Link to="/" className="flex items-center group flex-shrink-0">
            <img src="/tendo.png" alt="Tendo Market" className="h-20 w-auto object-contain" />
          </Link>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => {
                const searchInput = document.querySelector('.mobile-search-input');
                if (searchInput) {
                  searchInput.classList.toggle('hidden');
                }
              }}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <FiSearch className="h-5 w-5" />
            </button>
            <a 
              href="#" 
              className="px-3 py-2 rounded-lg border border-blue-200 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              {t('nav.download', 'Скачать')}
            </a>
          </div>
        </div>
        {/* Mobile Search Bar - красивая */}
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="mobile-search-input hidden px-4 py-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Найти товары..." 
                  className="w-full pl-12 pr-4 py-3 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-base placeholder-gray-400"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <button 
                  type="submit" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
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
        <div className="flex items-center justify-between py-2 min-h-[60px]">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-4 group flex-shrink-0">
              <img src="/tendo.png" alt="Tendo" className="h-16 w-auto object-contain" />
            </Link>
            <button onClick={() => setIsCatalogOpen(true)} className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"><FiGrid className="h-5 w-5" /><span>{t('nav.categories', 'Каталог')}</span></button>
          </div>
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('nav.search', 'Поиск товаров...')} className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-base" />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100"><FiSearch className="h-5 w-5" /></button>
            </form>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/wishlist" className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-blue-600 transition-colors relative bg-white border border-gray-200 hover:border-blue-200 rounded-xl"><FiHeart className="h-5 w-5" />{wishlistItemsCount > 0 && (<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center font-semibold">{wishlistItemsCount > 99 ? '99+' : wishlistItemsCount}</span>)}</Link>
            <Link to="/cart" className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-blue-600 transition-colors relative bg-white border border-gray-200 hover:border-blue-200 rounded-xl"><FiShoppingCart className="h-5 w-5" />{totalItems > 0 && (<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center font-semibold">{totalItems > 99 ? '99+' : totalItems}</span>)}</Link>
            {isAuthenticated ? (
              <Link to="/profile" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"><FiUser className="mr-2" />{t('nav.profile', 'Профиль')}</Link>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">{t('nav.login', 'Войти')}</Link>
                <Link to="/register" className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">{t('nav.register', 'Регистрация')}</Link>
              </>
            )}
          </div>
          </div>
        </div>

        {/* Categories Bar - Desktop */}
        <div className="hidden md:block border-t border-gray-100 py-3 bg-gray-50">
          <div className="flex items-center space-x-6 overflow-x-auto scrollbar-hide px-8" role="navigation" aria-label="Categories">
            {categories.map((category) => (
            <Link key={category.slug} to={`/category/${category.slug}`} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap px-3 py-1 rounded-lg hover:bg-white hover:shadow-sm group flex-shrink-0">
                <span className="text-base group-hover:scale-110 transition-transform duration-200">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </Link>
            ))}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fade-in"
            onClick={() => setIsMenuOpen(false)}
            style={{ touchAction: 'manipulation' }}
          />

          {/* Mobile Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">

              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🚀</span>
                  <span className="text-lg font-semibold text-gray-900">Tendo</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                  style={{ touchAction: 'manipulation' }}
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Menu Content */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">

                {/* Search Bar - Mobile */}
                <div className="mb-6">
                  <form onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('nav.search', 'Поиск товаров...')}
                      className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <FiSearch className="h-4 w-4" />
                    </button>
                  </form>
                </div>

                {/* User Section */}
                <div className="mb-6">
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user?.name || 'Пользователь'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 w-full p-3 text-left text-gray-700 hover:bg-white rounded-xl transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                          style={{ touchAction: 'manipulation' }}
                        >
                          <FiUser className="h-5 w-5 text-gray-500" />
                          <span>Профиль</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center space-x-3 w-full p-3 text-left text-gray-700 hover:bg-white rounded-xl transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                          style={{ touchAction: 'manipulation' }}
                        >
                          <HiOutlineShoppingBag className="h-5 w-5 text-gray-500" />
                          <span>{t('nav.orders', 'Заказы')}</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center space-x-3 w-full p-3 text-left text-gray-700 hover:bg-white rounded-xl transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                          style={{ touchAction: 'manipulation' }}
                        >
                          <FiHeart className="h-5 w-5 text-gray-500" />
                          <span>{t('nav.favorites', 'Избранное')}</span>
                        </Link>
                        <Link
                          to="/cart"
                          className="flex items-center space-x-3 w-full p-3 text-left text-gray-700 hover:bg-white rounded-xl transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                          style={{ touchAction: 'manipulation' }}
                        >
                          <FiShoppingCart className="h-5 w-5 text-gray-500" />
                          <span>{t('nav.cart', 'Корзина')}</span>
                        </Link>
                      </div>

                      <hr className="my-4 border-gray-300" />

                      <button
                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                        className="flex items-center space-x-3 w-full p-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        style={{ touchAction: 'manipulation' }}
                      >
                        <FiLogOut className="h-5 w-5" />
                        <span>{t('nav.logout', 'Выйти')}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to="/login"
                        className="flex items-center justify-center w-full p-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                        style={{ touchAction: 'manipulation' }}
                      >
{t('nav.login', 'Войти')}
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center justify-center w-full p-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                        style={{ touchAction: 'manipulation' }}
                      >
{t('nav.register', 'Регистрация')}
                      </Link>
                    </div>
                  )}
                </div>

                <hr className="my-4 border-gray-300" />

                {/* Main Links */}
                <div className="space-y-2">
                  <Link
                    to="/catalog"
                    className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <FiGrid className="h-5 w-5 text-gray-500" />
                    <span>{t('nav.categories', 'Каталог')}</span>
                  </Link>
                  <Link
                    to="/about"
                    className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <FiUser className="h-5 w-5 text-gray-500" />
                    <span>{t('nav.about', 'О нас')}</span>
                  </Link>
                  <Link
                    to="/contacts"
                    className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <FiPhone className="h-5 w-5 text-gray-500" />
                    <span>{t('nav.contacts', 'Контакты')}</span>
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
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white shadow-2xl"
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
                className={`flex flex-col items-center justify-center py-4 px-1 relative transition-all duration-200 ${
                  active 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-7 w-7 ${active ? 'text-blue-600' : ''}`} />
                  {badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] rounded-full h-5 min-w-5 px-1 flex items-center justify-center font-bold shadow-lg">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
                <span className={`mt-1 text-xs leading-tight ${active ? 'text-blue-600 font-semibold' : ''}`}>
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