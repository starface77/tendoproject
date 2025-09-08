/**
 * 🔌 TENDO MARKET API SERVICE
 * Подключение к локальному backend API
 */

import axios from 'axios'

// Базовая конфигурация API (env-driven)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.MODE === 'production' ? 'https://api.tendo.uz' : '')

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: import.meta.env.MODE === 'production' ? `${API_BASE_URL}/api/v1` : '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor для обработки ответов
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token may be invalid
    }
    return Promise.reject(error)
  }
)

// Обертка для обработки ошибок API
const handleApiError = (error) => {
  if (error.code === 'ECONNABORTED') {
    throw new Error('Превышено время ожидания. Проверьте подключение к интернету.')
  }
  
  if (error.response) {
    const message = error.response.data?.message || error.response.data?.error || 'Произошла ошибка на сервере'
    throw new Error(message)
  } else if (error.request) {
    throw new Error('Нет соединения с сервером. Проверьте подключение к интернету.')
  } else {
    throw new Error('Произошла неожиданная ошибка')
  }
}

// ==================================================
// 🛍️ PRODUCTS API
// ==================================================

export const productsApi = {
  // Получить все товары с фильтрацией
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params })
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Получить один товар по ID
  getProduct: async (id) => {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Поиск товаров
  searchProducts: async (query, params = {}) => {
    try {
      const response = await api.get('/products/search', { 
        params: { q: query, ...params } 
      })
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Рекомендуемые товары
  getFeaturedProducts: async (limit = 10) => {
    try {
      const response = await api.get('/products/featured', { 
        params: { limit } 
      })
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Товары по категории
  getProductsByCategory: async (categoryId, params = {}) => {
    try {
      const response = await api.get(`/products/category/${categoryId}`, { params })
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Отзывы товара
  getProductReviews: async (id, params = {}) => {
    try {
      const response = await api.get(`/products/${id}/reviews`, { params })
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Добавить отзыв
  addProductReview: async (id, reviewData) => {
    try {
      const response = await api.post(`/products/${id}/reviews`, reviewData)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  }
}

// ==================================================
// 📂 CATEGORIES API
// ==================================================

export const categoriesApi = {
  // Все категории
  getCategories: async (params = {}) => {
    try {
      const response = await api.get('/categories', { params })
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Древо категорий
  getCategoryTree: async () => {
    try {
      const response = await api.get('/categories/tree')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Рекомендуемые категории
  getFeaturedCategories: async () => {
    try {
      const response = await api.get('/categories/featured')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Одна категория
  getCategory: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  }
}

// ==================================================
// 🔐 AUTH API
// ==================================================

export const authApi = {
  // Регистрация
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Вход
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Выход
  logout: async () => {
    try {
      await api.post('/auth/logout')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      handleApiError(error)
    }
  },

  // Проверка токена
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Восстановление пароля
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Сброс пароля
  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password })
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  }
}

// ==================================================
// 🛒 ORDERS API
// ==================================================

export const ordersApi = {
  // Получить заказы пользователя
  getUserOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params })
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Создать заказ
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Получить заказ по ID
  getOrder: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Отменить заказ
  cancelOrder: async (id) => {
    try {
      const response = await api.patch(`/orders/${id}/cancel`)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  }
}

// ==================================================
// 👤 USERS API
// ==================================================

export const usersApi = {
  // Профиль пользователя
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Обновить профиль
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Избранные товары
  getFavorites: async (params = {}) => {
    try {
      const response = await api.get('/users/favorites', { params })
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Добавить в избранное
  addToFavorites: async (productId) => {
    try {
      const response = await api.post('/users/favorites', { productId })
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Удалить из избранного
  removeFromFavorites: async (productId) => {
    try {
      const response = await api.delete(`/users/favorites/${productId}`)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  }
}

// ==================================================
// 🏙️ CITIES API
// ==================================================

export const citiesApi = {
  // Все города
  getCities: async () => {
    try {
      const response = await api.get('/cities')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  }
}

// Payments API moved below

// ==================================================
// 🔔 NOTIFICATIONS API
// ==================================================

export const notificationsApi = {
  // Получить уведомления пользователя
  getNotifications: async (options = {}) => {
    try {
      const response = await api.get('/notifications', { params: options })
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Получить статистику уведомлений
  getNotificationStats: async () => {
    try {
      const response = await api.get('/notifications/stats')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Отметить уведомление как прочитанное
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Архивировать уведомление
  archiveNotification: async (notificationId) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/archive`)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Удалить уведомление
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Отметить все уведомления как прочитанные
  markAllNotificationsAsRead: async () => {
    try {
      const response = await api.patch('/notifications/read-all')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  }
}

// ==================================================
// 💳 PAYMENTS API
// ==================================================

export const paymentsApi = {
  // Создание платежа
  createPayment: async (orderData) => {
    try {
      const response = await api.post('/payments', orderData)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },
  // Получение статуса платежа
  getPaymentStatus: async (orderId) => {
    try {
      const response = await api.get(`/payments/status/${orderId}`)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },
  // Получение списка платежей
  getUserPayments: async () => {
    try {
      const response = await api.get('/payments')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  }
}

// 🎯 BANNERS API
// ==================================================

export const bannersApi = {
  // Получить активные баннеры (публичные)
  getBanners: async () => {
    try {
      const response = await api.get('/banners')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },
  // ADMIN: CRUD
  getAdminBanners: async () => {
    try {
      const response = await api.get('/banners/admin')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },
  createBanner: async (banner) => {
    try {
      const response = await api.post('/banners/admin', banner)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },
  updateBanner: async (id, banner) => {
    try {
      const response = await api.put(`/banners/admin/${id}`, banner)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },
  deleteBanner: async (id) => {
    try {
      const response = await api.delete(`/banners/admin/${id}`)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  }
}

// ==================================================
// 🏪 SELLER API
// ==================================================

export const sellerApi = {
  // Подать заявку на продавца
  applyToBecomeSeller: async (applicationData) => {
    try {
      const response = await api.post('/seller-applications', applicationData)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Получить статус заявки
  getApplicationStatus: async () => {
    try {
      const response = await api.get('/seller-applications/status')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Получить данные дашборда продавца
  getDashboard: async () => {
    try {
      const response = await api.get('/sellers/me/dashboard')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Получить товары продавца
  getProducts: async () => {
    try {
      const response = await api.get('/sellers/me/products')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Получить финансовые данные продавца
  getFinance: async () => {
    try {
      const response = await api.get('/sellers/me/finance')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Получить заказы продавца
  getOrders: async () => {
    try {
      const response = await api.get('/sellers/me/orders')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Создать новый товар
  createProduct: async (productData) => {
    try {
      const response = await api.post('/sellers/me/products', productData)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Обновить товар
  updateProduct: async (productId, productData) => {
    try {
      const response = await api.put(`/sellers/me/products/${productId}`, productData)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Удалить товар
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/sellers/me/products/${productId}`)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  }
}

// ==================================================
// 💬 CHAT API
// ==================================================

export const chatApi = {
  // Получить чаты пользователя
  getUserChats: async () => {
    try {
      const response = await api.get('/chats')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Получить сообщения чата
  getChatMessages: async (chatId) => {
    try {
      const response = await api.get(`/chats/${chatId}/messages`)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Отправить сообщение
  sendMessage: async (chatId, messageData) => {
    try {
      const response = await api.post(`/chats/${chatId}/messages`, messageData)
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  }
}

// Проверка доступности API
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`)
    return response.ok
  } catch (error) {
    return false
  }
}

// Загрузка файлов
export const uploadFile = async (file, type = 'image') => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}

// Экспорт по умолчанию
export default {
  products: productsApi,
  categories: categoriesApi,
  auth: authApi,
  orders: ordersApi,
  users: usersApi,
  cities: citiesApi,
  payments: paymentsApi,
  banners: bannersApi,
  seller: sellerApi,
  chat: chatApi,
  notifications: notificationsApi,
  checkApiHealth,
  uploadFile
}
