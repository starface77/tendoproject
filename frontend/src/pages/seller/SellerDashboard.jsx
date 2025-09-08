import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { 
  FiDollarSign, FiShoppingCart, FiPackage, FiPlus, FiList, FiBarChart 
} from 'react-icons/fi';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load real data from backend
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Загружаем статистику продавца
      const response = await api.seller.getDashboard();
      
      if (response.success) {
        const stats = response.data?.stats;

        if (stats) {
          setMetrics({
            totalRevenue: stats.estimatedRevenue || 0,
            totalOrders: stats.purchasesTotal || 0,
            activeProducts: stats.activeProducts || 0,
            pendingOrders: stats.lowStock || 0
          });
        } else {
          setMetrics({
            totalRevenue: 0,
            totalOrders: 0,
            activeProducts: 0,
            pendingOrders: 0
          });
        }
      } else {
        console.log('❌ API вернул success: false');
        setError('API вернул ошибку');
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      if (error.response?.status === 401) {
        setError('Необходимо авторизоваться');
      } else if (error.response?.status === 403) {
        setError('Нет прав доступа к панели продавца');
      } else {
        setError(error.response?.data?.error || 'Не удалось загрузить данные');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount || 0) + ' сум';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tendo-primary"></div>
        <span className="ml-3 text-gray-600">Загрузка данных...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-600 font-medium mb-2">Ошибка загрузки</div>
        <div className="text-red-500 text-sm mb-4">{error}</div>
        <button 
          onClick={loadDashboardData}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simple Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Панель продавца
        </h1>
        <p className="text-gray-600">
          Добро пожаловать, {user?.firstName || user?.name || 'Продавец'}!
        </p>
      </div>

      {/* Simple Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <FiDollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-sm text-gray-600">Общая выручка</div>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(metrics.totalRevenue)}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <FiShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-sm text-gray-600">Заказы</div>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {metrics.totalOrders || 0}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <FiPackage className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-sm text-gray-600">Товары</div>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {metrics.activeProducts || 0}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <FiList className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-sm text-gray-600">Ожидающие</div>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {metrics.pendingOrders || 0}
          </div>
        </div>
      </div>

      {/* Simple Quick Actions */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/seller/products"
            className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mr-3">
              <FiPackage className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Товары</div>
              <div className="text-sm text-gray-600">Управление товарами</div>
            </div>
          </Link>

          <Link
            to="/seller/products/add"
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
          >
            <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center mr-3">
              <FiPlus className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Добавить товар</div>
              <div className="text-sm text-gray-600">Создать новый товар</div>
            </div>
          </Link>
          
          <Link
            to="/seller/orders"
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
          >
            <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center mr-3">
              <FiShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Заказы</div>
              <div className="text-sm text-gray-600">Обработка заказов</div>
            </div>
          </Link>
          
          <Link
            to="/seller/finance"
            className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
          >
            <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center mr-3">
              <FiBarChart className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Аналитика</div>
              <div className="text-sm text-gray-600">Финансы и отчеты</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;