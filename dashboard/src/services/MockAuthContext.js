import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Имитация проверки токена при загрузке
  useEffect(() => {
    if (token) {
      // Имитируем существующего админа
      setUser({
        id: '1',
        firstName: 'Test',
        lastName: 'Admin', 
        email: 'admin@chexol.uz',
        role: 'admin'
      });
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Проверяем тестовые данные
      if (email === 'admin@chexol.uz' && password === 'admin123456') {
        const mockToken = 'mock-admin-token-' + Date.now();
        const mockUser = {
          id: '1',
          firstName: 'Test',
          lastName: 'Admin',
          email: 'admin@chexol.uz',
          role: 'admin',
          permissions: ['all']
        };
        
        setToken(mockToken);
        setUser(mockUser);
        localStorage.setItem('admin_token', mockToken);
        
        return { success: true };
      } else {
        return { success: false, error: 'Неверные учетные данные' };
      }
    } catch (error) {
      console.error('Mock Login error:', error);
      return { success: false, error: 'Ошибка сервера' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('admin_token');
  };

  const value = {
    token,
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
