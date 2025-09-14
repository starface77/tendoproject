import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  TagsOutlined,
  UserOutlined,
  StarOutlined,
  BarChartOutlined,
  SettingOutlined,
  ShopOutlined,
  FileTextOutlined,
  MessageOutlined,
  NotificationOutlined,
  TeamOutlined,
  WalletOutlined,
  HomeOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

function Sidebar({ collapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Дашборд',
    },
    {
      key: '/orders',
      icon: <ShoppingCartOutlined />,
      label: 'Заказы',
    },
    {
      key: '/products',
      icon: <AppstoreOutlined />,
      label: 'Товары',
    },
    {
      key: '/categories',
      icon: <TagsOutlined />,
      label: 'Категории',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Пользователи',
    },
    {
      key: '/sellers',
      icon: <ShopOutlined />,
      label: 'Продавцы',
      children: [
        {
          key: '/sellers/list',
          icon: <TeamOutlined />,
          label: 'Список продавцов',
        },
        {
          key: '/seller-applications',
          icon: <FileTextOutlined />,
          label: 'Заявки продавцов',
        },
        {
          key: '/sellers/finance',
          icon: <WalletOutlined />,
          label: 'Финансы',
        }
      ]
    },
    {
      key: '/reviews',
      icon: <StarOutlined />,
      label: 'Отзывы',
    },
    {
      key: '/banners',
      icon: <NotificationOutlined />,
      label: 'Баннеры',
    },
    {
      key: '/sections',
      icon: <HomeOutlined />,
      label: 'Секции главной',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'Аналитика',
    },
    {
      key: '/messages',
      icon: <MessageOutlined />,
      label: 'Сообщения',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      collapsedWidth={80}
      width={280}
      style={{
        background: '#1A202C',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        borderRight: '1px solid #2D3748'
      }}
      className="sidebar"
    >
      <div
        style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 16px',
          borderBottom: '1px solid #2D3748',
          marginBottom: '8px'
        }}
      >
        <HomeOutlined 
          style={{ 
            fontSize: '20px', 
            color: '#3b82f6',
            marginRight: collapsed ? 0 : '12px'
          }} 
        />
        {!collapsed && (
          <div>
            <div 
              style={{ 
                color: '#3b82f6', 
                fontSize: '16px', 
                fontWeight: '600'
              }}
            >
              Tendo Market
            </div>
            <div 
              style={{ 
                color: '#9CA3AF', 
                fontSize: '11px'
              }}
            >
              Админ панель
            </div>
          </div>
        )}
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={handleMenuClick}
        items={menuItems}
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: '14px'
        }}
        className="sidebar-menu"
      />
      
      {!collapsed && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '6px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          <div style={{ color: '#9CA3AF', fontSize: '11px' }}>
            Версия 1.0.0
          </div>
          <div style={{ color: '#3b82f6', fontSize: '10px', marginTop: '4px' }}>
            © 2025 Tendo Market
          </div>
        </div>
      )}
    </Sider>
  );
}

export default Sidebar;