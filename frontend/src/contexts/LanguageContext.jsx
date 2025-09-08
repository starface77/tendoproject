import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../locales/translations.js'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ru')

  useEffect(() => {
    // Загружаем язык из localStorage
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  const t = (key, fallback = '') => {
    // Получаем текущие переводы
    const currentTranslations = translations[language] || translations.ru || {}

    // Разбираем ключ с точками (например: 'nav.home', 'cart.title')
    const keys = key.split('.')
    let value = currentTranslations

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return fallback || key
      }
    }

    return typeof value === 'string' ? value : fallback || key
  }

  const getLocalizedName = (nameObject, fallback = '') => {
    if (!nameObject) return fallback

    // Если это строка, возвращаем как есть
    if (typeof nameObject === 'string') return nameObject

    // Если это объект с языками, возвращаем нужный язык
    if (typeof nameObject === 'object') {
      return nameObject[language] || nameObject.ru || nameObject.en || fallback
    }

    return fallback
  }

  const getLocalizedDescription = (descObject, fallback = '') => {
    return getLocalizedName(descObject, fallback)
  }

  // Available languages configuration
  const availableLanguages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'uz', name: 'O\'zbek', flag: '🇺🇿' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ]

  const value = {
    language,
    currentLanguage: language,
    setLanguage,
    changeLanguage,
    t,
    getLocalizedName,
    getLocalizedDescription,
    availableLanguages,
    isLoading: false
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}