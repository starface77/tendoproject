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
  CrownOutlined,
  ShopOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

function Sidebar({ collapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: React.createElement(DashboardOutlined),
      label: 'Дашборд',
    },
    {
      key: '/orders',
      icon: React.createElement(ShoppingCartOutlined),
      label: 'Заказы',
    },
    {
      key: '/products',
      icon: React.createElement(AppstoreOutlined),
      label: 'Товары',
    },
    {
      key: '/categories',
      icon: React.createElement(TagsOutlined),
      label: 'Категории',
    },
    {
      key: '/users',
      icon: React.createElement(UserOutlined),
      label: 'Пользователи',
    },
    {
      key: '/seller-applications',
      icon: React.createElement(FileTextOutlined),
      label: 'Заявки продавцов',
    },
    {
      key: '/sellers',
      icon: React.createElement(ShopOutlined),
      label: 'Продавцы',
    },
    {
      key: '/reviews',
      icon: React.createElement(StarOutlined),
      label: 'Отзывы',
    },
    {
      key: '/banners',
      icon: React.createElement(TagsOutlined),
      label: 'Баннеры',
    },
    {
      key: '/analytics',
      icon: React.createElement(BarChartOutlined),
      label: 'Аналитика',
    },
    {
      key: '/settings',
      icon: React.createElement(SettingOutlined),
      label: 'Настройки',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return React.createElement(
    Sider,
    { 
      trigger: null, 
      collapsible: true, 
      collapsed: collapsed,
      collapsedWidth: 0,
      width: 250,
      style: {
        background: 'linear-gradient(180deg, #1A202C 0%, #2D3748 100%)',
      }
    },
    React.createElement(
      'div',
      {
        style: {
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 24px',
          borderBottom: '1px solid #374151',
          marginBottom: '8px'
        }
      },
      React.createElement(CrownOutlined, { 
        style: { 
          fontSize: '24px', 
          color: '#F2D024',
          marginRight: collapsed ? 0 : '12px'
        } 
      }),
      !collapsed && React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { 
            style: { 
              color: '#F2D024', 
              fontSize: '18px', 
              fontWeight: 'bold',
              lineHeight: '1'
            }
          },
          'Tendo Market'
        ),
        React.createElement(
          'div',
          { 
            style: { 
              color: '#9CA3AF', 
              fontSize: '12px',
              lineHeight: '1'
            }
          },
          'Админ панель'
        )
      )
    ),
    React.createElement(Menu, {
      theme: "dark",
      mode: "inline",
      selectedKeys: [location.pathname],
      onClick: handleMenuClick,
      items: menuItems,
      style: {
        background: 'transparent',
        border: 'none'
      }
    })
  );
}

export default Sidebar;
