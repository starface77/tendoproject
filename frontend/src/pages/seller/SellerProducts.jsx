import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  FiPlus, FiEdit3, FiTrash2, FiEye, FiSearch, 
  FiFilter, FiPackage, FiDollarSign, FiTrendingUp,
  FiToggleLeft, FiToggleRight
} from 'react-icons/fi';

const SellerProducts = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Load real products from backend
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.seller.getProducts();

      if (response.success) {
        setProducts(response.data || response.products || []);
      }
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      const response = await api.seller.deleteProduct(productId);
      
      if (response.success) {
        setProducts(products.filter(p => p._id !== productId));
        alert('Товар успешно удален');
      } else {
        alert('Ошибка при удалении товара');
      }
    } catch (error) {
      alert('Ошибка при удалении товара');
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await api.seller.updateProduct(productId, { status: newStatus });
      
      if (response.success) {
        setProducts(products.map(p => 
          p._id === productId ? { ...p, status: newStatus } : p
        ));
        alert(`Товар ${newStatus === 'active' ? 'активирован' : 'деактивирован'}`);
      } else {
        alert('Ошибка при изменении статуса товара');
      }
    } catch (error) {
      alert('Ошибка при изменении статуса товара');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' сум';
  };

  const filteredProducts = products.filter(product => {
    const productName = typeof product.name === 'object' ? product.name?.name || '' : product.name || '';
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || product.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tendo-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('seller.products')}
          </h1>
          <p className="text-gray-600 mt-2">Управление вашими товарами</p>
        </div>
        <Link
          to="/seller/products/add"
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow hover:shadow-lg transition-all duration-200"
        >
          <FiPlus className="h-5 w-5 mr-2" />
          Добавить товар
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiPackage className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
          <div className="text-sm text-gray-600">Всего товаров</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.active}</div>
          <div className="text-sm text-gray-600">Активных</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <FiPackage className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.outOfStock}</div>
          <div className="text-sm text-gray-600">Нет в наличии</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FiDollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 mb-1">{formatCurrency(stats.totalValue)}</div>
          <div className="text-sm text-gray-600">Общая стоимость</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-tendo-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-tendo-primary focus:border-transparent"
            >
              <option value="all">Все товары</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPackage className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">Товары не найдены</p>
            <p className="text-gray-400 text-sm mt-2">Попробуйте изменить поисковый запрос или фильтры</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Товар</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Категория</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Цена</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Остаток</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Статистика</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Статус</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-6 px-6">
                      <div className="flex items-center">
                        <img
                          src={product.image}
                          alt={typeof product.name === 'object' ? product.name?.name || 'Товар' : product.name || 'Товар'}
                          className="w-16 h-16 rounded-xl object-cover mr-4"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {typeof product.name === 'object' ? product.name?.name || 'Без названия' : product.name || 'Без названия'}
                          </div>
                          <div className="text-sm text-gray-500">ID: {product.id || product._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                        {typeof product.category === 'object' ? product.category?.name || 'Без категории' : product.category || 'Без категории'}
                      </span>
                    </td>
                    <td className="py-6 px-6">
                      <div className="font-semibold text-gray-900">{formatCurrency(product.price)}</div>
                    </td>
                    <td className="py-6 px-6">
                      <div className={`font-semibold ${product.stock === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.stock} шт
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center mb-1">
                          <FiEye className="h-4 w-4 mr-1" />
                          {product.views} просмотров
                        </div>
                        <div className="flex items-center">
                          <FiPackage className="h-4 w-4 mr-1" />
                          {product.orders} заказов
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <button 
                        onClick={() => handleToggleStatus(product._id || product.id, product.status)}
                        className="flex items-center"
                        title={product.status === 'active' ? 'Деактивировать' : 'Активировать'}
                      >
                        {product.status === 'active' ? (
                          <FiToggleRight className="h-6 w-6 text-green-500" />
                        ) : (
                          <FiToggleLeft className="h-6 w-6 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/product/${product._id || product.id}`}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Просмотреть товар"
                        >
                          <FiEye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/seller/products/edit/${product._id || product.id}`}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Редактировать товар"
                        >
                          <FiEdit3 className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteProduct(product._id || product.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Удалить товар"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProducts;











