/**
 * 🛒 КНОПКА ДОБАВЛЕНИЯ В КОРЗИНУ
 * Компонент для добавления товаров в корзину с различными вариантами отображения
 */

import { useState } from 'react'
import { FiShoppingCart, FiCheck, FiPlus } from 'react-icons/fi'
import { useCart } from '../contexts/CartContext'

const AddToCartButton = ({ 
  product, 
  variant = 'default', 
  className = '',
  showQuantity = false,
  compact = false
}) => {
  const { addToCart, items: cartItems } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  // Проверяем, есть ли товар в корзине
  const cartItem = cartItems.find(item => item.id === product.id)
  const currentQuantity = cartItem?.quantity || 0

  const handleAddToCart = async () => {
    if (isAdding) return

    setIsAdding(true)
    
    try {
      await addToCart(product)
      
      // Показываем анимацию успешного добавления
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 2000)
      
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const getButtonContent = () => {
    if (isAdded) {
      return (
        <div className="flex items-center justify-center space-x-2 animate-pulse">
          <FiCheck className="h-4 w-4" />
          <span>Добавлено!</span>
        </div>
      )
    }

    if (isAdding) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Добавляем...</span>
        </div>
      )
    }

    if (variant === 'compact') {
      return <FiPlus className="h-4 w-4" />
    }

    if (variant === 'icon') {
      return <FiShoppingCart className="h-5 w-5" />
    }

    return (
      <div className="flex items-center justify-center space-x-2">
        <FiShoppingCart className="h-4 w-4" />
        <span>В корзину</span>
        {showQuantity && currentQuantity > 0 && (
          <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
            {currentQuantity}
          </span>
        )}
      </div>
    )
  }

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
    
    if (isAdded) {
      return `${baseClasses} bg-green-500 text-white hover:bg-green-600`
    }

    if (variant === 'compact') {
      return `${baseClasses} w-8 h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-300`
    }

    if (variant === 'icon') {
      return `${baseClasses} w-10 h-10 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-300`
    }

    if (variant === 'full') {
      return `${baseClasses} w-full px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 border border-blue-700`
    }

    // default variant
    return `${baseClasses} px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 border border-blue-700`
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || isAdded}
      className={`${getButtonClasses()} ${className} ${
        isAdding || isAdded ? 'cursor-not-allowed opacity-90' : ''
      }`}
      title={isAdded ? 'Товар добавлен в корзину' : 'Добавить в корзину'}
    >
      {getButtonContent()}
    </button>
  )
}

export default AddToCartButton


