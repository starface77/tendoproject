import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from './api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || localStorage.getItem('adminToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Инициализация токена и загрузка пользователя при загрузке страницы
  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
    console.log('🔑 Инициализация токена из localStorage:', storedToken ? 'ЕСТЬ' : 'НЕТ');

    if (storedToken && !token) {
      setToken(storedToken);
      console.log('✅ Токен восстановлен из localStorage');
    }
  }, []);

  // Проверка токена и загрузка пользователя
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        console.log('🔍 Проверяем токен:', token.substring(0, 20) + '...');
        try {
          const userData = await authApi.getMe();
          if (userData.success) {
            setUser(userData.data || userData.user);
            console.log('✅ Пользователь загружен:', (userData.data || userData.user).email);
            console.log('👤 Роль пользователя:', (userData.data || userData.user).role);
          } else {
            console.log('⚠️ Ошибка загрузки пользователя:', userData);
            // Очищаем токен только если это ошибка авторизации
            if (userData.code === 'USER_NOT_FOUND' || userData.code === 'ACCOUNT_INACTIVE') {
              logout();
            }
          }
        } catch (error) {
          console.error('❌ Ошибка проверки токена:', error);
          // Очищаем токен только при истечении срока действия или недействительном токене
          if (error.expired || error.code === 'TOKEN_EXPIRED' || error.code === 'INVALID_TOKEN') {
            console.log('🕒 Токен истек, очищаем сессию');
            logout();
          }
          // При сетевых ошибках НЕ выходим автоматически
        }
      }
    };

    checkAuth();
  }, [token]);

  // Слушаем событие обновления токена
  useEffect(() => {
    const handleTokenUpdate = (event) => {
      console.log('🎯 Получено событие обновления токена');
      const newToken = event.detail.token;
      updateToken(newToken);
    };

    window.addEventListener('tokenUpdated', handleTokenUpdate);

    return () => {
      window.removeEventListener('tokenUpdated', handleTokenUpdate);
    };
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authApi.login(email, password);

      if (response.success) {
        const { token: newToken, user: userData } = response;
        
        // Проверяем что пользователь имеет админские права
        if (!userData.role || !['admin', 'super_admin', 'moderator'].includes(userData.role)) {
          return { success: false, error: 'Доступ запрещен: недостаточно прав администратора' };
        }
        
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('admin_token', newToken);
        localStorage.setItem('adminToken', newToken); // Для совместимости
        
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Ошибка сервера';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('adminToken');
    }
  };

  const updateToken = (newToken) => {
    console.log('🔄 Обновление токена');
    setToken(newToken);
    localStorage.setItem('admin_token', newToken);
    localStorage.setItem('adminToken', newToken); // Для совместимости

    // Перезагружаем информацию о пользователе
    if (newToken) {
      authApi.getMe().then(userData => {
        if (userData.success) {
          setUser(userData.data || userData.user);
          console.log('✅ Информация о пользователе обновлена:', (userData.data || userData.user).role);
        }
      }).catch(error => {
        console.error('❌ Ошибка обновления информации о пользователе:', error);
      });
    }
  };

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    updateToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

