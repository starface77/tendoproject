/**
 * 🏪 SELLER DASHBOARD
 * Полноценная панель продавца как в Uzum Market, OZON
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiPackage, FiShoppingCart, FiBarChart3, FiDollarSign,
  FiUsers, FiStar, FiTrendingUp, FiPlus,
  FiEdit3, FiTrash2, FiEye, FiAlertCircle, FiCheck
} from 'react-icons/fi';
// import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const SellerDashboard = () => {
  // const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    viewsTotal: 0,
    purchasesTotal: 0,
    estimatedRevenue: 0
  });
  
  const [recentOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Разрешаем доступ продавцу, админу и суперадмину
    if (!['seller', 'admin', 'super_admin'].includes(user.role)) {
      navigate('/');
      return;
    }
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Загрузка статистики продавца
      const token = localStorage.getItem('token');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [dashRes, productsRes] = await Promise.all([
        fetch('/api/v1/sellers/me/dashboard', { headers }),
        fetch('/api/v1/sellers/me/products?limit=6', { headers })
      ]);

      if (dashRes.ok) {
        const data = await dashRes.json();
        if (data.success) setStats(data.data?.stats || stats);
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        if (data.success) setProducts(data.data || []);
      }

    } catch (error) {
      console.error('Dashboard loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' сум';
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'badge--warning';
      case 'confirmed': return 'badge--info';
      case 'shipped': return 'badge--info';
      case 'delivered': return 'badge--success';
      case 'cancelled': return 'badge--error';
      default: return 'badge--neutral';
    }
  };

  const getOrderStatusText = (status) => {
    const statusMap = {
      pending: 'Ожидает',
      confirmed: 'Подтвержден',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменен'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          <div className="text-center py-12">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-500">Загрузка панели продавца...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Панель продавца
              </h1>
              <p className="text-gray-600">
                Добро пожаловать, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <Link 
              to="/seller/products/new" 
              className="btn btn--primary"
            >
              <FiPlus className="h-4 w-4" />
              Добавить товар
            </Link>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="marketplace-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Всего товаров</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
                <p className="text-xs text-gray-400">+12 за месяц</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiPackage className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="marketplace-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Заказы</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.purchasesTotal}</p>
                <p className="text-xs text-success-600">↗ +8% за неделю</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiShoppingCart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="marketplace-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Доход</p>
                <p className="text-2xl font-semibold text-gray-900">{formatPrice(stats.estimatedRevenue)}</p>
                <p className="text-xs text-success-600">↗ +15% за месяц</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiDollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="marketplace-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Рейтинг</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeProducts}</p>
                <div className="flex items-center text-xs text-gray-400">
                  <FiStar className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                  Средняя оценка
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiStar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="marketplace-card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Последние заказы
                </h3>
                <Link 
                  to="/seller/orders" 
                  className="btn btn--outline btn--small"
                >
                  Все заказы
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">
                            Заказ #{order.orderNumber}
                          </p>
                          <span className={`badge ${getOrderStatusColor(order.status)}`}>
                            {getOrderStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {order.customer?.firstName} {order.customer?.lastName}
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formatPrice(order.pricing?.total || 0)}
                        </p>
                      </div>
                      <Link 
                        to={`/seller/orders/${order.id}`}
                        className="btn btn--outline btn--small"
                      >
                        <FiEye className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Пока нет заказов</p>
                </div>
              )}
            </div>
          </div>

          {/* Products Management */}
          <div className="marketplace-card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Мои товары
                </h3>
                <Link 
                  to="/seller/products" 
                  className="btn btn--outline btn--small"
                >
                  Все товары
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {products.length > 0 ? (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : '📦'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatPrice(product.price)}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`badge ${product.isActive ? 'badge--success' : 'badge--neutral'}`}>
                            {product.isActive ? 'Активен' : 'Неактивен'}
                          </span>
                          <span className="text-xs text-gray-400">
                            Остаток: {product.stock || 0}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link 
                          to={`/seller/products/${product.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <FiEdit3 className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiPackage className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Товары не добавлены</p>
                  <Link 
                    to="/seller/products/new"
                    className="btn btn--primary"
                  >
                    <FiPlus className="h-4 w-4" />
                    Добавить первый товар
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Link 
            to="/seller/products/new" 
            className="marketplace-card p-6 text-center hover:border-blue-300 transition-colors"
          >
            <FiPlus className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Добавить товар</h3>
            <p className="text-sm text-gray-500">Создать новый товар</p>
          </Link>

          <Link 
            to="/seller/orders" 
            className="marketplace-card p-6 text-center hover:border-green-300 transition-colors"
          >
            <FiShoppingCart className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Заказы</h3>
            <p className="text-sm text-gray-500">Управление заказами</p>
          </Link>

          <Link 
            to="/seller/analytics" 
            className="marketplace-card p-6 text-center hover:border-purple-300 transition-colors"
          >
            <FiBarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Аналитика</h3>
            <p className="text-sm text-gray-500">Статистика продаж</p>
          </Link>

          <Link 
            to="/seller/settings" 
            className="marketplace-card p-6 text-center hover:border-orange-300 transition-colors"
          >
            <FiUsers className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Настройки</h3>
            <p className="text-sm text-gray-500">Профиль магазина</p>
          </Link>
        </div>

        {/* Performance Insights */}
        <div className="marketplace-card mt-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              📈 Статистика продаж
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <FiTrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Конверсия</p>
                <p className="text-xl font-semibold text-gray-900">2.4%</p>
                <p className="text-xs text-success-600">↗ +0.3%</p>
              </div>
              
              <div className="text-center">
                <FiUsers className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Просмотры</p>
                <p className="text-xl font-semibold text-gray-900">1,247</p>
                <p className="text-xs text-success-600">↗ +156</p>
              </div>
              
              <div className="text-center">
                <FiStar className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Отзывы</p>
                <p className="text-xl font-semibold text-gray-900">4.8</p>
                <p className="text-xs text-gray-400">87 оценок</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips for Sellers */}
        <div className="marketplace-card mt-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              💡 Советы для увеличения продаж
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FiCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Добавьте качественные фотографии</p>
                  <p className="text-sm text-gray-600">Товары с хорошими фото продаются в 3 раза чаще</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FiCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Заполните подробное описание</p>
                  <p className="text-sm text-gray-600">Покупатели хотят знать все характеристики товара</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FiAlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Отвечайте на вопросы быстро</p>
                  <p className="text-sm text-gray-600">Быстрый ответ увеличивает шансы на покупку</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const handleDeleteProduct = (productId) => {
  // TODO: Implement product deletion
  console.log('Delete product:', productId);
};

export default SellerDashboard;

