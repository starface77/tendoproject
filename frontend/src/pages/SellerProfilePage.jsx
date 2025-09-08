import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiUser, FiStar, FiMapPin, FiCalendar, FiShoppingBag, FiArrowLeft, FiCheck } from 'react-icons/fi'
import ProductCard from '../components/product/ProductCard'
import { ProductListSkeleton, LoadingMessage } from '../components/ui/LoadingState'
import { useLanguage } from '../contexts/LanguageContext'
import api from '../services/api'

const SellerProfilePage = () => {
  const { sellerId } = useParams()
  const { t } = useLanguage()
  
  const [seller, setSeller] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadSellerData()
  }, [sellerId])

  const loadSellerData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Загружаем данные продавца
      const sellerResponse = await api.get(`/sellers/${sellerId}`)
      if (sellerResponse.success) {
        setSeller(sellerResponse.data)
      }

      // Загружаем товары продавца
      setProductsLoading(true)
      const productsResponse = await api.get(`/products?seller=${sellerId}`)
      if (productsResponse.success) {
        setProducts(productsResponse.data || [])
      }

    } catch (error) {
      console.error('Ошибка загрузки данных продавца:', error)
      setError(error.message)
    } finally {
      setLoading(false)
      setProductsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long'
    })
  }

  const getSellerName = (seller) => {
    if (!seller) return ''
    return seller.storeName || `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || seller.name || 'Продавец'
  }

  if (loading) {
    return <LoadingMessage message={t('loading_seller', 'Загрузка профиля продавца...')} />
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiUser className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('seller_not_found', 'Продавец не найден')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('seller_not_found_desc', 'Запрашиваемый продавец не существует или был удален')}
          </p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            {t('back_to_home', 'Назад на главную')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-6"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            {t('back', 'Назад')}
          </Link>

          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {getSellerName(seller).charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {getSellerName(seller)}
                </h1>
                {seller.verified && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <FiCheck className="h-4 w-4" />
                    <span>{t('verified', 'Проверен')}</span>
                  </div>
                )}
              </div>

              {/* Rating */}
              {seller.rating > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(seller.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {seller.rating.toFixed(1)} ({seller.reviewsCount || 0} {t('reviews', 'отзывов')})
                  </span>
                </div>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {seller.location && (
                  <div className="flex items-center gap-1">
                    <FiMapPin className="h-4 w-4" />
                    <span>{seller.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <FiCalendar className="h-4 w-4" />
                  <span>{t('on_platform_since', 'На платформе с')} {formatDate(seller.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiShoppingBag className="h-4 w-4" />
                  <span>{products.length} {t('products', 'товаров')}</span>
                </div>
              </div>

              {/* Description */}
              {seller.description && (
                <p className="text-gray-700 mt-4 max-w-2xl">
                  {seller.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('seller_products', 'Товары продавца')}
          </h2>
          <span className="text-sm text-gray-500">
            {products.length} {t('products', 'товаров')}
          </span>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <ProductListSkeleton count={8} />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('no_products_yet', 'Пока нет товаров')}
            </h3>
            <p className="text-gray-600">
              {t('seller_no_products_desc', 'Этот продавец еще не добавил товары')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerProfilePage

