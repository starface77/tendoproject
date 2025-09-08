/**
 * 🔧 API УТИЛИТЫ
 * Вспомогательные функции для работы с API
 */

// Обработка ошибок API
export const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);

  // Если передали кастомное сообщение, используем его
  if (customMessage) {
    return {
      success: false,
      message: customMessage,
      error: error
    };
  }

  // Обработка различных типов ошибок
  switch (error.type) {
    case 'auth':
      return {
        success: false,
        message: 'Требуется авторизация. Пожалуйста, войдите в систему.',
        type: 'auth',
        action: 'redirect_to_login'
      };

    case 'permission':
      return {
        success: false,
        message: 'Недостаточно прав для выполнения этого действия.',
        type: 'permission'
      };

    case 'validation':
      return {
        success: false,
        message: 'Проверьте правильность введенных данных.',
        type: 'validation',
        errors: error.errors
      };

    case 'network':
      return {
        success: false,
        message: 'Проблемы с подключением. Проверьте интернет-соединение.',
        type: 'network',
        action: 'retry'
      };

    case 'server':
      return {
        success: false,
        message: 'Сервер временно недоступен. Попробуйте позже.',
        type: 'server',
        action: 'retry'
      };

    case 'not_found':
      return {
        success: false,
        message: 'Запрашиваемый ресурс не найден.',
        type: 'not_found'
      };

    default:
      return {
        success: false,
        message: error.message || 'Произошла неизвестная ошибка',
        type: 'unknown'
      };
  }
};

// Форматирование данных для отправки
export const formatApiData = (data, fields = null) => {
  const formattedData = { ...data };

  // Если указаны поля для форматирования
  if (fields) {
    fields.forEach(field => {
      if (formattedData[field]) {
        // Удаление лишних пробелов
        if (typeof formattedData[field] === 'string') {
          formattedData[field] = formattedData[field].trim();
        }
      }
    });
  }

  return formattedData;
};

// Проверка валидности данных перед отправкой
export const validateApiData = (data, requiredFields = []) => {
  const errors = [];

  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`Поле "${field}" обязательно для заполнения`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Создание параметров запроса
export const createQueryParams = (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(key, item));
      } else {
        queryParams.append(key, value);
      }
    }
  });

  return queryParams.toString();
};

// Форматирование ответа API
export const formatApiResponse = (response, defaultValue = null) => {
  try {
    // Если ответ уже отформатирован
    if (response && typeof response === 'object') {
      return {
        success: true,
        data: response.data || response,
        message: response.message || 'Успешно'
      };
    }

    return {
      success: true,
      data: response || defaultValue,
      message: 'Успешно'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Ошибка обработки ответа сервера',
      error: error
    };
  }
};

// Создание заголовков для запросов
export const createApiHeaders = (additionalHeaders = {}) => {
  const token = localStorage.getItem('admin_token');

  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...additionalHeaders
  };
};

// Дебаг функция для логирования API запросов
export const logApiRequest = (method, url, data = null, response = null, error = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚀 API ${method.toUpperCase()}: ${url}`);
    if (data) {
      console.log('📤 Request Data:', data);
    }
    if (response) {
      console.log('📥 Response:', response);
    }
    if (error) {
      console.error('❌ Error:', error);
    }
    console.groupEnd();
  }
};

// Функция повторной попытки запроса
export const retryApiRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      // Ждем перед следующей попыткой
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
};

export default {
  handleApiError,
  formatApiData,
  validateApiData,
  createQueryParams,
  formatApiResponse,
  createApiHeaders,
  logApiRequest,
  retryApiRequest
};
