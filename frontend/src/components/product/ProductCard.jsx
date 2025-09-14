import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart, FiStar, FiShoppingCart, FiEye } from 'react-icons/fi'
import AddToCartButton from '../AddToCartButton'
import { useWishlist } from '../../contexts/WishlistContext'
import { useLanguage } from '../../contexts/LanguageContext'

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)

  const { addToWishlist, removeFromWishlist, isInWishlist, refreshWishlist, clearError } = useWishlist()
  const { t } = useLanguage()
  const productId = product?.id || product?._id
  
  const isFavorite = isInWishlist(productId)

  const toggleFavorite = async () => {
    try {
      setIsTogglingFavorite(true)
      clearError() // Clear any previous errors
      
      if (isFavorite) {
        const result = await removeFromWishlist(productId)
        if (!result.success) {
          alert(result.error || 'Ошибка при удалении из избранного')
        }
      } else {
        // Add the full product data when adding to favorites
        const result = await addToWishlist({
          id: productId,
          name: getProductName(product.name),
          price: product.price,
          image: getProductImage(product.images || product.image),
          rating: product.rating || 0
        })
        if (!result.success) {
          alert(result.error || 'Ошибка при добавлении в избранное')
        }
      }
      // Refresh the wishlist to ensure consistency
      await refreshWishlist()
    } catch (error) {
      console.error('Ошибка при работе с избранным:', error)
      alert(error.message || 'Ошибка при работе с избранным')
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const getProductImage = (images) => {
    if (!images) return null
    
    if (Array.isArray(images)) {
      if (images.length === 0) return null
      const firstImage = images[0]
      if (typeof firstImage === 'object') {
        return firstImage?.url || firstImage?.src
      }
      return firstImage
    }
    
    if (typeof images === 'object') {
      return images?.url || images?.src
    }
    
    return images
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' сум'
  }

  // Функция для получения названия продукта из многоязычного объекта
  const getProductName = (name) => {
    if (typeof name === 'string') {
      return name
    }
    if (typeof name === 'object' && name !== null) {
      return name.ru || name.en || name.uz || 'Без названия'
    }
    return 'Без названия'
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <FiStar key={i} className="w-3 h-3 text-yellow-400 fill-current" />
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <FiStar key={i} className="w-3 h-3 text-yellow-400 fill-current opacity-50" />
        )
      } else {
        stars.push(
          <FiStar key={i} className="w-3 h-3 text-gray-300" />
        )
      }
    }
    return stars
  }

  // Grid view
  if (viewMode === 'grid') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col h-full group">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {/* Loading State */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Product Image */}
          <Link to={`/product/${productId}`} className="block h-full">
            {getProductImage(product.images || product.image) ? (
              <img
                src={getProductImage(product.images || product.image)}
                alt={getProductName(product.name)}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                  <FiShoppingCart className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}
          </Link>
          
          {/* Fallback Image */}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                <FiShoppingCart className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {product.badge && (
              <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
                {product.badge}
              </span>
            )}
            {product.discount && (
              <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
                -{product.discount}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-green-500 text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
                Новинка
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(); }}
              disabled={isTogglingFavorite}
              aria-label={isFavorite ? 'Удалить из избранного' : 'В избранное'}
              className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 hover:text-red-500'
              }`}
            >
              {isTogglingFavorite ? (
                <div className="w-3 h-3 border-2 border-gray-200 border-t-white rounded-full animate-spin"></div>
              ) : (
                <FiHeart className={`w-3 h-3 ${isFavorite ? 'fill-current' : ''}`} />
              )}
            </button>
            
            <Link 
              to={`/product/${productId}`}
              className="w-7 h-7 rounded-full bg-white text-gray-600 hover:text-blue-600 flex items-center justify-center shadow-sm transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <FiEye className="w-3 h-3" />
            </Link>
          </div>

          {/* Quick Add to Cart */}
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
            <AddToCartButton 
              product={product} 
              variant="full"
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2 flex-1 flex flex-col">
          {/* Product Name */}
          <Link
            to={`/product/${productId}`}
            className="block hover:text-blue-600 transition-colors flex-1"
          >
            <h3 className="font-medium text-gray-900 line-clamp-2 text-xs leading-tight">
              {getProductName(product.name)}
            </h3>
          </Link>

          {/* Seller Info */}
          {product.seller && (
            <div className="flex items-center space-x-1 text-[10px] text-gray-500">
              <span>Продавец:</span>
              <Link 
                to={`/seller/${product.seller._id || product.seller.id}`}
                className="font-medium text-blue-600 hover:text-blue-700 truncate transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {product.seller.name || product.seller.storeName || 'Магазин'}
              </Link>
              {product.seller.verified && (
                <FiStar className="h-2.5 w-2.5 text-yellow-500 fill-current" />
              )}
            </div>
          )}

          {/* Rating */}
          {(product.rating || 0) > 0 && (
            <div className="flex items-center space-x-1">
              <div className="flex space-x-0.5">
                {renderStars(product.rating || 0)}
              </div>
              <span className="text-[10px] text-gray-500 ml-1">
                {product.rating?.toFixed(1)} ({product.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-base font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-[10px] text-red-600">
                Экономия {formatPrice(product.originalPrice - product.price)}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // List view
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row">
      {/* Image Container */}
      <div className="relative sm:w-40 aspect-square sm:aspect-auto overflow-hidden bg-gray-50">
        {/* Loading State */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Product Image */}
        <Link to={`/product/${productId}`} className="block h-full">
          {getProductImage(product.images || product.image) ? (
            <img
              src={getProductImage(product.images || product.image)}
              alt={getProductName(product.name)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                <FiShoppingCart className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          )}
        </Link>
        
        {/* Fallback Image */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
              <FiShoppingCart className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-1.5 left-1.5 flex space-x-1">
          {product.discount && (
            <span className="bg-red-500 text-white px-1 py-0.5 rounded text-[10px] font-medium">
              -{product.discount}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-green-500 text-white px-1 py-0.5 rounded text-[10px] font-medium">
              Новинка
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(); }}
          disabled={isTogglingFavorite}
          aria-label={isFavorite ? 'Удалить из избранного' : 'В избранное'}
          className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
            isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white/80 backdrop-blur text-gray-400 hover:text-red-500'
          }`}
        >
          {isTogglingFavorite ? (
            <div className="w-2.5 h-2.5 border-2 border-gray-200 border-t-white rounded-full animate-spin"></div>
          ) : (
            <FiHeart className={`w-2.5 h-2.5 ${isFavorite ? 'fill-current' : ''}`} />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex-1">
          {/* Product Name */}
          <Link
            to={`/product/${productId}`}
            className="block hover:text-blue-600 transition-colors"
          >
            <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-tight">
              {getProductName(product.name)}
            </h3>
          </Link>

          {/* Seller Info */}
          {product.seller && (
            <div className="flex items-center space-x-1 text-[10px] text-gray-500 mt-1">
              <span>Продавец:</span>
              <Link 
                to={`/seller/${product.seller._id || product.seller.id}`}
                className="font-medium text-blue-600 hover:text-blue-700 truncate transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {product.seller.name || product.seller.storeName || 'Магазин'}
              </Link>
              {product.seller.verified && (
                <FiStar className="h-2.5 w-2.5 text-yellow-500 fill-current" />
              )}
            </div>
          )}

          {/* Rating */}
          {(product.rating || 0) > 0 && (
            <div className="flex items-center space-x-1 mt-1.5">
              <div className="flex space-x-0.5">
                {renderStars(product.rating || 0)}
              </div>
              <span className="text-[10px] text-gray-500 ml-1">
                {product.rating?.toFixed(1)} ({product.reviewCount || 0})
              </span>
            </div>
          )}
        </div>

        {/* Price and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
          <div className="space-y-1">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-base font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-[10px] text-red-600">
                Экономия {formatPrice(product.originalPrice - product.price)}
              </div>
            )}
          </div>

          <AddToCartButton 
            product={product} 
            variant="full"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors whitespace-nowrap"
          />
        </div>
      </div>
    </div>
  )
}

export default ProductCard