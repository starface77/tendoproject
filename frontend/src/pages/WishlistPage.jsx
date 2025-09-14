import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart, FiTrash2, FiShoppingCart, FiArrowLeft, FiAlertCircle } from 'react-icons/fi'
import ProductCard from '../components/product/ProductCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useWishlist } from '../contexts/WishlistContext'
import { useCart } from '../contexts/CartContext'
import { useLanguage } from '../contexts/LanguageContext'

const WishlistPage = () => {
  const { items: wishlistItems, removeFromWishlist, isLoading: wishlistLoading, formatPrice, refreshWishlist, error, clearError } = useWishlist()
  const { addToCart, isInCart } = useCart()
  const { t } = useLanguage()
  const [isRemoving, setIsRemoving] = useState({})

  const getItemImage = (image) => {
    if (!image) return null
    
    if (typeof image === 'object') {
      return image?.url || image?.src
    }
    
    return image
  }

  const handleAddToCart = async (product) => {
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: getItemImage(product.image),
        quantity: 1
      })
      console.log('Товар добавлен в корзину:', product.name)
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error)
      alert(error.message || 'Ошибка добавления в корзину')
    }
  }

  const handleRemoveFromWishlist = async (productId) => {
    try {
      setIsRemoving(prev => ({ ...prev, [productId]: true }))
      clearError() // Clear any previous errors
      const result = await removeFromWishlist(productId)
      if (!result.success) {
        alert(result.error || 'Ошибка при удалении из избранного')
      }
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error)
      alert(error.message || 'Ошибка при удалении из избранного')
    } finally {
      setIsRemoving(prev => ({ ...prev, [productId]: false }))
    }
  }

  if (wishlistLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        
        {/* Header */}
        <div className="mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
{t('back_to_home', 'Назад на главную')}
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FiHeart className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('wishlist', 'Избранное')}</h1>
              <p className="text-gray-600">{t('your_favorite_products', 'Ваши любимые товары')}</p>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <FiAlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Ошибка</p>
                <p className="text-red-600">{error}</p>
              </div>
              <button 
                onClick={clearError}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiHeart className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('wishlist_empty', 'Избранное пусто')}</h3>
            <p className="text-gray-600 mb-6">{t('add_products_to_wishlist', 'Добавляйте товары в избранное, чтобы не потерять их')}</p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
{t('start_shopping', 'Перейти к покупкам')}
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('total_in_wishlist', 'Всего в избранном')}</p>
                  <p className="text-2xl font-bold text-gray-900">{wishlistItems.length} товар{wishlistItems.length === 1 ? '' : wishlistItems > 1 && wishlistItems < 5 ? 'а' : 'ов'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{t('total_cost', 'Общая стоимость')}</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {new Intl.NumberFormat('uz-UZ').format(
                      wishlistItems.reduce((total, item) => total + (item.price || 0), 0)
                    )} сум
                  </p>
                </div>
              </div>
            </div>

            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-100">
                    {item.image ? (
                      <img
                        src={getItemImage(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">📱</span>
                      </div>
                    )}
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      disabled={isRemoving[item.id]}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isRemoving[item.id] ? (
                        <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
                      ) : (
                        <FiTrash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        {new Intl.NumberFormat('uz-UZ').format(item.price)} сум
                      </span>
                      {item.oldPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {new Intl.NumberFormat('uz-UZ').format(item.oldPrice)} сум
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                        disabled={isInCart(item.id)}
                      >
                        <FiShoppingCart className="h-4 w-4" />
                        <span>{isInCart(item.id) ? t('in_cart', 'В корзине') : t('add_to_cart', 'В корзину')}</span>
                      </button>
                      
                      <Link
                        to={`/product/${item.id}`}
                        className="bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                      >
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default WishlistPage