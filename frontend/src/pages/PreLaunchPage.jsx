import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PreLaunchPage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [launchData, setLaunchData] = useState(null);

  useEffect(() => {
    const loadLaunchData = async () => {
      try {
        const response = await axios.get('/api/v1/launch/status');
        if (response.data.success) {
          const data = response.data.data;
          setLaunchData(data);

          // Если проект уже запущен, редиректим на главную
          if (data.isLaunched) {
            navigate('/main', { replace: true });
            return;
          }

          // Если pre-launch отключен, тоже редиректим
          if (!data.preLaunchEnabled) {
            navigate('/main', { replace: true });
            return;
          }

          // Запускаем таймер
          startTimer(new Date(data.launchDate));
        }
      } catch (error) {
        console.error('Ошибка загрузки данных запуска:', error);
        // При ошибке используем запасную дату
        startTimer(new Date('2025-09-15T00:00:00Z'));
      }
    };

    const startTimer = (launchDate) => {
      const updateTimer = () => {
        const now = new Date().getTime();
        const distance = launchDate.getTime() - now;

        if (distance <= 0) {
          // Время вышло - редирект на /main
          navigate('/main', { replace: true });
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      };

      // Первоначальное обновление
      updateTimer();

      // Обновление каждую секунду
      const interval = setInterval(updateTimer, 1000);

      // Сохраняем интервал для очистки
      return () => clearInterval(interval);
    };

    loadLaunchData();
    setIsLoading(false);

    // Периодически проверяем статус запуска (каждую минуту)
    const statusInterval = setInterval(loadLaunchData, 60000);

    return () => {
      clearInterval(statusInterval);
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-900 text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Логотип/Иконка */}
        <div className="mb-8">
          <div className="text-6xl mb-4">🚀</div>
        </div>

        {/* Заголовок */}
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-12">
          Запуск проекта через:
        </h1>

        {/* Таймер */}
        <div className="flex justify-center gap-6 md:gap-12 mb-12">
          {/* Дни */}
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              {timeLeft.days}
            </div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">
              дней
            </div>
          </div>

          {/* Часы */}
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              {timeLeft.hours}
            </div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">
              часов
            </div>
          </div>

          {/* Минуты */}
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              {timeLeft.minutes}
            </div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">
              минут
            </div>
          </div>

          {/* Секунды */}
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              {timeLeft.seconds}
            </div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">
              секунд
            </div>
          </div>
        </div>

        {/* Сообщение */}
        <div className="max-w-lg mx-auto">
          <p className="text-lg text-gray-700 leading-relaxed">
            Мы готовим что-то невероятное для вас. Следите за обновлениями!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreLaunchPage;