import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiWifiOff, FiRefreshCw } from 'react-icons/fi'
import ProductCard from '../components/product/ProductCard'
import CategoryCard from '../components/category/CategoryCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import BannerSlider from '../components/ui/BannerSlider'
import ProductSlider from '../components/ui/ProductSlider'
import { categoriesApi, productsApi, checkApiHealth, bannersApi } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'

const HomePage = () => {
  const { t } = useLanguage()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Загружаем данные при монтировании
  useEffect(() => {
    loadHomePageData()
  }, [/* eslint-disable-line react-hooks/exhaustive-deps */])

  const loadHomePageData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Проверяем доступность API
      const isApiHealthy = await checkApiHealth()

      if (isApiHealthy) {
        // Загружаем категории
        const categoriesResponse = await categoriesApi.getCategories()

        // Обрабатываем категории для правильного отображения
        const processedCategories = (categoriesResponse.data || []).map(cat => ({
          ...cat,
          name: cat.name || cat.name_ru || 'Категория',
          description: cat.description || cat.description_ru || ''
        }))

        setCategories(processedCategories)
        
        // Загружаем популярные товары (используем обычные товары вместо featured)
        const productsResponse = await productsApi.getProducts({ limit: 8, sort: '-createdAt' })
        setFeaturedProducts(productsResponse.data || [])

        // Загружаем баннеры
        const bannersResponse = await bannersApi.getBanners()
        const bannersData = bannersResponse.data || []
        setBanners(bannersData)
      } else {
        throw new Error('API недоступен')
      }
      
    } catch (error) {
      setError('Не удалось загрузить данные. Проверьте подключение к интернету.')
      
      // Показываем пустую страницу если API недоступен
      setCategories([])
      setFeaturedProducts([])
      setBanners([])
    } finally {
      setLoading(false)
    }
  }


  // Показать загрузку
  if (loading) {
    return <LoadingSpinner size="xl" />
  }

  // Показать ошибку
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-6">
            <FiWifiOff className="w-full h-full text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Ошибка загрузки
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={loadHomePageData}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <FiRefreshCw className="h-5 w-5" />
            <span>Попробовать снова</span>
          </button>
        </div>
      </div>
    )
  }

  // console.log('🏠 HomePage render - banners:', banners)
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banners Section */}
      {banners && banners.length > 0 && (
        <section className="container-custom pt-4 sm:pt-6 pb-6 sm:pb-8">
          <BannerSlider banners={banners} />
        </section>
      )}

      {/* Categories Grid */}
      <section className="bg-white py-8 sm:py-12">
        <div className="container-custom">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('homepage.popular_categories')}</h2>
          <Link to="/catalog" className="text-blue-700 hover:text-blue-800 font-medium flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base">
            <span className="hidden sm:inline">{t('homepage.view_all', 'Смотреть все')}</span>
            <span className="sm:hidden">Все</span>
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-8 sm:py-12">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('homepage.recommended_products')}</h2>
            <Link to="/catalog" className="text-blue-700 hover:text-blue-800 font-medium flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base">
              <span className="hidden sm:inline">{t('homepage.view_all', 'Смотреть все')}</span>
              <span className="sm:hidden">Все</span>
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <ProductSlider 
            products={featuredProducts} 
            title="Рекомендуемые товары"
            seeAllUrl="/catalog"
          />
        </div>
      </section>

    </div>
  )
}

export default HomePage
