import { useLanguage } from '../contexts/LanguageContext'

const TestTranslations = () => {
  const { t, language, changeLanguage } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Тестирование переводов</h1>

        {/* Текущий язык */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Текущий язык: {language}</h2>
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
        </div>

        {/* Тестовые переводы */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Тестовые переводы:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <strong>nav.home:</strong> {t('nav.home')}
            </div>
            <div className="p-4 border rounded">
              <strong>nav.categories:</strong> {t('nav.categories')}
            </div>
            <div className="p-4 border rounded">
              <strong>nav.cart:</strong> {t('nav.cart')}
            </div>
            <div className="p-4 border rounded">
              <strong>homepage.welcome_title:</strong> {t('homepage.welcome_title')}
            </div>
            <div className="p-4 border rounded">
              <strong>cart.title:</strong> {t('cart.title')}
            </div>
            <div className="p-4 border rounded">
              <strong>forms.firstName:</strong> {t('forms.firstName')}
            </div>
          </div>
        </div>

        {/* Проверка загрузки translations */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Проверка загрузки:</h2>
          <div className="text-sm text-gray-600">
            <p>Если переводы не работают, проверьте:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Файл translations.js загружается без ошибок</li>
              <li>LanguageContext правильно инициализирован</li>
              <li>Ключи переводов существуют</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestTranslations



