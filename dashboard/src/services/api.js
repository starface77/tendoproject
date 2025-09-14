/**
 * 🔧 API СЕРВИС ДЛЯ АДМИН ПАНЕЛИ
 * Все запросы к бэкенду для управления товарами
 */

import axios from 'axios';

// Базовая конфигурация API (env-driven)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '/api/v1' : 'http://localhost:5000/api/v1');

// Создаем экземпляр axios для админки
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсептор для добавления токена
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерсептор для обработки ответов
adminApi.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Обработка различных типов ошибок
    if (error.response?.status === 401) {
      // Токен недействителен - очищаем токен и показываем сообщение
      console.log('⚠️ Токен истек или недействителен');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('adminToken');

      // Не перенаправляем автоматически, даем возможность повторного входа
      return Promise.reject({
        message: 'Сессия истекла. Пожалуйста, войдите снова.',
        status: 401,
        type: 'auth',
        expired: true
      });
    }

    if (error.response?.status === 403) {
      return Promise.reject({
        message: 'У вас нет прав для выполнения этого действия',
        status: 403,
        type: 'permission'
      });
    }

    if (error.response?.status === 404) {
      return Promise.reject({
        message: 'Запрашиваемый ресурс не найден',
        status: 404,
        type: 'not_found'
      });
    }

    if (error.response?.status === 422) {
      // Ошибки валидации
      const validationErrors = error.response.data?.errors;
      if (validationErrors) {
        return Promise.reject({
          message: 'Ошибка валидации данных',
          status: 422,
          type: 'validation',
          errors: validationErrors
        });
      }
    }

    if (error.response?.status >= 500) {
      return Promise.reject({
        message: 'Ошибка сервера. Попробуйте позже.',
        status: error.response.status,
        type: 'server'
      });
    }

    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return Promise.reject({
        message: 'Проблемы с подключением к серверу. Проверьте интернет-соединение.',
        status: 0,
        type: 'network'
      });
    }

    return Promise.reject({
      message: error.response?.data?.error || error.response?.data?.message || error.message || 'Произошла неизвестная ошибка',
      status: error.response?.status || 0,
      data: error.response?.data
    });
  }
);

// 📊 DASHBOARD API
export const dashboardApi = {
  // Получить статистику
  getStats: async () => {
    return adminApi.get('/admin/stats');
  },

  // Получить аналитику
  getAnalytics: async (period = '7d') => {
    return adminApi.get(`/admin/analytics?period=${period}`);
  },

  // Получить все настройки
  getSettings: async () => {
    return adminApi.get('/admin/settings/all');
  },

  // Получить настройки по категории
  getSettingsByCategory: async (category) => {
    return adminApi.get(`/admin/settings/category/${category}`);
  },

  // Обновить настройки
  updateSettings: async (settings) => {
    return adminApi.put('/admin/settings/bulk', { settings });
  },

  // Обновить одну настройку
  updateSetting: async (key, value) => {
    return adminApi.put(`/admin/settings/key/${key}`, { value });
  },

  // Создать настройку
  createSetting: async (settingData) => {
    return adminApi.post('/admin/settings/create', settingData);
  },

  // Удалить настройку
  deleteSetting: async (key) => {
    return adminApi.delete(`/admin/settings/key/${key}`);
  },

  // Сбросить настройки
  resetSettings: async (category = null) => {
    return adminApi.post('/admin/settings/reset', { category });
  },

  // Инициализировать настройки
  initializeSettings: async () => {
    return adminApi.post('/admin/settings/initialize');
  }
};

// 🛍️ PRODUCTS API
export const productsApi = {
  // Получить все товары
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return adminApi.get(`/admin/products${queryString ? '?' + queryString : ''}`);
  },

  // Получить товар по ID
  getById: async (id) => {
    return adminApi.get(`/admin/products/${id}`);
  },

  // Создать новый товар
  create: async (productData) => {
    return adminApi.post('/admin/products', productData);
  },

  // Обновить товар
  update: async (id, productData) => {
    return adminApi.put(`/admin/products/${id}`, productData);
  },

  // Удалить товар
  delete: async (id) => {
    return adminApi.delete(`/admin/products/${id}`);
  },

  // Изменить статус товара (активировать/деактивировать)
  toggleStatus: async (id, isActive) => {
    return adminApi.patch(`/admin/products/${id}/status`, { isActive });
  },

  // Массовые операции
  bulkDelete: async (ids) => {
    return adminApi.post('/admin/products/bulk-delete', { ids });
  },

  // Экспорт товаров
  export: async (format = 'csv') => {
    return adminApi.get(`/admin/products/export?format=${format}`, {
      responseType: 'blob'
    });
  }
};

// 📂 CATEGORIES API
export const categoriesApi = {
  // Получить все категории
  getAll: async () => {
    return adminApi.get('/admin/categories');
  },

  // Получить категорию по ID
  getById: async (id) => {
    return adminApi.get(`/admin/categories/${id}`);
  },

  // Создать новую категорию
  create: async (categoryData) => {
    return adminApi.post('/admin/categories', categoryData);
  },

  // Обновить категорию
  update: async (id, categoryData) => {
    return adminApi.put(`/admin/categories/${id}`, categoryData);
  },

  // Удалить категорию
  delete: async (id) => {
    return adminApi.delete(`/admin/categories/${id}`);
  }
};

// 📋 ORDERS API
export const ordersApi = {
  // Получить все заказы
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return adminApi.get(`/admin/orders${queryString ? '?' + queryString : ''}`);
  },

  // Получить заказ по ID
  getById: async (id) => {
    return adminApi.get(`/admin/orders/${id}`);
  },

  // Обновить статус заказа
  updateStatus: async (id, status) => {
    return adminApi.put(`/admin/orders/${id}/status`, { status });
  }
};

// 👥 USERS API
export const usersApi = {
  // Получить всех пользователей
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return adminApi.get(`/admin/users${queryString ? '?' + queryString : ''}`);
  },

  // Получить пользователя по ID
  getById: async (id) => {
    return adminApi.get(`/admin/users/${id}`);
  },

  // Заблокировать/разблокировать пользователя
  toggleStatus: async (id, isActive) => {
    return adminApi.put(`/admin/users/${id}`, { isActive });
  }
};

// 💬 REVIEWS API
export const reviewsApi = {
  // Получить все отзывы
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return adminApi.get(`/admin/reviews${queryString ? '?' + queryString : ''}`);
  },

  // Одобрить/отклонить отзыв
  updateStatus: async (id, status) => {
    return adminApi.put(`/admin/reviews/${id}/status`, { status });
  },

  // Удалить отзыв
  delete: async (id) => {
    return adminApi.delete(`/admin/reviews/${id}`);
  }
};

// BANNERS ADMIN API
export const bannersApi = {
  getAdminBanners: async () => adminApi.get('/banners/admin'),
  createBanner: async (data) => adminApi.post('/banners', data),
  updateBanner: async (id, data) => adminApi.put(`/banners/${id}`, data),
  deleteBanner: async (id) => adminApi.delete(`/banners/${id}`)
};

// 📤 UPLOAD API
export const uploadApi = {
  // Загрузить изображение
  uploadImage: async (file, type = 'product') => {
    const formData = new FormData();
    formData.append('file', file);

    return adminApi.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Удалить изображение
  deleteImage: async (imageUrl) => {
    return adminApi.delete('/upload/image', {
      data: { imageUrl }
    });
  }
};

// 🏪 SELLER APPLICATIONS API
export const sellerApplicationsApi = {
  // Получить все заявки
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return adminApi.get(`/admin/seller-applications${queryString ? '?' + queryString : ''}`);
  },

  // Получить заявку по ID
  getById: async (id) => {
    return adminApi.get(`/admin/seller-applications/${id}`);
  },

  // Одобрить заявку
  approve: async (id, data = {}) => {
    const response = await adminApi.put(`/admin/seller-applications/${id}/approve`, data);

    // Если в ответе есть новый токен, обновляем его через AuthContext
    if (response.data?.data?.token) {
      // Импортируем AuthContext для обновления токена
      try {
        // Обновляем токен в localStorage
        localStorage.setItem('admin_token', response.data.data.token);
        localStorage.setItem('adminToken', response.data.data.token);

        // Отправляем событие для обновления AuthContext
        window.dispatchEvent(new CustomEvent('tokenUpdated', {
          detail: { token: response.data.data.token }
        }));
      } catch (error) {
        // Обработка ошибки обновления токена
      }
    }

    return response;
  },

  // Отклонить заявку
  reject: async (id, data = {}) => {
    return adminApi.put(`/admin/seller-applications/${id}/reject`, data);
  },

  // Запросить дополнительные документы
  requestDocuments: async (id, data = {}) => {
    return adminApi.put(`/admin/seller-applications/${id}/request-documents`, data);
  },

  // Получить статистику заявок
  getStats: async () => {
    return adminApi.get('/admin/seller-applications/stats');
  }
};

// 🏬 SELLERS API
export const sellersApi = {
  // Получить всех продавцов
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return adminApi.get(`/admin/sellers${queryString ? '?' + queryString : ''}`);
  },

  // Получить продавца по ID
  getById: async (id) => {
    return adminApi.get(`/admin/sellers/${id}`);
  },

  // Заблокировать продавца
  suspend: async (id, data = {}) => {
    return adminApi.patch(`/admin/sellers/${id}/suspend`, data);
  },

  // Разблокировать продавца
  unsuspend: async (id) => {
    return adminApi.patch(`/admin/sellers/${id}/unsuspend`);
  },

  // Изменить комиссию
  updateCommission: async (id, commissionRate) => {
    return adminApi.patch(`/admin/sellers/${id}/commission`, { commissionRate });
  },

  // Получить аналитику продавца
  getAnalytics: async (id, period = '30days') => {
    return adminApi.get(`/admin/sellers/${id}/analytics?period=${period}`);
  }
};

// 🔐 AUTH API (для админ панели)
export const authApi = {
  // Логин админа (используем специальный админ логин)
  login: async (email, password) => {
    return adminApi.post('/auth/admin/login', { email, password });
  },

  // Получить текущего админа
  getMe: async () => {
    return adminApi.get('/auth/me');
  },

  // Выход из системы
  logout: async () => {
    return adminApi.post('/auth/logout');
  }
};

// 🏠 SECTIONS API
export const sectionsApi = {
  // Получить все секции для админки
  getAdminSections: async () => {
    return adminApi.get('/sections/admin');
  },

  // Получить публичные секции
  getSections: async () => {
    return adminApi.get('/sections');
  },

  // Создать новую секцию
  createSection: async (data) => {
    return adminApi.post('/sections', data);
  },

  // Обновить секцию
  updateSection: async (id, data) => {
    return adminApi.put(`/sections/${id}`, data);
  },

  // Удалить секцию
  deleteSection: async (id) => {
    return adminApi.delete(`/sections/${id}`);
  }
};

export default adminApi;
