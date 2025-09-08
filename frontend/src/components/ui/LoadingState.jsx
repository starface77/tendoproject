import React from 'react'
import { useLanguage } from '../../contexts/LanguageContext'

// Скелетон для карточки товара
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
    </div>
  </div>
)

// Скелетон для списка товаров
export const ProductListSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
)

// Скелетон для категорий
export const CategoriesSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="text-center animate-pulse">
        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
      </div>
    ))}
  </div>
)

// Универсальный Loading State с сообщением
export const LoadingMessage = ({ message }) => {
  const { t } = useLanguage()
  
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 text-center">
        {message || t('loading', 'Загрузка...')}
      </p>
    </div>
  )
}

export default LoadingMessage