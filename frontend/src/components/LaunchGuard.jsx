import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const LaunchGuard = ({ children }) => {
  const [canAccess, setCanAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLaunchStatus = async () => {
      try {
        const response = await axios.get('/api/v1/launch/status');

        if (response.data.success) {
          const { isLaunched, preLaunchEnabled } = response.data.data;

          // Если проект запущен ИЛИ pre-launch отключен, разрешаем доступ
          setCanAccess(isLaunched || !preLaunchEnabled);
        } else {
          // Если ошибка, по умолчанию блокируем доступ
          setCanAccess(false);
        }
      } catch (error) {
        console.error('Ошибка проверки статуса запуска:', error);
        // При ошибке блокируем доступ
        setCanAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkLaunchStatus();

    // Проверяем каждые 30 секунд
    const interval = setInterval(checkLaunchStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  // Пока загружаемся, показываем загрузку
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Если доступ запрещен, перенаправляем на pre-launch
  if (!canAccess) {
    return <Navigate to="/pre-launch" replace />;
  }

  // Если доступ разрешен, показываем дочерние компоненты
  return children;
};

export default LaunchGuard;