import { useState, useEffect } from 'react'
import { FiX, FiChevronDown, FiChevronUp, FiFilter, FiRotateCcw } from 'react-icons/fi'

const MobileFilters = ({
  isOpen,
  onClose,
  categories,
  filters,
  onFilterChange,
  onResetFilters,
  totalProducts = 0
}) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: false,
    brand: false,
    rating: false
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Закрываем все секции при закрытии фильтров
  useEffect(() => {
    if (!isOpen) {
      setExpandedSections({
        categories: true,
        price: false,
        brand: false,
        rating: false
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden animate-fade-in"
        onClick={onClose}
      />

      {/* Mobile Filters Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 md:hidden max-h-[85vh] overflow-hidden animate-slide-up">
        <div className="flex flex-col h-full">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
            <div className="flex items-center space-x-2">
              <FiFilter className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Фильтры</h2>
              {totalProducts > 0 && (
                <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                  {totalProducts}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">

            {/* Categories Section */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('categories')}
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">Категории</span>
                {expandedSections.categories ? (
                  <FiChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <FiChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedSections.categories && (
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => onFilterChange('category', '')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      !filters.category
                        ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Все категории</span>
                      <span className="text-sm text-gray-500">{totalProducts}</span>
                    </div>
                  </button>

                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => onFilterChange('category', category.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        filters.category === category.id
                          ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        {category.count && (
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {category.count}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('price')}
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">Цена (сум)</span>
                {expandedSections.price ? (
                  <FiChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <FiChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedSections.price && (
                <div className="mt-3 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      От
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.priceMin}
                      onChange={(e) => onFilterChange('priceMin', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      До
                    </label>
                    <input
                      type="number"
                      placeholder="Максимум"
                      value={filters.priceMax}
                      onChange={(e) => onFilterChange('priceMax', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Brand Section */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('brand')}
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">Бренд</span>
                {expandedSections.brand ? (
                  <FiChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <FiChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedSections.brand && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Поиск бренда..."
                    value={filters.brand}
                    onChange={(e) => onFilterChange('brand', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Rating Section */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('rating')}
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">Рейтинг</span>
                {expandedSections.rating ? (
                  <FiChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <FiChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedSections.rating && (
                <div className="mt-3 space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <button
                      key={rating}
                      onClick={() => onFilterChange('rating', rating.toString())}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        filters.rating === rating.toString()
                          ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{'★'.repeat(rating)}{'☆'.repeat(5-rating)}</span>
                        <span className="font-medium">{rating}+ звезд</span>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => onFilterChange('rating', '')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      !filters.rating
                        ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="font-medium">Любой рейтинг</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex space-x-3">
              <button
                onClick={onResetFilters}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <FiRotateCcw className="h-5 w-5" />
                <span>Сбросить</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Применить фильтры
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileFilters
