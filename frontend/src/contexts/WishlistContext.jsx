/**
 * ❤️ КОНТЕКСТ ИЗБРАННОГО
 * Управление состоянием избранных товаров
 */

import { createContext, useContext, useReducer, useEffect } from 'react'

// Начальное состояние
const initialState = {
  items: [],
  totalItems: 0,
  isLoading: false,
  error: null
}

// Типы действий
const WISHLIST_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_WISHLIST: 'CLEAR_WISHLIST',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOAD_WISHLIST: 'LOAD_WISHLIST'
}

// Редуктор для управления состоянием избранного
const wishlistReducer = (state, action) => {
  switch (action.type) {
    case WISHLIST_ACTIONS.LOAD_WISHLIST: {
      const items = Array.isArray(action.payload) ? action.payload : []
      return {
        ...state,
        items,
        totalItems: items.length,
        isLoading: false
      }
    }

    case WISHLIST_ACTIONS.ADD_ITEM: {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      if (existingItem) {
        return state // Товар уже в избранном
      }

      const newItems = [...state.items, action.payload]
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length
      }
    }

    case WISHLIST_ACTIONS.REMOVE_ITEM: {
      const newItems = state.items.filter(item => item.id !== action.payload)
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length
      }
    }

    case WISHLIST_ACTIONS.CLEAR_WISHLIST: {
      return {
        ...state,
        items: [],
        totalItems: 0
      }
    }

    case WISHLIST_ACTIONS.SET_LOADING: {
      return {
        ...state,
        isLoading: action.payload
      }
    }

    case WISHLIST_ACTIONS.SET_ERROR: {
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
const WishlistContext = createContext()

// Хук для использования контекста избранного
export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

// Провайдер контекста избранного
export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState)

  // Загружаем избранное из localStorage при монтировании
  useEffect(() => {
    loadWishlistFromStorage()
  }, [])

  // Сохраняем избранное в localStorage при изменении
  useEffect(() => {
    saveWishlistToStorage()
  }, [state.items])

  const loadWishlistFromStorage = () => {
    try {
      const savedWishlist = localStorage.getItem('wishlist')
      if (savedWishlist) {
        const wishlistData = JSON.parse(savedWishlist)
        dispatch({ type: WISHLIST_ACTIONS.LOAD_WISHLIST, payload: wishlistData })
      }
    } catch (error) {
      console.error('Ошибка загрузки избранного из localStorage:', error)
    }
  }

  const saveWishlistToStorage = () => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(state.items))
    } catch (error) {
      console.error('Ошибка сохранения избранного в localStorage:', error)
    }
  }

  // Добавление товара в избранное
  const addToWishlist = async (product) => {
    try {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true })

      // Проверяем, есть ли уже товар в избранном
      const existingItem = state.items.find(item => item.id === product.id)

      if (!existingItem) {
        const wishlistItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || product.images?.[0],
          addedAt: new Date().toISOString()
        }
        dispatch({ type: WISHLIST_ACTIONS.ADD_ITEM, payload: wishlistItem })
      }

    } catch (error) {
      console.error('Ошибка добавления в избранное:', error)
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Удаление товара из избранного
  const removeFromWishlist = async (productId) => {
    try {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true })
      dispatch({ type: WISHLIST_ACTIONS.REMOVE_ITEM, payload: productId })
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error)
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Очистка избранного
  const clearWishlist = async () => {
    try {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true })
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST })
      localStorage.removeItem('wishlist')
    } catch (error) {
      console.error('Ошибка очистки избранного:', error)
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Проверка наличия товара в избранном
  const isInWishlist = (productId) => {
    return state.items.some(item => item.id === productId)
  }

  // Получение товара из избранного
  const getWishlistItem = (productId) => {
    return state.items.find(item => item.id === productId)
  }

  // Форматирование цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' сум'
  }

  const value = {
    ...state,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistItem,
    formatPrice
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}
