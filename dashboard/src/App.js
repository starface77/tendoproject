import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, App as AntdApp, theme } from 'antd';
import ruRU from 'antd/lib/locale/ru_RU';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';

// Pages
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Users from './pages/Users';
import SellerApplications from './pages/SellerApplications';
import Sellers from './pages/Sellers';
import Reviews from './pages/Reviews';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Banners from './pages/Banners';
import Sections from './pages/Sections';

// Services
import { AuthProvider, useAuth } from './services/AuthContext';
import { I18nProvider } from './i18n';

// Styles
import './styles/App.css';

const { Content } = Layout;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token, user, loading } = useAuth();
  
  console.log('🔐 ProtectedRoute check:', { 
    hasToken: !!token, 
    hasUser: !!user, 
    loading,
    tokenValue: token ? token.substring(0, 20) + '...' : 'НЕТ'
  });

  if (loading) {
    console.log('⏳ Загрузка...');
    return <div>Загрузка...</div>;
  }

  if (!token) {
    console.log('❌ Нет токена, перенаправляем на логин');
    return <Navigate to="/login" />;
  }

  if (!user) {
    console.log('⚠️ Есть токен, но нет пользователя');
    return <div>Загрузка пользователя...</div>;
  }

  console.log('✅ Доступ разрешен');
  return children;
};

// Main App Layout
const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} />
      <Layout 
        style={{ 
          marginLeft: collapsed ? 80 : 280,
          transition: 'margin-left 0.3s',
          background: '#f8fafc'
        }}
      >
        <Header 
          collapsed={collapsed} 
          onCollapse={() => setCollapsed(!collapsed)} 
        />
        <Content style={{ 
          margin: '16px', 
          padding: '16px',
          background: '#fff',
          minHeight: 'calc(100vh - 140px)',
          border: '1px solid #e2e8f0'
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/users" element={<Users />} />
            <Route path="/seller-applications" element={<SellerApplications />} />
            <Route path="/sellers" element={<Sellers />} />
            <Route path="/sellers/list" element={<Sellers />} />
            <Route path="/sellers/finance" element={<div>Финансы продавцов</div>} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/banners" element={<Banners />} />
            <Route path="/sections" element={<Sections />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/messages" element={<div>Сообщения</div>} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

// Main App Component
function App() {
  return (
    <ConfigProvider 
      locale={ruRU}
      theme={{
        token: {
          colorPrimary: '#3b82f6',
          colorInfo: '#3b82f6',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          borderRadius: 8,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          Menu: {
            itemBg: 'transparent',
            itemHoverBg: 'rgba(59, 130, 246, 0.1)',
            itemSelectedBg: 'rgba(59, 130, 246, 0.2)',
            itemSelectedColor: '#3b82f6',
            itemHoverColor: '#3b82f6',
            fontSize: 15,
          },
          Card: {
            borderRadiusLG: 8,
            colorBorderSecondary: '#e2e8f0',
          },
          Button: {
            borderRadius: 6,
          },
          Layout: {
            siderBg: '#1A202C',
          }
        },
      }}
    >
      <AntdApp>
        <I18nProvider>
          <AuthProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  } />
                </Routes>
              </div>
            </Router>
          </AuthProvider>
        </I18nProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;