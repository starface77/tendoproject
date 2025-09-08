/**
 * 🛍️ КАТАЛОГ ТОВАРОВ
 * Основная страница для просмотра всех товаров по категориям
 */

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { FiGrid, FiList, FiShoppingBag } from 'react-icons/fi'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ProductCard from '../components/product/ProductCard'
import { productsApi, categoriesApi, checkApiHealth } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'

const CatalogPage = () => {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { t } = useLanguage()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isApiConnected, setIsApiConnected] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('popularity')
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






  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-0">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Simple Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {getPageTitle()}
            </h1>
            {products.length > 0 && (
              <span className="text-sm text-gray-500">
                {products.length} товаров
              </span>
            )}
          </div>
        </div>

        {/* Simple Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            {/* Sort */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Сортировка:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="popularity">По популярности</option>
                <option value="price_asc">Цена: по возрастанию</option>
                <option value="price_desc">Цена: по убыванию</option>
                <option value="rating">По рейтингу</option>
                <option value="new">Сначала новые</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FiGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FiList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-4 ${
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
            <div className="col-span-full text-center py-16">
              <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Товары не найдены
              </h3>
              <p className="text-gray-600">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default CatalogPage
