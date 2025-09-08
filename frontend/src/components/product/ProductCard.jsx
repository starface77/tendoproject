import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart, FiStar, FiShoppingCart } from 'react-icons/fi'
import AddToCartButton from '../AddToCartButton'
import { useWishlist } from '../../contexts/WishlistContext'
import { useLanguage } from '../../contexts/LanguageContext'

const ProductCard = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { t } = useLanguage()
  const productId = product?.id || product?._id
  
  const isFavorite = isInWishlist(productId)

  const toggleFavorite = async () => {
    if (isFavorite) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist({
        id: productId,
        name: getProductName(product.name),
        price: product.price,
        image: getProductImage(product.images || product.image),
        rating: product.rating || 0
      })
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {/* Loading State */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Product Image */}
        <Link to={`/product/${productId}`} className="block">
          {getProductImage(product.images || product.image) ? (
            <img
              src={getProductImage(product.images || product.image)}
              alt={getProductName(product.name)}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <FiShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          )}
        </Link>
        
        {/* Fallback Image */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <FiShoppingCart className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        )}

        {/* Simple Badge */}
        {product.badge && (
          <div className="absolute top-2 left-2">
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
              {product.badge}
            </span>
          </div>
        )}

        {/* Simple Discount Badge */}
        {product.discount && (
          <div className="absolute top-2 left-2">
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
              -{product.discount}%
            </span>
          </div>
        )}

        {/* Simple Heart Button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(); }}
          aria-label={isFavorite ? 'Удалить из избранного' : 'В избранное'}
          className={`absolute top-2 right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
            isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white/80 backdrop-blur text-gray-400 hover:text-red-500'
          } shadow-sm`}
        >
          <FiHeart className={`w-3 h-3 sm:w-4 sm:h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2 flex-1 flex flex-col">
        {/* Product Name */}
        <Link
          to={`/product/${productId}`}
          className="block hover:text-blue-600 transition-colors flex-1"
        >
          <h3 className="font-medium text-gray-900 line-clamp-2 text-xs sm:text-sm leading-tight">
            {getProductName(product.name)}
          </h3>
        </Link>

        {/* Seller Info */}
        {product.seller && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <span>Продавец:</span>
            <Link 
              to={`/seller/${product.seller._id || product.seller.id}`}
              className="font-medium text-blue-600 hover:text-blue-700 truncate transition-colors"
            >
              {product.seller.name || product.seller.storeName || 'Магазин'}
            </Link>
            {product.seller.verified && (
              <FiStar className="h-3 w-3 text-yellow-500 fill-current" />
            )}
          </div>
        )}

        {/* Rating */}
        {(product.rating || 0) > 0 && (
          <div className="flex items-center space-x-1">
            <div className="flex space-x-0.5">
              {renderStars(product.rating || 0)}
            </div>
            <span className="text-xs text-gray-500 ml-2 hidden sm:inline font-medium">
              {product.rating?.toFixed(1)} ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-sm sm:text-base font-bold text-gray-900 truncate">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through hidden sm:inline">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Simple Add to Cart Button */}
        <div className="mt-auto pt-1 sm:pt-2">
          <AddToCartButton 
            product={product} 
            variant="full"
            className="w-full text-xs sm:text-sm py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          />
        </div>
      </div>
    </div>
  )
}

export default ProductCard

