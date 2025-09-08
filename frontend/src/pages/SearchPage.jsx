import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { FiSearch, FiWifiOff, FiFilter, FiSmartphone, FiMonitor, FiHeadphones, FiWatch, FiCamera, FiPlay } from 'react-icons/fi'
import { HiOutlineComputerDesktop } from 'react-icons/hi2'
import ProductCard from '../components/product/ProductCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import api from '../services/api'

const SearchPage = () => {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isApiConnected, setIsApiConnected] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [suggestions] = useState([
    'iPhone 15', 'Samsung Galaxy', 'MacBook', 'AirPods', 
    'PlayStation', 'Nintendo Switch', 'iPad', 'Apple Watch'
  ])

  // Категории для сайдбара
  const categories = [
    { id: 'all', name: 'Все категории', icon: FiFilter, count: 0 },
    { id: 'smartphones', name: 'Смартфоны', icon: FiSmartphone, count: 12 },
    { id: 'laptops', name: 'Ноутбуки', icon: HiOutlineComputerDesktop, count: 8 },
    { id: 'tablets', name: 'Планшеты', icon: FiMonitor, count: 6 },
    { id: 'headphones', name: 'Наушники', icon: FiHeadphones, count: 15 },
    { id: 'smartwatches', name: 'Умные часы', icon: FiWatch, count: 9 },
    { id: 'gaming', name: 'Игровые консоли', icon: FiPlay, count: 5 },
    { id: 'cameras', name: 'Камеры', icon: FiCamera, count: 7 }
  ]

  // Get search query from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const query = urlParams.get('q') || ''
    setSearchQuery(query)
    
    if (query) {
      performSearch(query)
    }
  }, [location.search])

  const performSearch = async (query) => {
    setLoading(true)
    setError(null)
    
    try {
      // Проверяем соединение с API
      const isConnected = await api.checkApiHealth()
      setIsApiConnected(isConnected)

      if (isConnected) {
        // Используем реальный API поиска
        const response = await api.products.searchProducts(query, {
          page: 1,
          limit: 20,
          category: selectedCategory !== 'all' ? selectedCategory : undefined
        })
        
        const searchResults = response.data || response.products || []
        setProducts(searchResults)
      } else {
        throw new Error('API недоступен')
      }
    } catch (err) {
      console.error('Ошибка поиска:', err)
      setError(err.message)
      setIsApiConnected(false)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }



  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const url = new URL(window.location)
      url.searchParams.set('q', searchQuery)
      window.history.pushState({}, '', url)
      performSearch(searchQuery)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion)
    const url = new URL(window.location)
    url.searchParams.set('q', suggestion)
    window.history.pushState({}, '', url)
    performSearch(suggestion)
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    if (searchQuery.trim()) {
      performSearch(searchQuery)
    }
  }

  const currentQuery = new URLSearchParams(location.search).get('q') || ''

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        
        {/* API Status */}
        {!isApiConnected && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8">
            <div className="flex items-center">
              <FiWifiOff className="h-5 w-5 mr-2" />
              <span className="text-sm">
                <strong>API недоступен:</strong> Не удается подключиться к серверу. Проверьте подключение к интернету.
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8">
            <p className="text-sm">
              <strong>Ошибка поиска:</strong> {error}
            </p>
          </div>
        )}
        
        {/* Search Header */}
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск товаров..."
              className="search-input text-lg"
              autoFocus
            />
            <button type="submit" className="search-button">
              <FiSearch className="h-6 w-6" />
            </button>
          </form>
        </div>

        {/* Search Results */}
        {currentQuery && (
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Результаты поиска
            </h1>
            <p className="text-gray-600">
              {loading 
                ? 'Поиск...' 
                : `Найдено ${products.length} товаров по запросу "${currentQuery}"`
              }
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingSpinner size="lg" />}

        {/* No Query State */}
        {!currentQuery && !loading && (
          <div className="text-center py-16">
            <div className="mb-12">
              <img 
                src="/images/image (14).png" 
                alt="Поиск товаров" 
                className="w-48 h-48 mx-auto rounded-2xl shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mx-auto mb-6 hidden">
                <FiSearch className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Начните поиск товаров
            </h2>
            <p className="text-gray-600 mb-12">
              Введите название товара, бренда или категории в поле поиска
            </p>
            
            {/* Popular Suggestions */}
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Популярные запросы:
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-sm font-medium transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results with Sidebar */}
        {!loading && currentQuery && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiFilter className="w-5 h-5 mr-2 text-blue-600" />
                  Категории
                </h3>
                
                <div className="space-y-2">
                  {categories.map((category) => {
                    const IconComponent = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                            selectedCategory === category.id
                              ? 'bg-blue-100'
                              : 'bg-gray-100'
                          }`}>
                            <IconComponent className={`w-4 h-4 ${
                              selectedCategory === category.id
                                ? 'text-blue-600'
                                : 'text-gray-600'
                            }`} />
                          </div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className={`text-sm ${
                          selectedCategory === category.id
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`}>
                          {category.count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {products.length > 0 ? (
                <div className="products-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">😔</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Товары не найдены
                  </h2>
                  <p className="text-gray-600 mb-8">
                    По запросу "{currentQuery}" ничего не найдено. Попробуйте изменить запрос или категорию.
                  </p>
                  
                  <div className="max-w-md mx-auto space-y-4">
                    <p className="text-sm text-gray-600 text-left">Рекомендации:</p>
                    <ul className="text-sm text-gray-600 text-left space-y-1">
                      <li>• Проверьте правильность написания</li>
                      <li>• Используйте более общие термины</li>
                      <li>• Попробуйте синонимы</li>
                      <li>• Уберите лишние слова</li>
                    </ul>
                  </div>

                  {/* Alternative Suggestions */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Попробуйте эти запросы:
                    </h3>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {suggestions.slice(0, 4).map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-sm font-medium transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage
