/**
 * ℹ️ СТРАНИЦА О КОМПАНИИ
 * Информация о маркетплейсе, миссии и команде
 */

import { useNavigate } from 'react-router-dom'
import { FiUsers, FiTarget, FiAward, FiTrendingUp, FiArrowLeft, FiShoppingBag } from 'react-icons/fi'
import { useLanguage } from '../contexts/LanguageContext'

const AboutPage = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const stats = [
    { icon: FiUsers, label: t('satisfied_customers', 'Довольных клиентов'), value: '50,000+' },
    { icon: FiTarget, label: t('products_in_catalog', 'Товаров в каталоге'), value: '100,000+' },
    { icon: FiAward, label: t('years_in_market', 'Лет на рынке'), value: '5+' },
    { icon: FiTrendingUp, label: t('orders_per_month', 'Заказов в месяц'), value: '25,000+' }
  ]

  const values = [
    {
      title: t('quality_title', 'Качество'),
      description: t('quality_desc', 'Мы тщательно отбираем продавцов и проверяем качество товаров'),
      icon: '⭐'
    },
    {
      title: t('reliability_title', 'Надежность'),
      description: t('reliability_desc', 'Гарантируем безопасные платежи и быструю доставку'),
      icon: '🛡️'
    },
    {
      title: t('innovation_title', 'Инновации'),
      description: t('innovation_desc', 'Постоянно улучшаем платформу для удобства пользователей'),
      icon: '🚀'
    },
    {
      title: t('support_title', 'Поддержка'),
      description: t('support_desc', 'Наша команда всегда готова помочь вам 24/7'),
      icon: '💬'
    }
  ]

  const team = [
    {
      name: 'Алексей Петров',
      position: 'Генеральный директор',
      description: 'Более 10 лет опыта в e-commerce',
      avatar: '/images/team/ceo.jpg'
    },
    {
      name: 'Мария Иванова',
      position: 'Директор по технологиям',
      description: 'Эксперт в области разработки платформ',
      avatar: '/images/team/cto.jpg'
    },
    {
      name: 'Дмитрий Сидоров',
      position: 'Директор по маркетингу',
      description: 'Специалист по развитию онлайн-бизнеса',
      avatar: '/images/team/cmo.jpg'
    }
  ]

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
{t('back', 'Назад')}
          </button>

          <div className="flex items-start space-x-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FiShoppingBag className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('about_tendo', 'О Tendo Market')}
              </h1>
              <p className="text-xl text-gray-600">
                {t('about_description', 'Мы создаем современную платформу для удобных и безопасных покупок онлайн. Наша миссия — объединить лучших продавцов и покупателей в Узбекистане.')}
              </p>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('tendo_stats', 'Tendo Market в цифрах')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>

     

        {/* Наши ценности */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('our_values', 'Наши ценности')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="text-3xl flex-shrink-0">{value.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Команда */}
      

        {/* Миссия */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">{t('our_mission', 'Наша миссия')}</h2>
            <p className="text-lg leading-relaxed mb-6">
              {t('mission_description', 'Сделать онлайн-покупки в Узбекистане максимально удобными, безопасными и доступными для каждого. Мы стремимся поддерживать местный бизнес и помогать предпринимателям расти вместе с нами.')}
            </p>

            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4">{t('join_us', 'Присоединяйтесь к нам!')}</h3>
              <p className="mb-6">
                {t('join_description', 'Станьте частью растущего сообщества продавцов и покупателей')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/become-seller"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  {t('become_seller', 'Стать продавцом')}
                </a>
                <a
                  href="/register"
                  className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  {t('register', 'Зарегистрироваться')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage




