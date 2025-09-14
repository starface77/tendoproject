import { useState, useEffect } from 'react'
import { FiChevronDown, FiChevronUp, FiCheck, FiStar } from 'react-icons/fi'

const FilterSidebar = ({ filters, onFiltersChange, isLoading = false }) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: true,
    brand: true,
    features: false
  })

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }))
  }

  const handleFilterChange = (filterType, value, checked) => {
    const newFilters = { ...filters }
    
    if (filterType === 'priceRange') {
      newFilters.priceRange = value
    } else if (filterType === 'rating') {
      newFilters.rating = checked ? value : null
    } else {
      if (!newFilters[filterType]) {
        newFilters[filterType] = []
      }
      
      if (checked) {
        newFilters[filterType] = [...newFilters[filterType], value]
      } else {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value)
      }
    }
    
    onFiltersChange(newFilters)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price)
  }

  const FilterSection = ({ title, sectionKey, children }) => (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
      >
        <span>{title}</span>
        {expandedSections[sectionKey] ? (
          <FiChevronUp className="w-4 h-4" />
        ) : (
          <FiChevronDown className="w-4 h-4" />
        )}
      </button>
      
      {expandedSections[sectionKey] && (
        <div className="mt-3 space-y-3">
          {children}
        </div>
      )}
    </div>
  )

  const CheckboxItem = ({ label, value, checked, onChange, count }) => (
    <label className="flex items-center space-x-3 text-sm text-gray-700 hover:text-gray-900 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-4 h-4 rounded border-2 transition-all duration-200 ${
          checked 
            ? 'bg-blue-600 border-blue-600' 
            : 'border-gray-300 group-hover:border-blue-400'
        }`}>
          {checked && (
            <FiCheck className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
          )}
        </div>
      </div>
      <span className="flex-1">{label}</span>
      {count && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </label>
  )

  const priceRanges = [
    { label: 'До 100,000 сум', min: 0, max: 100000 },
    { label: '100,000 - 500,000 сум', min: 100000, max: 500000 },
    { label: '500,000 - 1,000,000 сум', min: 500000, max: 1000000 },
    { label: '1,000,000 - 5,000,000 сум', min: 1000000, max: 5000000 },
    { label: 'Более 5,000,000 сум', min: 5000000, max: null }
  ]

  const StarRating = ({ rating, onClick, selected }) => (
    <button
      onClick={() => onClick(rating)}
      className={`flex items-center space-x-2 text-sm transition-colors ${
        selected ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'
      }`}
    >
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span>от {rating} звезд</span>
    </button>
  )

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {/* Categories */}
        <FilterSection title="Категории" sectionKey="categories">
          {filters.availableCategories?.map((category) => (
            <CheckboxItem
              key={category.id}
              label={typeof category.name === 'object' ? category.name?.ru || category.name?.en || category.name?.uz || 'Категория' : category.name || 'Категория'}
              value={category.id}
              checked={filters.categories?.includes(category.id)}
              onChange={(checked) => handleFilterChange('categories', category.id, checked)}
              count={category.productCount}
            />
          ))}
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Цена" sectionKey="price">
          <div className="space-y-3">
            {priceRanges.map((range, index) => (
              <label key={index} className="flex items-center space-x-3 text-sm text-gray-700 hover:text-gray-900 cursor-pointer">
                <input
                  type="radio"
                  name="priceRange"
                  checked={filters.priceRange?.min === range.min && filters.priceRange?.max === range.max}
                  onChange={() => handleFilterChange('priceRange', { min: range.min, max: range.max })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span>{range.label}</span>
              </label>
            ))}
          </div>
          
          {/* Custom price range */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="От"
                className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                onChange={(e) => {
                  const customRange = { 
                    min: parseInt(e.target.value) || 0, 
                    max: filters.priceRange?.max || null 
                  }
                  handleFilterChange('priceRange', customRange)
                }}
              />
              <span className="text-xs text-gray-500">-</span>
              <input
                type="number"
                placeholder="До"
                className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                onChange={(e) => {
                  const customRange = { 
                    min: filters.priceRange?.min || 0, 
                    max: parseInt(e.target.value) || null 
                  }
                  handleFilterChange('priceRange', customRange)
                }}
              />
            </div>
          </div>
        </FilterSection>

        {/* Rating */}
        <FilterSection title="Рейтинг" sectionKey="rating">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <StarRating
                key={rating}
                rating={rating}
                selected={filters.rating === rating}
                onClick={(rating) => handleFilterChange('rating', rating, filters.rating !== rating)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Brands */}
        <FilterSection title="Бренды" sectionKey="brand">
          {filters.availableBrands?.map((brand) => (
            <CheckboxItem
              key={brand.name}
              label={brand.name}
              value={brand.name}
              checked={filters.brands?.includes(brand.name)}
              onChange={(checked) => handleFilterChange('brands', brand.name, checked)}
              count={brand.productCount}
            />
          ))}
        </FilterSection>

        {/* Features */}
        <FilterSection title="Особенности" sectionKey="features">
          {filters.availableFeatures?.map((feature) => (
            <CheckboxItem
              key={feature}
              label={feature}
              value={feature}
              checked={filters.features?.includes(feature)}
              onChange={(checked) => handleFilterChange('features', feature, checked)}
            />
          ))}
        </FilterSection>
      </div>

      {/* Clear Filters */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => onFiltersChange({})}
          className="w-full py-2 px-4 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Очистить фильтры
        </button>
      </div>
    </div>
  )
}

export default FilterSidebar




