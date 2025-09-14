import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiWifiOff, FiRefreshCw } from 'react-icons/fi'
import CategoryCard from '../components/category/CategoryCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import BannerSlider from '../components/ui/BannerSlider'
import ProductSlider from '../components/ui/ProductSlider'
import { categoriesApi, checkApiHealth, bannersApi, sectionsApi } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'

const HomePage = () => {
  const { t } = useLanguage()
  const [categories, setCategories] = useState([])
  const [banners, setBanners] = useState([])
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Загружаем данные при монтировании
  useEffect(() => {
    loadHomePageData()
  }, [])

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
        
        // Загружаем баннеры
        const bannersResponse = await bannersApi.getBanners()
        const bannersData = bannersResponse.data || []
        setBanners(bannersData)

        // Загружаем динамические секции
        const sectionsResponse = await sectionsApi.getSections()
        setSections(sectionsResponse.data || [])
      } else {
        throw new Error('API недоступен')
      }
      
    } catch (error) {
      setError('Не удалось загрузить данные. Проверьте подключение к интернету.')
      
      // Показываем пустую страницу если API недоступен
      setCategories([])
      setBanners([])
      setSections([])
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
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiRefreshCw className="h-5 w-5" />
            <span>Попробовать снова</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banners Section */}
      {banners && banners.length > 0 && (
        <section className="container-custom pt-4 pb-6">
          <BannerSlider banners={banners} />
        </section>
      )}

      {/* Categories Grid */}
      <section className="bg-white py-8">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Популярные категории</h2>
            <Link to="/catalog" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-2 text-sm">
              <span>Смотреть все</span>
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Sections from Admin */}
      {sections && sections.length > 0 && sections.map((s) => (
        <section key={s.id} className="bg-white py-8">
          <div className="container-custom">
            <ProductSlider 
              products={s.products || []}
              title={s.title}
              seeAllUrl={s.key ? `/catalog?section=${s.key}` : '/catalog'}
            />
          </div>
        </section>
      ))}

      {/* Additional Categories Section */}
      {categories.length > 6 && (
        <section className="bg-white py-8">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Все категории</h2>
              <Link to="/catalog" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-2 text-sm">
                <span>Смотреть все</span>
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(6).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default HomePage