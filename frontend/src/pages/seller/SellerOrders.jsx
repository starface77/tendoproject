import React, { useState, useEffect } from 'react';
import { FiPackage, FiEye, FiCalendar, FiClock, FiDollarSign, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { useLanguage } from '../../contexts/LanguageContext';
// import { formatDate } from '../../utils/dateUtils';
import api from '../../services/api';

const formatDate = (dateString) => {
  if (!dateString) return 'Не указано';
  try {
    return new Date(dateString).toLocaleDateString('ru-RU');
  } catch (error) {
    return 'Некорректная дата';
  }
};

const SellerOrders = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Load real orders data from backend
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.seller.getOrders();
      
      if (response.success) {
        setOrders(response.data || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'processing': return 'Обрабатывается';
      case 'shipped': return 'Отправлен';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price || 0) + ' сум';
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Заказы</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 border">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('seller.orders.title', 'Заказы')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('seller.orders.subtitle', 'Управляйте заказами ваших товаров')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadOrders}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className="h-4 w-4 mr-2" />
            {t('refresh', 'Обновить')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-3">
          <FiFilter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {t('filter', 'Фильтр')}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Все' },
            { key: 'pending', label: 'Ожидают' },
            { key: 'processing', label: 'Обрабатываются' },
            { key: 'shipped', label: 'Отправлены' },
            { key: 'delivered', label: 'Доставлены' },
            { key: 'cancelled', label: 'Отменены' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <FiPackage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('seller.orders.empty', 'Нет заказов')}
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? t('seller.orders.empty_desc', 'У вас пока нет заказов') 
              : `Нет заказов со статусом "${getStatusText(filter)}"`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">
                        Заказ #{order._id?.slice(-8)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="h-4 w-4" />
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiDollarSign className="h-4 w-4" />
                        {formatPrice(order.totalAmount)}
                      </div>
                    </div>
                  </div>
                  
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <FiEye className="h-4 w-4 mr-2" />
                    {t('view', 'Просмотр')}
                  </button>
                </div>

                {/* Customer Info */}
                {order.user && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {t('customer', 'Покупатель')}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {order.user.firstName} {order.user.lastName}
                    </p>
                    {order.user.email && (
                      <p className="text-sm text-gray-600">{order.user.email}</p>
                    )}
                  </div>
                )}

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      {t('items', 'Товары')} ({order.items.length})
                    </h4>
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0">
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-full h-full object-cover rounded"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-gray-500 text-center py-2">
                          +{order.items.length - 3} еще товаров
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;







