import React from 'react';
import { Layout, Button, Avatar, Dropdown, Space, Typography, Badge } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../services/AuthContext';
import { useI18n } from '../i18n';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

function Header({ collapsed, onCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang } = useI18n();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: React.createElement(UserOutlined),
      label: 'Профиль',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: React.createElement(SettingOutlined),
      label: 'Настройки',
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: React.createElement(LogoutOutlined),
      label: 'Выйти',
      onClick: handleLogout
    }
  ];

  return React.createElement(
    AntHeader,
    {
      style: {
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,21,41,.08)',
        borderBottom: '1px solid #f0f0f0'
      }
    },
    React.createElement(
      'div',
      null,
      React.createElement(Button, {
        type: "text",
        icon: React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined),
        onClick: onCollapse,
        style: {
          fontSize: '16px',
          width: 64,
          height: 64,
        }
      })
    ),
    React.createElement(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
      React.createElement(
        Badge,
        { count: 3, size: "small" },
        React.createElement(Button, {
          type: "text",
          icon: React.createElement(BellOutlined),
          style: { fontSize: '16px' }
        })
      ),
      React.createElement(
        'div',
        { className: 'hide-on-mobile', style: { display: 'flex', gap: 8 } },
        React.createElement(Button, { type: lang === 'ru' ? 'primary' : 'text', onClick: () => setLang('ru') }, 'RU'),
        React.createElement(Button, { type: lang === 'uz' ? 'primary' : 'text', onClick: () => setLang('uz') }, 'UZ'),
        React.createElement(Button, { type: lang === 'en' ? 'primary' : 'text', onClick: () => setLang('en') }, 'EN')
      ),
      React.createElement('div', { className: 'hide-on-mobile' },
        React.createElement(Text, {
          type: "secondary",
          style: { fontSize: '14px' }
        }, new Date().toLocaleDateString('ru-RU', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }))
      ),
      React.createElement(
        Dropdown,
        {
          menu: { items: userMenuItems },
          placement: "bottomRight",
          arrow: true
        },
        React.createElement(Button, {
          type: "text",
          style: { height: 'auto', padding: '8px 12px' }
        },
        React.createElement(Space, null,
          React.createElement(Avatar, {
            size: "small",
            style: { backgroundColor: '#F2D024', color: '#1A202C' },
            icon: React.createElement(UserOutlined)
          }, user?.firstName?.[0]),
          React.createElement(
            'div',
            { style: { textAlign: 'left', lineHeight: '1.2' } },
            React.createElement(
              'div',
              { style: { fontSize: '14px', fontWeight: '500' } },
              `${user?.firstName || 'Супер'} ${user?.lastName || 'Администратор'}`
            ),
            React.createElement(
              'div',
              { style: { fontSize: '12px', color: '#666' } },
              user?.role === 'super_admin' ? 'Супер админ' : 'Админ'
            )
          )
        ))
      )
    )
  );
}

export default Header;