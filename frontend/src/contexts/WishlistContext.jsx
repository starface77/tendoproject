/**
 * ❤️ КОНТЕКСТ ИЗБРАННОГО
 * Управление состоянием избранных товаров
 */

import { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../services/api'

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
  CLEAR_ERROR: 'CLEAR_ERROR',
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
        isLoading: false,
        error: null // Clear error on successful load
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
        totalItems: newItems.length,
        error: null // Clear error on successful add
      }
    }

    case WISHLIST_ACTIONS.REMOVE_ITEM: {
      const newItems = state.items.filter(item => item.id !== action.payload)
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
        error: null // Clear error on successful remove
      }
    }

    case WISHLIST_ACTIONS.CLEAR_WISHLIST: {
      return {
        ...state,
        items: [],
        totalItems: 0,
        error: null // Clear error on successful clear
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

    case WISHLIST_ACTIONS.CLEAR_ERROR: {
      return {
        ...state,
        error: null
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

  // Загружаем избранное с сервера при монтировании
  useEffect(() => {
    loadWishlistFromServer()
  }, [])

  const loadWishlistFromServer = async () => {
    try {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true })
      const response = await api.users.getFavorites()
      
      // Transform the data to match the expected format
      const transformedItems = response.data.map(fav => ({
        id: fav.product._id || fav.product.id,
        name: typeof fav.product.name === 'string' ? fav.product.name : (fav.product.name?.ru || fav.product.name?.en || fav.product.name?.uz || 'Без названия'),
        price: fav.product.price,
        image: fav.product.images?.[0]?.url || fav.product.images?.[0],
        addedAt: fav.addedAt,
        // Additional metadata from the Favorite model
        tags: fav.tags,
        priority: fav.priority,
        notes: fav.notes
      }))
      
      dispatch({ type: WISHLIST_ACTIONS.LOAD_WISHLIST, payload: transformedItems })
    } catch (error) {
      console.error('Ошибка загрузки избранного с сервера:', error)
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: error.message || 'Не удалось загрузить избранное' })
    } finally {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Добавление товара в избранное
  const addToWishlist = async (product) => {
    try {
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_ERROR }) // Clear previous errors
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true })

      // Проверяем, есть ли уже товар в избранном
      const existingItem = state.items.find(item => item.id === product.id)

      if (!existingItem) {
        // Отправляем запрос на сервер
        const response = await api.users.addToFavorites(product.id)
        
        // Transform the response data to match the expected format
        const fav = response.data
        const wishlistItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || product.images?.[0],
          addedAt: fav.addedAt || new Date().toISOString(),
          // Additional metadata
          tags: fav.tags || [],
          priority: fav.priority || 1,
          notes: fav.notes || ''
        }
        
        dispatch({ type: WISHLIST_ACTIONS.ADD_ITEM, payload: wishlistItem })
        return { success: true, message: 'Товар добавлен в избранное' }
      } else {
        // Already in wishlist
        const error = new Error('Товар уже в избранном')
        dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: error.message })
        return { success: false, error: error.message }
      }
    } catch (error) {
      console.error('Ошибка добавления в избранное:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Ошибка добавления в избранное'
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: errorMessage })
      return { success: false, error: errorMessage }
    } finally {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Удаление товара из избранного
  const removeFromWishlist = async (productId) => {
    try {
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_ERROR }) // Clear previous errors
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true })
      // Отправляем запрос на сервер
      await api.users.removeFromFavorites(productId)
      dispatch({ type: WISHLIST_ACTIONS.REMOVE_ITEM, payload: productId })
      return { success: true, message: 'Товар удален из избранного' }
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Ошибка удаления из избранного'
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: errorMessage })
      return { success: false, error: errorMessage }
    } finally {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Очистка избранного
  const clearWishlist = async () => {
    try {
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_ERROR }) // Clear previous errors
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true })
      // Удаляем все товары по одному (так как нет bulk endpoint)
      for (const item of state.items) {
        try {
          await api.users.removeFromFavorites(item.id)
        } catch (error) {
          console.error('Ошибка удаления товара из избранного:', item.id, error)
        }
      }
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST })
      return { success: true, message: 'Избранное очищено' }
    } catch (error) {
      console.error('Ошибка очистки избранного:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Ошибка очистки избранного'
      dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: errorMessage })
      return { success: false, error: errorMessage }
    } finally {
      dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Очистка ошибки
  const clearError = () => {
    dispatch({ type: WISHLIST_ACTIONS.CLEAR_ERROR })
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
    formatPrice,
    refreshWishlist: loadWishlistFromServer,
    clearError
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}