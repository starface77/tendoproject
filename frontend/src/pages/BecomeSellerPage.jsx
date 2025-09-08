/**
 * СТРАНИЦА ПОДАЧИ ЗАЯВКИ НА ПРОДАВЦА
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiShoppingBag, FiUser, FiMail, FiPhone, FiMapPin, FiFileText, FiCheck, FiPackage, FiDollarSign, FiTrendingUp, FiHome } from 'react-icons/fi'
import { sellerApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const BecomeSellerPage = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    categories: [],
    productTypes: '',
    monthlyVolume: '',
    experience: '',
    otherPlatforms: '',
    agreesToTerms: false,
    marketingConsent: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleCategoryChange = (category) => {
    setFormData(prev => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
      
      // Ограничиваем максимум 5 категорий
      if (newCategories.length > 5) {
        return prev
      }
      
      return { ...prev, categories: newCategories }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // Подготавливаем данные для отправки согласно backend API
      const applicationData = {
        businessName: formData.businessName,
        businessType: formData.businessType,
        contactName: formData.contactName,
        email: formData.email || user.email,
        phone: formData.phone,
        address: formData.address,
        website: formData.website || '',
        categories: formData.categories,
        productTypes: formData.productTypes,
        monthlyVolume: formData.monthlyVolume,
        experience: formData.experience,
        otherPlatforms: formData.otherPlatforms || '',
        agreesToTerms: formData.agreesToTerms,
        marketingConsent: formData.marketingConsent
      }

      await sellerApi.applyToBecomeSeller(applicationData)
      
      // Успешная отправка
      alert(t('seller_application_sent', 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.'))
      navigate('/')
    } catch (error) {
      setError(error.response?.data?.message || t('application_error', 'Ошибка при отправке заявки. Попробуйте еще раз.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const businessTypes = [
    { value: 'individual', label: t('individual_entrepreneur', 'Индивидуальный предприниматель') },
    { value: 'llc', label: t('llc', 'ООО') },
    { value: 'ooo', label: t('llc', 'ООО') },
    { value: 'ip', label: t('ip', 'ИП') },
    { value: 'other', label: t('other', 'Другое') }
  ]

  const categories = [
    t('electronics', 'Электроника'),
    t('clothing_shoes', 'Одежда и обувь'),
    t('clothing', 'Одежда'),
    t('accessories', 'Аксессуары'),
    t('home_garden', 'Дом и сад'),
    t('beauty_health', 'Красота и здоровье'),
    t('sports_outdoor', 'Спорт и отдых')
  ]

  const monthlyVolumes = [
    { value: 'under_1m', label: 'До 1 млн сум' },
    { value: '1m_5m', label: '1-5 млн сум' },
    { value: '5m_20m', label: '5-20 млн сум' },
    { value: '20m_50m', label: '20-50 млн сум' },
    { value: 'over_50m', label: 'Более 50 млн сум' }
  ]

  const experienceLevels = [
    { value: 'none', label: 'Без опыта' },
    { value: 'under_1_year', label: 'Менее 1 года' },
    { value: '1_3_years', label: '1-3 года' },
    { value: '3_5_years', label: '3-5 лет' },
    { value: 'over_5_years', label: 'Более 5 лет' }
  ]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <FiUser className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('authorization_required', 'Требуется авторизация')}</h2>
          <p className="text-gray-600 mb-6">
            {t('login_required_seller', 'Для подачи заявки на продавца необходимо войти в систему')}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
{t('login_button', 'Войти')}
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t('register_button', 'Зарегистрироваться')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-6"
          >
            <FiArrowLeft className="mr-2" />
{t('back_to_profile', 'Назад в профиль')}
          </button>
          
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FiShoppingBag className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
{t('seller_app.title')}
              </h1>
              <p className="text-xl text-gray-600">
                {t('seller_app.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('seller_app.application_form')}</h2>
            <p className="text-gray-600">
              {t('seller_app.application_description')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Основная информация о бизнесе */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiHome className="mr-2" />
{t('business_info', 'Основная информация о бизнесе')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('company_name', 'Название компании')} *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите название вашей компании"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('business_type', 'Тип бизнеса')} *
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('select_business_type', 'Выберите тип бизнеса')}</option>
                    {businessTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя контактного лица *
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Введите ваше имя"
                />
              </div>
            </div>

            {/* Контактная информация */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiMapPin className="mr-2" />
                Контактная информация
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || user?.email || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+998XXXXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">Формат: +998XXXXXXXXX</p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Адрес *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Укажите ваш полный адрес"
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Веб-сайт
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            {/* Информация о товарах */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiPackage className="mr-2" />
                Информация о товарах
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание товаров *
                </label>
                <textarea
                  name="productTypes"
                  value={formData.productTypes}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Расскажите о товарах, которые вы планируете продавать..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Планируемый объем продаж *
                  </label>
                  <select
                    name="monthlyVolume"
                    value={formData.monthlyVolume}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Выберите объем</option>
                    {monthlyVolumes.map(volume => (
                      <option key={volume.value} value={volume.value}>
                        {volume.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Опыт в торговле *
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Выберите опыт</option>
                    {experienceLevels.map(exp => (
                      <option key={exp.value} value={exp.value}>
                        {exp.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Другие платформы
                </label>
                <input
                  type="text"
                  name="otherPlatforms"
                  value={formData.otherPlatforms}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="На каких других платформах вы уже продаете?"
                />
              </div>
            </div>

            {/* Категории товаров */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Категории товаров *
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Выберите от 1 до 5 категорий товаров, которые вы планируете продавать
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map(category => (
                  <label key={category} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Соглашения */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Соглашения
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreesToTerms"
                    checked={formData.agreesToTerms}
                    onChange={handleInputChange}
                    required
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Я согласен с условиями использования</span>
                    <p className="text-gray-500 mt-1">
                      Отправляя заявку, вы соглашаетесь с нашими правилами и условиями работы на платформе
                    </p>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="marketingConsent"
                    checked={formData.marketingConsent}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Согласие на маркетинговые рассылки</span>
                    <p className="text-gray-500 mt-1">
                      Получать уведомления о новых возможностях, акциях и обновлениях платформы
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Кнопка отправки */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting || !formData.agreesToTerms || formData.categories.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
{t('sending', 'Отправка...')}
                  </>
                ) : (
                  <>
                    <FiCheck className="mr-2" />
{t('submit_application', 'Отправить заявку')}
                  </>
                )}
              </button>
              
              <p className="text-sm text-gray-500 text-center mt-3">
{t('required_field_note', 'Поля, отмеченные *, обязательны для заполнения')}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BecomeSellerPage