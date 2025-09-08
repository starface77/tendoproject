import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

const NotFoundPage = () => {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {t('page_not_found', 'Страница не найдена')}
        </h2>
        <p className="text-gray-600 mb-8">
          {t('page_not_found_desc', 'К сожалению, запрашиваемая страница не существует.')}
        </p>
        <Link 
          to="/" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
{t('back_to_home', 'Вернуться на главную')}
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
