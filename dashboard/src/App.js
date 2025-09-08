import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, App as AntdApp } from 'antd';
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
      <Layout>
        <Header 
          collapsed={collapsed} 
          onCollapse={() => setCollapsed(!collapsed)} 
        />
        <Content style={{ 
          margin: '16px', 
          padding: '24px',
          background: '#fff',
          borderRadius: '8px'
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
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/banners" element={<Banners />} />
            <Route path="/analytics" element={<Analytics />} />
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
          colorPrimary: '#F2D024',
          borderRadius: 8,
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






