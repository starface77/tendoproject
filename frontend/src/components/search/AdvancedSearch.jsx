import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiFilter, FiX, FiChevronDown, FiStar, FiTag } from 'react-icons/fi';
import { useLanguage } from '../../contexts/LanguageContext';
import { debounce } from 'lodash';

const AdvancedSearch = ({ onSearch, onFilterChange, initialFilters = {} }) => {
  const { t } = useLanguage();
  
  // Состояния
  const [query, setQuery] = useState(initialFilters.query || '');
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Фильтры
  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    brand: initialFilters.brand || '',
    material: initialFilters.material || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    rating: initialFilters.rating || '',
    inStock: initialFilters.inStock || false,
    featured: initialFilters.featured || false,
    isNew: initialFilters.isNew || false,
    onSale: initialFilters.onSale || false,
    sortBy: initialFilters.sortBy || 'relevance'
  });
  
  // Доступные фильтры (загружаются с API)
  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    brands: [],
    materials: [],
    priceRange: { minPrice: 0, maxPrice: 1000000 },
    features: []
  });
  
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounced автодополнение
  const debouncedGetSuggestions = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/v1/search/autocomplete?q=${encodeURIComponent(searchQuery)}&limit=8`);
        const data = await response.json();
        
        if (data.success) {
          setSuggestions(data.data || []);
        }
      } catch (error) {
        console.error('Ошибка автодополнения:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Загружаем доступные фильтры при монтировании
  useEffect(() => {
    loadAvailableFilters();
  }, []);

  // Автодополнение при изменении запроса
  useEffect(() => {
    debouncedGetSuggestions(query);
  }, [query, debouncedGetSuggestions]);

  // Закрытие подсказок при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAvailableFilters = async () => {
    try {
      const response = await fetch('/api/v1/search/filters');
      const data = await response.json();
      
      if (data.success) {
        setAvailableFilters(data.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки фильтров:', error);
    }
  };

  const handleSearch = (searchQuery = query) => {
    const searchParams = {
      query: searchQuery,
      ...filters
    };
    
    onSearch && onSearch(searchParams);
    setShowSuggestions(false);
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
    onFilterChange && onFilterChange(newFilters);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.value);
    handleSearch(suggestion.value);
  };

  const clearFilter = (filterKey) => {
    handleFilterChange(filterKey, filterKey === 'inStock' || filterKey === 'featured' || filterKey === 'isNew' || filterKey === 'onSale' ? false : '');
  };

  const clearAllFilters = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = ['inStock', 'featured', 'isNew', 'onSale'].includes(key) ? false : '';
      return acc;
    }, {});
    clearedFilters.sortBy = 'relevance';
    setFilters(clearedFilters);
    onFilterChange && onFilterChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'sortBy') return false;
      if (typeof value === 'boolean') return value;
      return value && value !== '';
    }).length;
  };

  return (
    <div className="advanced-search">
      {/* Основное поле поиска */}
      <div className="relative">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={() => setShowSuggestions(true)}
            placeholder={t('search.placeholder', 'Поиск товаров...')}
            className="w-full pl-12 pr-24 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <FiSearch className="h-6 w-6 text-gray-400" />
          </div>
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {/* Кнопка фильтров */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors relative ${
                showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FiFilter className="h-5 w-5" />
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
            
            {/* Кнопка поиска */}
            <button
              onClick={() => handleSearch()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t('search.button', 'Найти')}
            </button>
          </div>
        </div>

        {/* Автодополнение */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50 max-h-80 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
              >
                <div className={`p-2 rounded-full ${
                  suggestion.type === 'product' ? 'bg-blue-100 text-blue-600' :
                  suggestion.type === 'brand' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {suggestion.type === 'product' ? <FiTag className="h-4 w-4" /> :
                   suggestion.type === 'brand' ? <FiStar className="h-4 w-4" /> :
                   <FiSearch className="h-4 w-4" />}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{suggestion.text}</div>
                  <div className="text-sm text-gray-500 capitalize">{suggestion.type}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Панель фильтров */}
      {showFilters && (
        <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('search.filters', 'Фильтры')}
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              {t('search.clear_all', 'Очистить все')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Категория */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('search.category', 'Категория')}
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('search.all_categories', 'Все категории')}</option>
                {availableFilters.categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Бренд */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('search.brand', 'Бренд')}
              </label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('search.all_brands', 'Все бренды')}</option>
                {availableFilters.brands.map(brand => (
                  <option key={brand.name} value={brand.name}>
                    {brand.name} ({brand.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Материал */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('search.material', 'Материал')}
              </label>
              <select
                value={filters.material}
                onChange={(e) => handleFilterChange('material', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('search.all_materials', 'Все материалы')}</option>
                {availableFilters.materials.map(material => (
                  <option key={material.value} value={material.value}>
                    {material.name} ({material.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Сортировка */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('search.sort_by', 'Сортировка')}
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="relevance">{t('search.sort.relevance', 'По релевантности')}</option>
                <option value="price_asc">{t('search.sort.price_asc', 'Сначала дешевые')}</option>
                <option value="price_desc">{t('search.sort.price_desc', 'Сначала дорогие')}</option>
                <option value="rating">{t('search.sort.rating', 'По рейтингу')}</option>
                <option value="popularity">{t('search.sort.popularity', 'По популярности')}</option>
                <option value="newest">{t('search.sort.newest', 'Сначала новые')}</option>
              </select>
            </div>

            {/* Ценовой диапазон */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('search.price_range', 'Ценовой диапазон')}
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  placeholder={t('search.min_price', 'От')}
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500">—</span>
                <input
                  type="number"
                  placeholder={t('search.max_price', 'До')}
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Рейтинг */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('search.min_rating', 'Минимальный рейтинг')}
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('search.any_rating', 'Любой')}</option>
                <option value="4">{t('search.rating_4_plus', '4+ звезд')}</option>
                <option value="3">{t('search.rating_3_plus', '3+ звезд')}</option>
                <option value="2">{t('search.rating_2_plus', '2+ звезд')}</option>
              </select>
            </div>
          </div>

          {/* Булевы фильтры */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t('search.in_stock', 'В наличии')}
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => handleFilterChange('featured', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t('search.featured', 'Рекомендуемые')}
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isNew}
                  onChange={(e) => handleFilterChange('isNew', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t('search.new', 'Новинки')}
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.onSale}
                  onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t('search.on_sale', 'Со скидкой')}
                </span>
              </label>
            </div>
          </div>

          {/* Активные фильтры */}
          {getActiveFiltersCount() > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {t('search.active_filters', 'Активные фильтры')}:
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (key === 'sortBy') return null;
                  if (typeof value === 'boolean' && !value) return null;
                  if (!value || value === '') return null;

                  const filterLabel = key === 'category' ? availableFilters.categories.find(c => c._id === value)?.name :
                                    key === 'brand' ? value :
                                    key === 'material' ? availableFilters.materials.find(m => m.value === value)?.name :
                                    value;

                  return (
                    <span
                      key={key}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {filterLabel}
                      <button
                        onClick={() => clearFilter(key)}
                        className="ml-2 hover:text-blue-600"
                      >
                        <FiX className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;

