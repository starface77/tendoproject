import { useLanguage } from '../../contexts/LanguageContext'

const LanguageSwitcher = ({ className = '' }) => {
  const { language, changeLanguage } = useLanguage()

  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'uz', name: 'O\'zbek', flag: '🇺🇿' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ]

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-600 mr-2">Язык:</span>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
            language === lang.code
              ? 'bg-blue-100 text-blue-600 border border-blue-200'
              : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
          }`}
        >
          <span>{lang.flag}</span>
          <span>{lang.name}</span>
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher




