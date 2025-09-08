/**
 * СТРАНИЦА ТОВАРА
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiHeart, FiShoppingCart, FiShare2, FiStar, FiCheck, FiX, FiArrowLeft, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { useLanguage } from '../contexts/LanguageContext'
import { productsApi } from '../services/api'

const ProductPage = () => {
  const { t } = useLanguage()
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, isInCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await productsApi.getProduct(id)
      
      if (response.success && response.data && response.data.product) {
        // Адаптируем данные под наш формат
        const adaptedProduct = {
          ...response.data.product,
          // Убеждаемся что есть все необходимые поля
          images: response.data.product.images || [],
          rating: Number(response.data.product.rating) || Number(response.data.product.averageRating) || 0,
          reviews: response.data.product.reviewCount || response.data.product.reviewsCount || 0,
          price: response.data.product.price || response.data.product.currentPrice || 0,
          oldPrice: response.data.product.oldPrice || response.data.product.originalPrice || null,
          inStock: response.data.product.inStock !== undefined ? response.data.product.inStock : true,
          name: response.data.product.name || response.data.product.title || 'Без названия'
        }

        setProduct(adaptedProduct)
      } else {
        throw new Error(t('product_not_found', 'Товар не найден'))
      }
    } catch (err) {
      setError(err.message || 'Не удалось загрузить товар')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    try {
      setAddingToCart(true)
      await addToCart({
        id: product._id,
        name: getLocalizedText(product.name, 'Товар'),
        price: product.price,
        image: product.images?.[0] || '',
        quantity: quantity
      })
    } catch (error) {
    } finally {
      setAddingToCart(false)
    }
  }

  const handleWishlistToggle = async () => {
    if (!product) return
    
    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id)
      } else {
        await addToWishlist({
          id: product._id,
          name: getLocalizedText(product.name, 'Товар'),
          price: product.price,
          image: product.images?.[0] || '',
          rating: product.rating
        })
      }
    } catch (error) {
    }
  }

  const formatPrice = (price) => {
    if (!price || isNaN(price) || price === 0) {
      return 'Цена не указана'
    }
    return new Intl.NumberFormat('uz-UZ').format(price) + ' сум'
  }

  const getLocalizedText = (textObj, fallback = '') => {
    if (!textObj) return fallback
    if (typeof textObj === 'string') return textObj
    if (typeof textObj === 'number') return textObj.toString()
    if (typeof textObj === 'object') {
      // Проверяем если это многоязычный объект
      if (textObj.ru || textObj.uz || textObj.en) {
        return textObj.ru || textObj.uz || textObj.en || fallback
      }
      // Если это объект со структурой {name, value, ...}
      if (textObj.name) {
        return getLocalizedText(textObj.name, fallback)
      }
      if (textObj.value) {
        return getLocalizedText(textObj.value, fallback)
      }
      // Если это обычный объект, пытаемся его сериализовать
      return JSON.stringify(textObj)
    }
    return fallback
  }

  const renderStars = (rating) => {
    const safeRating = rating && !isNaN(rating) ? rating : 0
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(safeRating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  // Показываем загрузку
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  // Проверяем что product корректный
  if (product && typeof product === 'object') {
    // Проверяем нет ли проблемных полей
    for (const [key, value] of Object.entries(product)) {
      if (value && typeof value === 'object' && value.name && value.value && value.order && value._id) {
        // Проблемное поле найдено
      }
    }
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-6">
            <FiX className="w-full h-full text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('product_not_found', 'Товар не найден')}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('go_home', 'Вернуться на главную')}
          </button>
        </div>
      </div>
    )
  }

  // Если товар не загружен
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t('product_not_found', 'Товар не найден')}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('go_home', 'Вернуться на главную')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Навигация */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            {t('back', 'Назад')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Изображения */}
          <div className="space-y-4">
            {/* Основное изображение */}
            <div className="aspect-square bg-white rounded-lg border border-gray-200 overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={typeof product.images[selectedImage] === 'object' 
                    ? product.images[selectedImage]?.url || product.images[selectedImage]?.src || ''
                    : product.images[selectedImage] || ''}
                  alt={getLocalizedText(product.name, 'Товар')}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                      <FiShoppingCart className="w-12 h-12 text-gray-400" />
                    </div>
                    <span className="text-gray-400 text-sm">{t('no_image', 'Нет изображения')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Миниатюры */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={typeof image === 'object' 
                        ? image?.url || image?.src || ''
                        : image || ''}
                      alt={`${getLocalizedText(product.name, 'Товар')} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Информация о товаре */}
          <div className="space-y-6">
            
            {/* Заголовок и рейтинг */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {getLocalizedText(product.name, 'Без названия')}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(Number(product.rating) || 0)}
                </div>
                <span className="text-sm text-gray-600">
                  {(Number(product.rating) || 0).toFixed(1)}/5 ({product.reviews || 0} {t('reviews', 'отзывов')})
                </span>
              </div>

              {/* Информация о продавце */}
              {product.seller && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-lg">
                          {(product.seller.name || product.seller.storeName || 'М')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {product.seller.name || product.seller.storeName || 'Магазин'}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          {product.seller.verified && (
                            <div className="flex items-center space-x-1">
                              <FiStar className="h-4 w-4 text-yellow-500 fill-current" />
                              <span>Проверенный продавец</span>
                            </div>
                          )}
                          {product.seller.rating && (
                            <span>
                              Рейтинг: {(Number(product.seller.rating) || 0).toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                      Все товары продавца
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Цена */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>
              
              {product.oldPrice && (
                <div className="text-sm text-green-600">
                  {t('savings', 'Экономия')}: {formatPrice(product.oldPrice - product.price)}
                </div>
              )}
            </div>

            {/* Наличие */}
            <div className="flex items-center space-x-2">
              {product.inStock ? (
                <>
                  <FiCheck className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">{t('in_stock', 'В наличии')}</span>
                </>
              ) : (
                <>
                  <FiX className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 font-medium">{t('out_of_stock', 'Нет в наличии')}</span>
                </>
              )}
            </div>

            {/* Описание */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('description', 'Описание')}</h3>
                <p className="text-gray-600 leading-relaxed">{getLocalizedText(product.description, 'Описание отсутствует')}</p>
              </div>
            )}

            {/* Количество и кнопки */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">{t('quantity', 'Количество')}:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || addingToCart}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FiShoppingCart className="w-5 h-5 mr-2" />
                  {addingToCart ? t('adding', 'Добавляем...') : t('add_to_cart', 'В корзину')}
                </button>

                <button
                  onClick={handleWishlistToggle}
                  className={`px-6 py-3 rounded-lg border transition-colors ${
                    isInWishlist(product._id)
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-600'
                  }`}
                >
                  <FiHeart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                </button>

                <button className="px-6 py-3 rounded-lg border border-gray-300 text-gray-600 hover:text-gray-900 transition-colors">
                  <FiShare2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Преимущества */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <FiTruck className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{t('fast_delivery', 'Быстрая доставка')}</p>
                  <p className="text-sm text-gray-600">1-2 {t('days', 'дня')}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FiShield className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">{t('warranty', 'Гарантия')}</p>
                  <p className="text-sm text-gray-600">{t('official', 'Официальная')}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FiRefreshCw className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">{t('return_policy', 'Возврат')}</p>
                  <p className="text-sm text-gray-600">14 {t('days', 'дня')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Характеристики */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('specifications', 'Характеристики')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">{getLocalizedText(key, key)}:</span>
                  <span className="text-gray-900">{getLocalizedText(value, value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Особенности */}
        {product.features && product.features.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Особенности</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">
                    {typeof feature === 'object' && feature?.name 
                      ? getLocalizedText(feature.name, 'Особенность')
                      : getLocalizedText(feature, typeof feature === 'string' ? feature : 'Особенность')
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Отзывы */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {t('reviews', 'Отзывы')} ({product.reviews || 0})
            </h3>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              Написать отзыв
            </button>
          </div>

          {/* Общая оценка */}
          <div className="flex items-center space-x-6 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {(Number(product.rating) || 0).toFixed(1)}
              </div>
              <div className="flex items-center justify-center space-x-1 mt-1">
                {renderStars(product.rating || 0)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Из {product.reviews || 0} отзывов
              </div>
            </div>
            
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center space-x-2 mb-1">
                  <span className="text-sm text-gray-600 w-2">{stars}</span>
                  <FiStar className="w-3 h-3 text-gray-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${Math.random() * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">
                    {Math.floor(Math.random() * 20)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Список отзывов */}
          {product.reviewsList && product.reviewsList.length > 0 ? (
            <div className="space-y-6">
              {product.reviewsList.map((review, index) => (
                <div key={index} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {(review.userName || 'У')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {review.userName || 'Пользователь'}
                        </span>
                        <div className="flex space-x-0.5">
                          {renderStars(review.rating || 0)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.date || 'Сегодня'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">
                        {review.comment || 'Отличный товар!'}
                      </p>
                      {review.images && review.images.length > 0 && (
                        <div className="flex space-x-2">
                          {review.images.map((img, idx) => (
                            <img 
                              key={idx}
                              src={img} 
                              alt="Фото отзыва"
                              className="w-16 h-16 object-cover rounded border"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiStar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Пока нет отзывов на этот товар</p>
              <p className="text-sm">Будьте первым, кто оставит отзыв!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductPage