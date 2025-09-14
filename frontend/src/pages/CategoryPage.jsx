import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { 
  FiGrid, 
  FiList, 
  FiArrowLeft, 
  FiRefreshCw, 
  FiFilter,
  FiChevronDown,
  FiStar,
  FiHeart,
  FiShoppingCart
} from 'react-icons/fi'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ProductCard from '../components/product/ProductCard'
import { productsApi, categoriesApi } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'

const CategoryPage = () => {
  const { categoryId } = useParams()
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('popularity')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 })
  const [selectedBrands, setSelectedBrands] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const { t } = useLanguage()

  useEffect(() => {
    loadCategoryData()
  }, [categoryId])

  useEffect(() => {
    applyFilters()
  }, [products, priceRange, selectedBrands])

  const loadCategoryData = async () => {
    setLoading(true)
    try {
      // Загрузка данных категории
      const categoryResponse = await categoriesApi.getCategory(categoryId)
      if (categoryResponse?.data) {
        setCategory(categoryResponse.data)
      }

      // Загрузка товаров категории
      const productsResponse = await productsApi.getProductsByCategory(categoryId)
      if (productsResponse?.data) {
        setProducts(productsResponse.data)
        setFilteredProducts(productsResponse.data)
        
        // Calculate price range
        if (productsResponse.data.length > 0) {
          const prices = productsResponse.data.map(p => p.price)
          setPriceRange({
            min: Math.min(...prices),
            max: Math.max(...prices)
          })
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки категории:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...products]
    
    // Price filter
    result = result.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    )
    
    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(product => 
        product.brand && selectedBrands.includes(product.brand)
      )
    }
    
    setFilteredProducts(result)
  }

  const getCategoryName = (name) => {
    if (typeof name === 'object' && name !== null) {
      return name.ru || name.en || name.uz || 'Категория'
    }
    return name || 'Категория'
  }

  const handleSort = (newSortBy) => {
    setSortBy(newSortBy)
    const sorted = [...filteredProducts].sort((a, b) => {
      switch (newSortBy) {
        case 'price_asc':
          return a.price - b.price
        case 'price_desc':
          return b.price - a.price
        case 'name':
          return getCategoryName(a.name)?.localeCompare(getCategoryName(b.name)) || 0
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        default:
          return 0
      }
    })
    setFilteredProducts(sorted)
  }

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand) 
        : [...prev, brand]
    )
  }

  // Get unique brands from products
  const getUniqueBrands = () => {
    const brands = products
      .map(p => p.brand)
      .filter(Boolean)
    return [...new Set(brands)]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors">
              Главная
            </Link>
            <span className="text-gray-300">/</span>
            <Link to="/catalog" className="text-gray-500 hover:text-blue-600 transition-colors">
              Каталог
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">
              {category ? getCategoryName(category.name) : 'Категория'}
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link 
                to="/catalog" 
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <FiArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {category ? getCategoryName(category.name) : 'Категория'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'товар' : filteredProducts.length < 5 ? 'товара' : 'товаров'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiFilter className="h-4 w-4" />
                <span>Фильтры</span>
                <FiChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <button
                onClick={loadCategoryData}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                <FiRefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200">
          <div className="container-custom py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price Filter */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Цена</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="От"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="До"
                    />
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Бренд</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {getUniqueBrands().map(brand => (
                    <label key={brand} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setPriceRange({ min: 0, max: 10000000 })
                    setSelectedBrands([])
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Сбросить фильтры
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container-custom py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Sort */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 text-sm">Сортировка:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="popularity">По популярности</option>
                <option value="price_asc">Цена: по возрастанию</option>
                <option value="price_desc">Цена: по убыванию</option>
                <option value="name">По названию</option>
                <option value="rating">По рейтингу</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container-custom py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiGrid className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              В данной категории пока нет товаров
            </h3>
            <p className="text-gray-600 mb-6">
              Мы работаем над наполнением каталога. Попробуйте другие категории или вернитесь позже.
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              На главную
            </Link>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
              : 'space-y-4'
          }>
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product._id || product.id} 
                product={product} 
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryPage