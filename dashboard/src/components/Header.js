import React from 'react';
import { Layout, Button, Avatar, Dropdown, Space, Typography, Badge, Tooltip } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  QuestionCircleOutlined,
  HomeOutlined
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
  const [fullscreen, setFullscreen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setFullscreen(false);
      }
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Профиль',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      onClick: handleLogout
    }
  ];

  const languageMenuItems = [
    {
      key: 'ru',
      label: 'Русский',
      onClick: () => setLang('ru')
    },
    {
      key: 'uz',
      label: 'O\'zbek',
      onClick: () => setLang('uz')
    },
    {
      key: 'en',
      label: 'English',
      onClick: () => setLang('en')
    }
  ];

  return (
    <AntHeader
      style={{
        padding: '0 16px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 999,
        height: '60px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onCollapse}
          style={{
            fontSize: '18px',
            width: 48,
            height: 48,
            color: '#1A202C'
          }}
        />
        {!collapsed && (
          <div style={{ 
            marginLeft: '12px',
            padding: '6px 12px',
            background: '#f1f5f9',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Text strong style={{ color: '#1A202C', fontSize: '14px' }}>
              Админ панель
            </Text>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Tooltip title="Перейти на сайт">
          <Button 
            type="text" 
            icon={<HomeOutlined />}
            onClick={() => window.open('/', '_blank')}
            style={{ fontSize: '16px', color: '#1A202C' }}
          />
        </Tooltip>
        
        <Tooltip title="Полноэкранный режим">
          <Button 
            type="text" 
            icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={toggleFullscreen}
            style={{ fontSize: '16px', color: '#1A202C' }}
          />
        </Tooltip>
        
        <Tooltip title="Помощь">
          <Button 
            type="text" 
            icon={<QuestionCircleOutlined />}
            style={{ fontSize: '16px', color: '#1A202C' }}
          />
        </Tooltip>
        
        <Dropdown
          menu={{ items: languageMenuItems }}
          placement="bottomRight"
        >
          <Button type={lang === 'ru' ? 'primary' : 'text'} style={{ fontWeight: '500', fontSize: '12px', padding: '4px 8px' }}>
            {lang.toUpperCase()}
          </Button>
        </Dropdown>

        <div className='hide-on-mobile'>
          <Text
            type="secondary"
            style={{ fontSize: '12px' }}
          >
            {new Date().toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </div>

        <Badge count={3} size="small" offset={[-5, 5]}>
          <Button
            type="text"
            icon={<BellOutlined />}
            style={{ fontSize: '16px', color: '#1A202C' }}
          />
        </Badge>

        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
        >
          <Button
            type="text"
            style={{ 
              height: 'auto', 
              padding: '6px 8px',
              background: '#f1f5f9',
              borderRadius: '8px'
            }}
          >
            <Space>
              <Avatar
                size="small"
                style={{ 
                  backgroundColor: '#3b82f6', 
                  color: '#fff',
                  border: '1px solid #e2e8f0'
                }}
                icon={<UserOutlined />}
              >
                {user?.firstName?.[0]}
              </Avatar>
              <div 
                style={{ 
                  textAlign: 'left', 
                  lineHeight: '1.2',
                  display: collapsed ? 'none' : 'block'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1A202C' }}>
                  {`${user?.firstName || 'Админ'}`}
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {user?.role === 'super_admin' ? 'Супер админ' : 'Админ'}
                </div>
              </div>
            </Space>
          </Button>
        </Dropdown>
      </div>
    </AntHeader>
  );
}

export default Header;