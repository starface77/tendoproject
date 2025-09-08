/**
 * 🛍️ КАТАЛОГ ТОВАРОВ
 * Основная страница для просмотра всех товаров по категориям
 */

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { FiGrid, FiList, FiFilter, FiArrowLeft, FiShoppingBag } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ProductCard from '../components/product/ProductCard'
import MobileFilters from '../components/catalog/MobileFilters'
import { productsApi, categoriesApi, checkApiHealth } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isApiConnected, setIsApiConnected] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // grid или list
  const [sortBy, setSortBy] = useState('popularity')
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    priceMin: '',
    priceMax: '',
    brand: '',
    rating: ''
  })

  // Определяем тип страницы по URL
  const getPageType = () => {
    const path = location.pathname
    if (path.includes('/brands')) return 'brands'
    if (path.includes('/sales')) return 'sales' 
    if (path.includes('/new')) return 'new'
    return 'catalog'
  }

  const pageType = getPageType()

  const loadCatalogData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Загружаем данные каталога для:', pageType)

      // Проверяем доступность API
      const isApiHealthy = await checkApiHealth()
      console.log('🏥 API статус:', isApiHealthy)

      if (isApiHealthy) {
        setIsApiConnected(true)

        // Загружаем категории
        const categoriesResponse = await categoriesApi.getCategories()
        console.log('📂 Категории:', categoriesResponse)
        setCategories(categoriesResponse.data || [])

        // Параметры для загрузки товаров
        const productParams = {
          category: filters.category,
          sortBy,
          page: 1,
          limit: 20,
          ...(pageType === 'sales' && { onSale: true }),
          ...(pageType === 'new' && { isNew: true }),
          ...(filters.priceMin && { priceMin: filters.priceMin }),
          ...(filters.priceMax && { priceMax: filters.priceMax }),
          ...(filters.brand && { brand: filters.brand }),
          ...(filters.rating && { rating: filters.rating })
        }

        // Загружаем товары
        let productsResponse
        if (pageType === 'brands') {
          // Для страницы брендов загружаем все товары
          productsResponse = await productsApi.getProducts(productParams)
        } else {
          productsResponse = await productsApi.getProducts(productParams)
        }

        console.log('🛍️ Товары:', productsResponse)
        setProducts(productsResponse.data || [])

      } else {
        throw new Error('API недоступен')
      }

    } catch (error) {
      console.error('❌ Ошибка загрузки каталога:', error)
      setError(t('failed_to_load_data', 'Не удалось загрузить данные. Проверьте подключение к интернету.'))
      setIsApiConnected(false)

      // Показываем пустой результат если API недоступен
      setCategories([])
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [pageType, filters, sortBy, t])

  // Загружаем данные при монтировании
  useEffect(() => {
    loadCatalogData()
  }, [loadCatalogData])

  // Функция для получения заголовка страницы
  const getPageTitle = () => {
    switch (pageType) {
      case 'brands': return t('all_brands', 'Все бренды')
      case 'sales': return t('sales_discounts', 'Акции и скидки')
      case 'new': return t('new_products', 'Новинки')
      default: return t('product_catalog', 'Каталог товаров')
    }
  }

  // Функция для получения описания страницы
  const getPageDescription = () => {
    switch (pageType) {
      case 'brands': return t('popular_brands', 'Популярные бренды на нашем маркетплейсе')
      case 'sales': return t('best_offers', 'Лучшие предложения и скидки до 70%')
      case 'new': return t('latest_arrivals', 'Последние поступления товаров')
      default: return t('wide_selection', 'Большой выбор качественных товаров')
    }
  }





  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)

    // Обновляем URL
    const newSearchParams = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newSearchParams.set(k, v)
    })
    setSearchParams(newSearchParams)
  }

  const handleResetFilters = () => {
    const resetFilters = {
      category: '',
      priceMin: '',
      priceMax: '',
      brand: '',
      rating: ''
    }
    setFilters(resetFilters)
    setSearchParams(new URLSearchParams())
    setIsMobileFiltersOpen(false)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-0">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-6"
          >
            <FiArrowLeft className="mr-2" />
            {t('back', 'Назад')}
          </button>

          <div className="flex items-start space-x-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FiShoppingBag className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getPageTitle()}
              </h1>
              <p className="text-xl text-gray-600">
                {getPageDescription()}
              </p>
              <p className="text-gray-500 mt-2 text-sm">
                {t('items', 'товаров')}: {products.length}
              </p>
            </div>
          </div>

          {!isApiConnected && error && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">{error}</p>
            </div>
          )}
        </div>

        {/* Панель управления и фильтры */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            {/* Левая часть - Фильтры и сортировка */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Кнопка фильтров для мобильных */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiFilter className="h-4 w-4" />
                <span>{t('filter', 'Фильтры')}</span>
              </button>

              {/* Сортировка */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">{t('sort_by', 'Сортировать')}:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="popularity">{t('sort_by_popularity', 'По популярности')}</option>
                  <option value="price_asc">{t('sort_price_asc', 'Цена: по возрастанию')}</option>
                  <option value="price_desc">{t('sort_price_desc', 'Цена: по убыванию')}</option>
                  <option value="rating">{t('sort_by_rating', 'По рейтингу')}</option>
                  <option value="new">{t('sort_newest', 'Сначала новые')}</option>
                </select>
              </div>
            </div>

            {/* Правая часть - Вид и количество */}
            <div className="flex items-center justify-between lg:justify-end gap-4">
              {/* Количество товаров */}
              <span className="text-sm text-gray-600">
                {t('items', 'товаров')}: {products.length}
              </span>

              {/* Переключатель вида */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiList className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Сетка товаров */}
        <div className={`grid gap-6 ${
          viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        }`}
        >
          {products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.id || product._id} product={product} viewMode={viewMode} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FiShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('no_products_found', 'Товары не найдены')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('try_changing_filters', 'Попробуйте изменить фильтры или поисковый запрос')}
              </p>
              <button
                onClick={() => {
                  setFilters({ category: '', priceMin: '', priceMax: '', brand: '', rating: '' })
                  setSearchParams(new URLSearchParams())
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('reset_filters', 'Сбросить фильтры')}
              </button>
            </div>
          )}
        </div>

        {/* Пагинация */}
        {products.length > 0 && (
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                {t('prev', 'Предыдущая')}
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">2</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">3</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                {t('next', 'Следующая')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Filters */}
      <MobileFilters
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        categories={categories}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalProducts={products.length}
      />
    </div>
  )
}

export default CatalogPage
