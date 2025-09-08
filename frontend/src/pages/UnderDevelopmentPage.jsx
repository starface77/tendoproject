import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiClock, FiSettings } from 'react-icons/fi'
import { useLanguage } from '../contexts/LanguageContext'

const UnderDevelopmentPage = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiSettings className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('under_development', 'Страница в разработке')}
          </h1>
          <p className="text-gray-600">
            {t('coming_soon', 'Эта страница находится в разработке. Мы работаем над улучшением функционала.')}
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center text-blue-600 mb-2">
            <FiClock className="w-5 h-5 mr-2" />
            <span className="font-medium">
              {t('coming_back_soon', 'Скоро вернемся')}
            </span>
          </div>
          <p className="text-sm text-blue-700">
            {t('thank_patience', 'Спасибо за терпение! Мы стремимся предоставить лучший опыт использования.')}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
          >
            <FiArrowLeft className="mr-2" />
            {t('go_back', 'Вернуться назад')}
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            {t('go_home', 'На главную')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnderDevelopmentPage

