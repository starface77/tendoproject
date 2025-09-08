/**
 * 🛒 КОНТЕКСТ КОРЗИНЫ
 * Управление состоянием корзины покупок
 */

import { createContext, useContext, useReducer, useEffect } from 'react'

// Начальное состояние
const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isLoading: false,
  error: null
}

// Типы действий
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOAD_CART: 'LOAD_CART'
}

// Функция для подсчета итогов
const calculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  return { totalItems, totalAmount }
}

// Редуктор для управления состоянием корзины
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.LOAD_CART: {
      const items = Array.isArray(action.payload) ? action.payload : []
      const totals = calculateTotals(items)
      return {
        ...state,
        items,
        ...totals,
        isLoading: false
      }
    }

    case CART_ACTIONS.ADD_ITEM: {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      let newItems

      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }]
      }

      const totals = calculateTotals(newItems)
      return {
        ...state,
        items: newItems,
        ...totals
      }
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { id, quantity } = action.payload
      
      if (quantity <= 0) {
        const newItems = state.items.filter(item => item.id !== id)
        const totals = calculateTotals(newItems)
        return {
          ...state,
          items: newItems,
          ...totals
        }
      }

      const newItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
      const totals = calculateTotals(newItems)
      return {
        ...state,
        items: newItems,
        ...totals
      }
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const newItems = state.items.filter(item => item.id !== action.payload)
      const totals = calculateTotals(newItems)
      return {
        ...state,
        items: newItems,
        ...totals
      }
    }

    case CART_ACTIONS.CLEAR_CART: {
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0
      }
    }

    case CART_ACTIONS.SET_LOADING: {
      return {
        ...state,
        isLoading: action.payload
      }
    }

    case CART_ACTIONS.SET_ERROR: {
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }
    }

    default:
      return state
  }
}

// Создаем контекст
const CartContext = createContext()

// Хук для использования контекста корзины
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Провайдер контекста корзины
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Загружаем корзину из localStorage при монтировании
  useEffect(() => {
    loadCartFromStorage()
  }, [])

  // Сохраняем корзину в localStorage при изменении
  useEffect(() => {
    saveCartToStorage()
  }, [state.items])

  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        const cartData = JSON.parse(savedCart)
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData })
      }
    } catch (error) {
      console.error('Ошибка загрузки корзины из localStorage:', error)
    }
  }

  const saveCartToStorage = () => {
    try {
      localStorage.setItem('cart', JSON.stringify(state.items))
    } catch (error) {
      console.error('Ошибка сохранения корзины в localStorage:', error)
    }
  }

  // Добавление товара в корзину
  const addToCart = async (product) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true })
      
      // Проверяем, есть ли уже товар в корзине
      const existingItem = state.items.find(item => item.id === product.id)
      
      if (existingItem) {
        // Обновляем количество
        const updatedItems = state.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: updatedItems })
      } else {
        // Добавляем новый товар
        const newItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        }
        dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: newItem })
      }
      
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error)
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Удаление товара из корзины
  const removeFromCart = async (productId) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true })
      dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId })
    } catch (error) {
      console.error('Ошибка удаления из корзины:', error)
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Обновление количества товара
  const updateQuantity = async (productId, newQuantity) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true })
      
      if (newQuantity <= 0) {
        removeFromCart(productId)
        return
      }
      
      dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { id: productId, quantity: newQuantity } })
      
    } catch (error) {
      console.error('Ошибка обновления количества:', error)
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Очистка корзины
  const clearCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true })
      dispatch({ type: CART_ACTIONS.CLEAR_CART })
      localStorage.removeItem('cart')
    } catch (error) {
      console.error('Ошибка очистки корзины:', error)
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Проверка наличия товара в корзине
  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId)
  }

  // Получение количества товара в корзине
  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  // Форматирование цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' сум'
  }

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    formatPrice
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}