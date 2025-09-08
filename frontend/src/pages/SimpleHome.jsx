import { useLanguage } from '../contexts/LanguageContext'

const SimpleHome = () => {
  const { t, language, changeLanguage } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Tendo Market - Простая домашняя страница</h1>

        {/* Переключатель языков */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Выберите язык:</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => changeLanguage('ru')}
              className={`px-4 py-2 rounded ${language === 'ru' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              🇷🇺 Русский
            </button>
            <button
              onClick={() => changeLanguage('uz')}
              className={`px-4 py-2 rounded ${language === 'uz' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              🇺🇿 O'zbek
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-4 py-2 rounded ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              🇺🇸 English
            </button>
          </div>
          <p className="mt-4">Текущий язык: <strong>{language}</strong></p>
        </div>

        {/* Тестовые переводы */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Навигация:</h3>
            <ul className="space-y-1">
              <li><strong>Главная:</strong> {t('nav.home')}</li>
              <li><strong>Категории:</strong> {t('nav.categories')}</li>
              <li><strong>Корзина:</strong> {t('nav.cart')}</li>
              <li><strong>Профиль:</strong> {t('nav.profile')}</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Главная страница:</h3>
            <ul className="space-y-1">
              <li><strong>Добро пожаловать:</strong> {t('homepage.welcome_title')}</li>
              <li><strong>Популярные категории:</strong> {t('homepage.popular_categories')}</li>
              <li><strong>Рекомендуемые товары:</strong> {t('homepage.recommended_products')}</li>
              <li><strong>Посмотреть все:</strong> {t('homepage.view_all')}</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Формы:</h3>
            <ul className="space-y-1">
              <li><strong>Имя:</strong> {t('forms.firstName')}</li>
              <li><strong>Фамилия:</strong> {t('forms.lastName')}</li>
              <li><strong>Email:</strong> {t('forms.email')}</li>
              <li><strong>Телефон:</strong> {t('forms.phone')}</li>
            </ul>
          </div>
        </div>

        {/* Информация о системе */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Информация о системе:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Язык интерфейса:</strong> {language}
            </div>
            <div>
              <strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'N/A'}
            </div>
            <div>
              <strong>Время загрузки:</strong> {new Date().toLocaleString('ru-RU')}
            </div>
            <div>
              <strong>Статус переводов:</strong> {t('messages.success')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleHome



