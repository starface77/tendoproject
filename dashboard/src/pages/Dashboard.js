import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, message, Spin } from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { dashboardApi, productsApi, ordersApi, usersApi, sellerApplicationsApi } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    users: 0,
    products: 0,
    sellerApplications: 0,
    pendingApplications: 0
  });
  // const [recentProducts, setRecentProducts] = useState([]);
  // const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Загрузка всех данных дашборда
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Пытаемся загрузить готовую статистику с бэкенда
      try {
        const statsResponse = await dashboardApi.getStats();
        setStats(statsResponse);
      } catch (error) {
        // Если статистика недоступна, загружаем данные по отдельности
        console.log('Статистика недоступна, загружаем данные по отдельности');
        await loadIndividualStats();
      }

      // Загружаем последние товары
      // Пропускаем недостающие блоки последних товаров/заявок на этом этапе

      // Загружаем статистику заявок продавцов
      try {
        const applicationsStatsResponse = await sellerApplicationsApi.getStats();
        
        const totalApplications = applicationsStatsResponse.totalStats?.reduce((sum, item) => sum + item.count, 0) || 0;
        const pendingApplications = applicationsStatsResponse.pendingCount || 0;
        
        setStats(prevStats => ({
          ...prevStats,
          sellerApplications: totalApplications,
          pendingApplications: pendingApplications
        }));
        
        // Пропущено отображение списка для упрощения
      } catch (error) {
        console.error('Ошибка загрузки заявок продавцов:', error);
      }

    } catch (error) {
      message.error('Ошибка загрузки данных дашборда: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка статистики по отдельности
  const loadIndividualStats = async () => {
    try {
      const [productsRes] = await Promise.all([
        productsApi.getAll().catch(() => ({ products: [] })),
      ]);

      // Пытаемся загрузить заказы и пользователей (могут быть недоступны)
      let ordersCount = 0;
      let usersCount = 0;
      let totalRevenue = 0;

      try {
        const ordersRes = await ordersApi.getAll();
        ordersCount = ordersRes.orders?.length || 0;
        totalRevenue = ordersRes.orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      } catch (error) {
        console.log('Заказы недоступны');
      }

      try {
        const usersRes = await usersApi.getAll();
        usersCount = usersRes.users?.length || 0;
      } catch (error) {
        console.log('Пользователи недоступны');
      }

      setStats({
        orders: ordersCount,
        revenue: totalRevenue,
        users: usersCount,
        products: productsRes.products?.length || 0
      });

    } catch (error) {
      console.error('Ошибка загрузки индивидуальной статистики:', error);
    }
  };

  // Колонки для таблицы последних товаров
  // Убрана таблица с демо-данными

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
      <h1 style={{ marginBottom: '24px' }}>📊 Дашборд</h1>
      
      {/* Основная статистика */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Заказы"
              value={stats.orders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Выручка"
              value={stats.revenue}
              prefix={<DollarOutlined />}
              suffix="сум"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Пользователи"
              value={stats.users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Товары"
              value={stats.products}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: '24px' }}>
        <h3>📈 Добро пожаловать в админ панель Tendo Market!</h3>
        <p>Здесь вы можете управлять всеми аспектами маркетплейса.</p>
        <p>📱 Используйте меню слева для навигации по разделам.</p>
      </Card>
    </div>
  );
};

export default Dashboard;