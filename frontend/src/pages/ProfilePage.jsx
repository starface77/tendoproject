/**
 * СТРАНИЦА ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useNavigate, Navigate } from 'react-router-dom'
import { FiUser, FiMail, FiShield, FiEdit3, FiSettings, FiLogOut, FiCamera, FiShoppingBag, FiHeart, FiMapPin, FiPhone, FiArrowRight, FiArrowLeft, FiStar } from 'react-icons/fi'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { ordersApi, usersApi } from '../services/api'

const ProfilePage = () => {
  const { t, getLocalizedName } = useLanguage()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const navigate = useNavigate()

  // Состояние для статистики и заказов
  const [stats, setStats] = useState({
    ordersCount: 0,
    favoritesCount: 0,
    reviewsCount: 0,
    yearsWithUs: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)

  // Загрузка статистики пользователя
  useEffect(() => {
    if (user && isAuthenticated) {
      loadUserStats()
    }
  }, [user, isAuthenticated])

  // Загрузка последних заказов
  useEffect(() => {
    if (user && isAuthenticated) {
      loadRecentOrders()
    }
  }, [user, isAuthenticated])

  const loadUserStats = async () => {
    try {
      setStatsLoading(true)

      // Загружаем заказы пользователя (все, без лимита для подсчета)
      const ordersResponse = await ordersApi.getUserOrders()
      const ordersCount = ordersResponse.data?.length || 0

      // Загружаем избранные товары
      const favoritesResponse = await usersApi.getFavorites()
      const favoritesCount = favoritesResponse.data?.length || 0

      // Рассчитываем количество лет с нами
      const yearsWithUs = Math.max(1, Math.floor((Date.now() - new Date(user.createdAt || Date.now())) / (1000 * 60 * 60 * 24 * 365)))

      setStats({
        ordersCount,
        favoritesCount,
        reviewsCount: 0, // Пока не реализовано
        yearsWithUs
      })
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error)
      setStats({
        ordersCount: 0,
        favoritesCount: 0,
        reviewsCount: 0,
        yearsWithUs: 1
      })
    } finally {
      setStatsLoading(false)
    }
  }

  const loadRecentOrders = async () => {
    try {
      setOrdersLoading(true)
      const response = await ordersApi.getUserOrders({ limit: 3 })
      setRecentOrders(response.data || [])
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error)
      setRecentOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }

  // Перенаправление если не авторизован
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Загрузка
  if (isLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  // Обработчики событий
  const handleEditProfile = () => {
    // Показываем сообщение о технических работах
    alert(t('technical_maintenance', 'Идут технические работы') + '. ' + t('feature_unavailable', 'Функция редактирования профиля временно недоступна'))
  }

  const handleSettings = () => {
    navigate('/settings')
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-0">
      {/* Кнопка Назад */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
{t('back', 'Назад')}
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <FiUser className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <h1 className="text-3xl text-gray-900 mb-2">
                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : t('my_profile', 'Мой профиль')}
              </h1>
              <p className="text-xl text-gray-600">
                {t('welcome_to_profile', 'Добро пожаловать в ваш профиль')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8">
          {/* Личная информация */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-gray-900">
                {t('personal_information', 'Личная информация')}
              </h2>
              <button
                onClick={handleEditProfile}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {t('edit_profile', 'Редактировать')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('first_name', 'Имя')}
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FiUser className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{user.firstName || t('not_specified', 'Не указано')}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('email', 'Email')}
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FiMail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{user.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('phone', 'Телефон')}
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FiPhone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{user.phone || t('not_specified', 'Не указано')}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('address', 'Адрес')}
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FiMapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{user.address || t('not_specified', 'Не указано')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="mb-8">
            <h2 className="text-2xl text-gray-900 mb-6">
              {t('statistics', 'Статистика')}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl text-gray-900">
                  {statsLoading ? '...' : stats.ordersCount}
                </p>
                <p className="text-sm text-gray-600">{t('total_orders', 'Заказов')}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiHeart className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-2xl text-gray-900">
                  {statsLoading ? '...' : stats.favoritesCount}
                </p>
                <p className="text-sm text-gray-600">{t('favorites', 'В избранном')}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiStar className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl text-gray-900">
                  {statsLoading ? '...' : stats.reviewsCount}
                </p>
                <p className="text-sm text-gray-600">{t('reviews', 'Отзывов')}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiUser className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl text-gray-900">
                  {statsLoading ? '...' : stats.yearsWithUs}
                </p>
                <p className="text-sm text-gray-600">{t('years_with_us', 'Года с нами')}</p>
              </div>
            </div>
          </div>

          {/* Быстрые действия */}
          <div className="mt-8">
            <h3 className="text-lg text-gray-900 mb-6">
              {t('actions', 'Действия')}
            </h3>
            <div className="space-y-4">
              <button
                onClick={handleEditProfile}
                className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <FiEdit3 className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-900">{t('edit_profile', 'Редактировать профиль')}</span>
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>

              <button
                onClick={handleSettings}
                className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <FiSettings className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-gray-900">{t('settings', 'Настройки')}</span>
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>

              <button
                onClick={() => navigate('/orders')}
                className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <FiShoppingBag className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-900">{t('my_orders', 'Мои заказы')}</span>
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </button>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-red-50 transition-colors group"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <FiLogOut className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-red-600">{t('logout', 'Выйти')}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage