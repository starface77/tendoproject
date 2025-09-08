/**
 * 🔐 КОНТЕКСТ АВТОРИЗАЦИИ
 * Управление состоянием аутентификации пользователей
 */

import { createContext, useContext, useReducer, useEffect } from 'react'
import { authApi, usersApi } from '../services/api'

// Начальное состояние
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
}

// Типы действий
const AUTH_ACTIONS = {
  SET_USER: 'SET_USER',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER'
}

// Редуктор для управления состоянием аутентификации
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_USER: {
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null
      }
    }

    case AUTH_ACTIONS.SET_AUTHENTICATED: {
      return {
        ...state,
        isAuthenticated: action.payload
      }
    }

    case AUTH_ACTIONS.SET_LOADING: {
      return {
        ...state,
        isLoading: action.payload
      }
    }

    case AUTH_ACTIONS.SET_ERROR: {
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }
    }

    case AUTH_ACTIONS.LOGOUT: {
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }
    }

    case AUTH_ACTIONS.UPDATE_USER: {
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    }

    default:
      return state
  }
}

// Создаем контекст
const AuthContext = createContext()

// Хук для использования контекста аутентификации
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Провайдер контекста аутентификации
export const AuthProvider = ({ children }) => {
  console.log('AuthContext: AuthProvider rendering')
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Загружаем пользователя из localStorage при монтировании
  useEffect(() => {
    console.log('AuthContext: useEffect triggered, calling loadUser')
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
      const token = localStorage.getItem('token')

      if (token) {
        console.log('AuthContext: Checking token validity...')

        try {
          // Проверяем токен через API
          const response = await authApi.verifyToken()

          if (response.success && response.user) {
            console.log('AuthContext: Token valid, loading user:', response.user)
            // Сохраняем актуальные данные пользователя
            localStorage.setItem('user', JSON.stringify(response.user))
            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.user })
          } else {
            throw new Error('Invalid token response')
          }
        } catch (error) {
          console.error('AuthContext: Token validation failed:', error.message)

          // Проверяем тип ошибки
          if (error.response?.status === 401) {
            console.log('AuthContext: Token expired or invalid, clearing data')
            // Токен истек или недействителен
            // Попробуем мягкий fallback на локальные данные пользователя, если есть
            const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } })()
            if (storedUser) {
              console.warn('AuthContext: using stored user fallback')
              dispatch({ type: AUTH_ACTIONS.SET_USER, payload: storedUser })
            } else {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              dispatch({ type: AUTH_ACTIONS.LOGOUT })
            }
          } else {
            // Другая ошибка (сеть, сервер), не очищаем токен
            console.warn('AuthContext: Network/server error, keeping token for retry')
            // Используем локальные данные пользователя, если есть
            const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } })()
            if (storedUser) {
              dispatch({ type: AUTH_ACTIONS.SET_USER, payload: storedUser })
            } else {
              dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: 'Ошибка проверки токена' })
            }
          }
        }
      } else {
        console.log('AuthContext: No token found')
        dispatch({ type: AUTH_ACTIONS.LOGOUT })
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователя:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
    }
  }

  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })

      console.log('🔐 AuthContext: Попытка входа для:', credentials.email)

      // Реальный API вызов
      const response = await authApi.login(credentials)
      
      console.log('✅ AuthContext: Ответ API:', response)
      
      if (response.success && response.token && response.user) {
        // Сохраняем токен и пользователя
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        // Обновляем состояние
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.user })
        
        return { 
          success: true, 
          message: response.message || 'Успешный вход'
        }
      } else {
        return { 
          success: false, 
          error: response.error || 'Неверные данные ответа'
        }
      }
    } catch (error) {
      console.error('❌ AuthContext: Ошибка входа:', error)
      return { 
        success: false, 
        error: error.message || 'Ошибка входа в систему'
      }
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
      
      console.log('📝 AuthContext: Попытка регистрации:', userData)
      
      // Реальный API вызов
      const response = await authApi.register(userData)
      
      console.log('✅ AuthContext: Ответ API регистрации:', response)
      
      if (response.success && response.token && response.user) {
        // Сохраняем токен и пользователя
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        // Обновляем состояние
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.user })
        
        return { 
          success: true, 
          message: response.message || 'Успешная регистрация'
        }
      } else {
        return { 
          success: false, 
          error: response.error || 'Неверные данные ответа'
        }
      }
    } catch (error) {
      console.error('❌ AuthContext: Ошибка регистрации:', error)
      return { 
        success: false, 
        error: error.message || 'Ошибка создания аккаунта'
      }
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
    }
  }

  const logout = async () => {
    try {
      // Отправляем запрос на выход
      await authApi.logout()
    } catch (error) {
      console.warn('Ошибка при выходе:', error.message)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }

  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
      
      // Отправляем запрос на обновление профиля
      const response = await usersApi.updateProfile(profileData)
      
      const updatedUser = { ...state.user, ...response.data }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: response.data })
      return { success: true }
    } catch (error) {
      console.error('Ошибка обновления профиля:', error)
      return { 
        success: false, 
        error: error.message || 'Ошибка обновления профиля'
      }
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
    }
  }

  const updateUser = async (userId, userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
      
      // Отправляем запрос на обновление пользователя  
      const response = await usersApi.updateProfile(userData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error)
      return { 
        success: false, 
        error: error.message || 'Ошибка обновления пользователя'
      }
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
    }
  }

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: null })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}