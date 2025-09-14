import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Statistic, message, Spin, Divider, Typography, Badge, Space, Button } from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { dashboardApi, sellerApplicationsApi } from '../services/api';
import CountUp from 'react-countup';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    users: 0,
    products: 0,
    categories: 0,
    sellerApplications: 0,
    pendingApplications: 0,
    activeSellers: 0,
    gmv: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);

  // Загрузка данных при монтировании
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Загружаем статистику с бэкенда
      try {
        const statsResponse = await dashboardApi.getStats();
        if (statsResponse.success) {
          setStats({
            orders: statsResponse.data.orders || 0,
            revenue: statsResponse.data.revenue || 0,
            users: statsResponse.data.users || 0,
            products: statsResponse.data.products || 0,
            categories: statsResponse.data.categories || 0,
            sellerApplications: statsResponse.data.sellerApplications || 0,
            pendingApplications: statsResponse.data.pendingApplications || 0,
            activeSellers: statsResponse.data.activeSellers || 0,
            gmv: statsResponse.data.gmv || 0,
            conversionRate: statsResponse.data.conversionRate || 0
          });
        }
      } catch (error) {
        console.log('Статистика недоступна, загружаем данные по отдельности');
        await loadIndividualStats();
      }

      // Загружаем статистику заявок продавцов
      try {
        const applicationsStatsResponse = await sellerApplicationsApi.getStats();
        if (applicationsStatsResponse.success) {
          const totalApplications = applicationsStatsResponse.data?.totalStats?.reduce((sum, item) => sum + item.count, 0) || 0;
          const pendingApplications = applicationsStatsResponse.data?.pendingCount || 0;
          
          setStats(prevStats => ({
            ...prevStats,
            sellerApplications: totalApplications,
            pendingApplications: pendingApplications
          }));
        }
      } catch (error) {
        console.error('Ошибка загрузки заявок продавцов:', error);
      }

    } catch (error) {
      message.error('Ошибка загрузки данных дашборда: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Загрузка статистики по отдельности
  const loadIndividualStats = async () => {
    // В будущем можно добавить загрузку по отдельным API
  };

  const formatter = (value) => <CountUp end={value} separator=" " />;
  const currencyFormatter = (value) => <CountUp end={value} separator=" " suffix=" сум" decimals={0} />;
  const percentFormatter = (value) => <CountUp end={value} decimals={1} suffix="%" />;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Загрузка данных дашборда...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1A202C' }}>
            Дашборд
          </Title>
          <Text type="secondary">Обзор ключевых метрик маркетплейса</Text>
        </div>
        <div>
          <Badge 
            count="Live" 
            style={{ 
              backgroundColor: '#10b981',
              fontSize: '10px',
              padding: '0 4px'
            }} 
          />
          <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
            {new Date().toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </div>
      </div>

      {/* Основная статистика */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="dashboard-stat-card"
            style={{ 
              borderLeft: '3px solid #3b82f6',
              background: '#fff'
            }}
          >
            <Statistic
              title={
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A202C' }}>Заказы</div>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Всего заказов</Text>
                </div>
              }
              value={stats.orders}
              prefix={<ShoppingCartOutlined style={{ color: '#3b82f6', fontSize: '16px' }} />}
              valueStyle={{ color: '#3b82f6', fontSize: '20px', fontWeight: '600' }}
              formatter={formatter}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="dashboard-stat-card"
            style={{ 
              borderLeft: '3px solid #10b981',
              background: '#fff'
            }}
          >
            <Statistic
              title={
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A202C' }}>Выручка</div>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Общая выручка</Text>
                </div>
              }
              value={stats.revenue}
              prefix={<DollarOutlined style={{ color: '#10b981', fontSize: '16px' }} />}
              valueStyle={{ color: '#10b981', fontSize: '20px', fontWeight: '600' }}
              formatter={currencyFormatter}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="dashboard-stat-card"
            style={{ 
              borderLeft: '3px solid #8b5cf6',
              background: '#fff'
            }}
          >
            <Statistic
              title={
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A202C' }}>Пользователи</div>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Активные пользователи</Text>
                </div>
              }
              value={stats.users}
              prefix={<UserOutlined style={{ color: '#8b5cf6', fontSize: '16px' }} />}
              valueStyle={{ color: '#8b5cf6', fontSize: '20px', fontWeight: '600' }}
              formatter={formatter}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="dashboard-stat-card"
            style={{ 
              borderLeft: '3px solid #f59e0b',
              background: '#fff'
            }}
          >
            <Statistic
              title={
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A202C' }}>Товары</div>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Активные товары</Text>
                </div>
              }
              value={stats.products}
              prefix={<AppstoreOutlined style={{ color: '#f59e0b', fontSize: '16px' }} />}
              valueStyle={{ color: '#f59e0b', fontSize: '20px', fontWeight: '600' }}
              formatter={formatter}
            />
          </Card>
        </Col>
      </Row>

      {/* Дополнительная статистика */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="dashboard-stat-card"
            style={{ 
              borderLeft: '3px solid #ec4899',
              background: '#fff'
            }}
          >
            <Statistic
              title={
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A202C' }}>Продавцы</div>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Активные продавцы</Text>
                </div>
              }
              value={stats.activeSellers}
              prefix={<ShopOutlined style={{ color: '#ec4899', fontSize: '16px' }} />}
              valueStyle={{ color: '#ec4899', fontSize: '20px', fontWeight: '600' }}
              formatter={formatter}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="dashboard-stat-card"
            style={{ 
              borderLeft: '3px solid #06b6d4',
              background: '#fff'
            }}
          >
            <Statistic
              title={
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A202C' }}>GMV</div>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Объем продаж</Text>
                </div>
              }
              value={stats.gmv}
              prefix={<BarChartOutlined style={{ color: '#06b6d4', fontSize: '16px' }} />}
              valueStyle={{ color: '#06b6d4', fontSize: '20px', fontWeight: '600' }}
              formatter={currencyFormatter}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="dashboard-stat-card"
            style={{ 
              borderLeft: '3px solid #7c3aed',
              background: '#fff'
            }}
          >
            <Statistic
              title={
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A202C' }}>Конверсия</div>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Коэффициент конверсии</Text>
                </div>
              }
              value={stats.conversionRate}
              prefix={<BarChartOutlined style={{ color: '#7c3aed', fontSize: '16px' }} />}
              valueStyle={{ color: '#7c3aed', fontSize: '20px', fontWeight: '600' }}
              formatter={percentFormatter}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="dashboard-stat-card"
            style={{ 
              borderLeft: '3px solid #f97316',
              background: '#fff'
            }}
          >
            <Statistic
              title={
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A202C' }}>Заявки</div>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Ожидают рассмотрения</Text>
                </div>
              }
              value={stats.pendingApplications}
              prefix={<FileTextOutlined style={{ color: '#f97316', fontSize: '16px' }} />}
              valueStyle={{ color: '#f97316', fontSize: '20px', fontWeight: '600' }}
              formatter={formatter}
            />
          </Card>
        </Col>
      </Row>

      {/* Информационная секция */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChartOutlined />
                <span>Аналитика маркетплейса</span>
              </div>
            }
            style={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
            extra={
              <Button type="primary" size="small">
                Подробнее
              </Button>
            }
          >
            <div style={{ textAlign: 'center', padding: '30px 15px' }}>
              <BarChartOutlined style={{ fontSize: '36px', color: '#3b82f6', marginBottom: '12px' }} />
              <Title level={5} style={{ marginBottom: '8px' }}>Детальная аналитика</Title>
              <Text type="secondary">
                Перейдите в раздел "Аналитика" для просмотра детальных отчетов
              </Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileTextOutlined />
                <span>Заявки продавцов</span>
              </div>
            }
            style={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
            extra={
              <Button type="primary" size="small">
                Все заявки
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Новые заявки</Text>
                  <br />
                  <Text type="secondary">Ожидают рассмотрения</Text>
                </div>
                <Badge 
                  count={stats.pendingApplications} 
                  style={{ backgroundColor: '#f97316', fontSize: '10px' }} 
                />
              </div>
              
              <Divider style={{ margin: '6px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Всего заявок</Text>
                  <br />
                  <Text type="secondary">За все время</Text>
                </div>
                <Text strong>{stats.sellerApplications}</Text>
              </div>
              
              <Divider style={{ margin: '6px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Активные продавцы</Text>
                  <br />
                  <Text type="secondary">Подтвержденные аккаунты</Text>
                </div>
                <Text strong style={{ color: '#10b981' }}>{stats.activeSellers}</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Быстрые действия */}
      <Card 
        title="Быстрые действия" 
        style={{ 
          marginTop: '16px', 
          borderRadius: '8px', 
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          <Button 
            type="primary" 
            size="middle" 
            icon={<AppstoreOutlined />}
            style={{ 
              height: 'auto', 
              padding: '12px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '12px' }}>Добавить товар</span>
          </Button>
          
          <Button 
            size="middle" 
            icon={<UserOutlined />}
            style={{ 
              height: 'auto', 
              padding: '12px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '12px' }}>Добавить пользователя</span>
          </Button>
          
          <Button 
            size="middle" 
            icon={<ShopOutlined />}
            style={{ 
              height: 'auto', 
              padding: '12px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '12px' }}>Добавить продавца</span>
          </Button>
          
          <Button 
            size="middle" 
            icon={<BarChartOutlined />}
            style={{ 
              height: 'auto', 
              padding: '12px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '12px' }}>Просмотреть аналитику</span>
          </Button>
        </div>
      </Card>

      <Card style={{ 
        marginTop: '16px', 
        borderRadius: '8px', 
        border: '1px solid #e2e8f0',
        background: '#f1f5f9'
      }}>
        <Title level={5} style={{ color: '#1A202C', marginBottom: '12px', fontSize: '16px' }}>
          Добро пожаловать в админ панель Tendo Market!
        </Title>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>Здесь вы можете управлять всеми аспектами маркетплейса.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircleOutlined style={{ color: '#10b981' }} />
            <Text style={{ color: '#666' }}>Управляйте товарами и категориями</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ClockCircleOutlined style={{ color: '#f59e0b' }} />
            <Text style={{ color: '#666' }}>Отслеживайте заказы</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ExclamationCircleOutlined style={{ color: '#3b82f6' }} />
            <Text style={{ color: '#666' }}>Рассматривайте заявки</Text>
          </div>
        </div>
        <p style={{ marginTop: '12px', marginBottom: '0', color: '#666', fontSize: '12px' }}>
          Используйте меню слева для навигации.
        </p>
      </Card>
    </div>
  );
};

export default Dashboard;