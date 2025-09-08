import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  FiBarChart, FiPackage, FiShoppingCart, FiDollarSign, 
  FiSettings, FiUser, FiLogOut, FiHome
} from 'react-icons/fi';

const SellerLayout = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tendo-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow all authenticated users to access seller dashboard for testing
  const isSeller = true;

  if (!isSeller) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('seller.access_restricted')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('seller.sellers_only')}
          </p>
          <Link
            to="/seller-application"
            className="bg-tendo-primary text-white px-6 py-3 rounded-lg hover:bg-tendo-blue"
          >
            {t('seller.become_seller')}
          </Link>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { 
      path: '/seller', 
      name: t('seller.overview'), 
      icon: FiBarChart,
      exact: true,
      color: 'text-purple-600'
    },
    { 
      path: '/seller/products', 
      name: t('seller.products'), 
      icon: FiPackage,
      color: 'text-blue-600'
    },
    { 
      path: '/seller/orders', 
      name: t('seller.orders'), 
      icon: FiShoppingCart,
      color: 'text-green-600'
    },
    { 
      path: '/seller/finance', 
      name: t('seller.finance'), 
      icon: FiDollarSign,
      color: 'text-yellow-600'
    },
    { 
      path: '/seller/settings', 
      name: t('seller.settings'), 
      icon: FiSettings,
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col py-6 overflow-y-auto">
            {/* Simple Header */}
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <FiUser className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Продавец
                </h1>
                <p className="text-sm text-gray-500">{user?.firstName || user?.name || 'Панель'}</p>
              </div>
            </div>

            {/* Simple Navigation */}
            <nav className="flex-1 px-4 space-y-1">
              {sidebarItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = item.exact 
                  ? location.pathname === item.path 
                  : location.pathname.startsWith(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Simple Back Link */}
            <div className="px-4 mt-auto pt-4 border-t border-gray-200">
              <Link
                to="/"
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <FiHome className="mr-3 h-5 w-5 text-gray-400" />
                На сайт
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">
            Продавец
            </h1>
            <Link 
              to="/"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiHome className="h-5 w-5" />
            </Link>
          </div>
    </div>

        {/* Content */}
        <main className="flex-1 pb-24 md:pb-8">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <div className="flex justify-around py-2">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = item.exact 
                ? location.pathname === item.path 
                : location.pathname.startsWith(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center py-2 px-2 min-w-0 transition-colors ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-500'
                  }`}
                >
                  <IconComponent className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium truncate w-full text-center">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerLayout;