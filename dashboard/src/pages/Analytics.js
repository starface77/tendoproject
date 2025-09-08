import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Select,
  DatePicker,
  Table,
  Progress,
  Typography,
  Spin,
  message,
  Tabs,
  List,
  Avatar,
  Tag
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  EyeOutlined,
  TrophyOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { dashboardApi, productsApi, ordersApi, usersApi, categoriesApi } from '../services/api';
import moment from 'moment';
import { useI18n } from '../i18n';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({});
  const [period, setPeriod] = useState('30d');
  const [dateRange, setDateRange] = useState(null);
  const { t } = useI18n();

  useEffect(() => {
    fetchAnalytics();
  }, [period, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Пытаемся загрузить готовую аналитику с бэкенда
      try {
        const params = { period };
        if (dateRange && dateRange.length === 2) {
          params.from = dateRange[0].startOf('day').toISOString();
          params.to = dateRange[1].endOf('day').toISOString();
        }
        const response = await dashboardApi.getAnalytics(params.period || '30d');
        setAnalyticsData(response);
      } catch (error) {
        // Если бэкенд не готов, загружаем данные по отдельности
        console.log('Бэкенд аналитики недоступен, загружаем данные по отдельности');
        await loadIndividualAnalytics();
      }
    } catch (error) {
      message.error('Ошибка загрузки аналитики: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadIndividualAnalytics = async () => {
    try {
      const [productsRes, ordersRes, usersRes, categoriesRes] = await Promise.all([
        productsApi.getAll().catch(() => ({ products: [] })),
        ordersApi.getAll().catch(() => ({ orders: [] })),
        usersApi.getAll().catch(() => ({ users: [] })),
        categoriesApi.getAll().catch(() => ({ categories: [] }))
      ]);

      const products = productsRes.products || [];
      const orders = ordersRes.orders || [];
      const users = usersRes.users || [];
      const categories = categoriesRes.categories || [];

      // Вычисляем аналитику
      const analytics = {
        overview: {
          totalRevenue: orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, order) => sum + (order.total || 0), 0),
          totalOrders: orders.length,
          totalProducts: products.length,
          totalUsers: users.length,
          activeUsers: users.filter(u => u.isActive !== false).length,
          totalCategories: categories.length
        },
        salesByCategory: categories.map(cat => ({
          name: cat.name,
          value: products.filter(p => p.category === cat._id).length,
          revenue: products
            .filter(p => p.category === cat._id)
            .reduce((sum, p) => sum + (p.price || 0), 0)
        })),
        topProducts: products
          .sort((a, b) => (b.price || 0) - (a.price || 0))
          .slice(0, 10)
          .map(p => ({
            name: p.name,
            price: p.price || 0,
            category: p.category?.name || 'Без категории',
            status: p.isActive !== false ? 'Активен' : 'Неактивен'
          })),
        recentOrders: orders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5),
        userGrowth: {
          labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
          data: [65, 59, 80, 81, 56, 85]
        },
        revenueGrowth: {
          labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
          data: [12000, 19000, 30000, 50000, 20000, 30000]
        }
      };

      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Ошибка загрузки индивидуальной аналитики:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' сум';
  };

  const getGrowthIndicator = (current, previous) => {
    if (!previous) return null;
    const growth = ((current - previous) / previous) * 100;
    const isPositive = growth > 0;
    return {
      value: Math.abs(growth).toFixed(1),
      isPositive,
      icon: isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />,
      color: isPositive ? '#52c41a' : '#ff4d4f'
    };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Загрузка аналитики...</p>
      </div>
    );
  }

  const overview = analyticsData.overview || {};
  const salesByCategory = analyticsData.salesByCategory || [];
  const topProducts = analyticsData.topProducts || [];
  const recentOrders = analyticsData.recentOrders || [];

  return (
    <div>
      <Title level={2}>
        <BarChartOutlined /> {t('analytics.title', 'Аналитика маркетплейса')}
      </Title>

      {/* Фильтры */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>{t('filters.period', 'Период')}:</Text>
          </Col>
          <Col>
            <Select value={period} onChange={setPeriod} style={{ width: 120 }}>
              <Option value="7d">{t('period.7d', '7 дней')}</Option>
              <Option value="30d">{t('period.30d', '30 дней')}</Option>
              <Option value="90d">{t('period.90d', '90 дней')}</Option>
              <Option value="1y">{t('period.1y', '1 год')}</Option>
            </Select>
          </Col>
          <Col>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD.MM.YYYY"
            />
          </Col>
        </Row>
      </Card>

      {/* Обзорные показатели */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('stats.totalRevenue', 'Общая выручка')}
              value={overview.totalRevenue || 0}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('stats.totalOrders', 'Всего заказов')}
              value={overview.totalOrders || 0}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('stats.totalProducts', 'Товаров')}
              value={overview.totalProducts || 0}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('stats.totalUsers', 'Пользователей')}
              value={overview.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('stats.activeUsers', 'Активных пользователей')}
              value={overview.activeUsers || 0}
              prefix={<UserOutlined />}
              suffix={`/ ${overview.totalUsers || 0}`}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title={t('stats.totalCategories', 'Категорий')}
              value={overview.totalCategories || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Детальная аналитика */}
      <Tabs defaultActiveKey="1">
        <TabPane tab={<><BarChartOutlined /> {t('analytics.salesByCategory', 'Продажи по категориям')}</>} key="1">
          <Row gutter={16}>
            <Col span={24}>
              <Card title={t('analytics.salesByCategory', 'Распределение товаров по категориям')}>
                <Table
                  columns={[
                    {
                      title: t('table.category', 'Категория'),
                      dataIndex: 'name',
                      key: 'name',
                      render: (name) => <strong>{name}</strong>
                    },
                    {
                      title: t('table.count', 'Количество товаров'),
                      dataIndex: 'value',
                      key: 'value',
                      render: (value) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{value}</span>
                          <Progress
                            percent={((value / (overview.totalProducts || 1)) * 100).toFixed(1)}
                            size="small"
                            strokeColor="#1890ff"
                          />
                        </div>
                      )
                    },
                    {
                      title: t('table.total', 'Общая стоимость'),
                      dataIndex: 'revenue',
                      key: 'revenue',
                      render: (revenue) => formatCurrency(revenue)
                    }
                  ]}
                  dataSource={salesByCategory}
                  pagination={false}
                  rowKey="name"
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<><TrophyOutlined /> {t('analytics.topProducts', 'Топ товаров')}</>} key="2">
          <Row gutter={16}>
            <Col span={24}>
              <Card title={t('analytics.topProducts', 'Самые дорогие товары')}>
                <Table
                  columns={[
                    {
                      title: '#',
                      key: 'index',
                      width: 60,
                      render: (_, __, index) => index + 1
                    },
                    {
                      title: t('table.name', 'Название товара'),
                      dataIndex: 'name',
                      key: 'name',
                      render: (name) => <strong>{name}</strong>
                    },
                    {
                      title: t('table.category', 'Категория'),
                      dataIndex: 'category',
                      key: 'category'
                    },
                    {
                      title: t('table.price', 'Цена'),
                      dataIndex: 'price',
                      key: 'price',
                      render: (price) => (
                        <Text style={{ color: '#1890ff', fontWeight: 'bold' }}>
                          {formatCurrency(price)}
                        </Text>
                      )
                    },
                    {
                      title: t('table.status', 'Статус'),
                      dataIndex: 'status',
                      key: 'status',
                      render: (status) => (
                        <Tag color={status === 'Активен' ? 'green' : 'red'}>
                          {status}
                        </Tag>
                      )
                    }
                  ]}
                  dataSource={topProducts}
                  pagination={false}
                  rowKey={(record, index) => index}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<><ShoppingCartOutlined /> {t('analytics.recentOrders', 'Недавние заказы')}</>} key="3">
          <Row gutter={16}>
            <Col span={24}>
              <Card title={t('analytics.recentOrders', 'Последние заказы')}>
                <Table
                  columns={[
                    {
                      title: 'ID',
                      dataIndex: '_id',
                      key: '_id',
                      render: (id) => `#${id?.slice(-8) || id}`
                    },
                    {
                      title: t('table.customer', 'Покупатель'),
                      dataIndex: 'customer',
                      key: 'customer',
                      render: (customer) => customer?.name || customer?.email || 'Не указан'
                    },
                    {
                      title: t('table.sum', 'Сумма'),
                      dataIndex: 'total',
                      key: 'total',
                      render: (total) => formatCurrency(total || 0)
                    },
                    {
                      title: t('table.status', 'Статус'),
                      dataIndex: 'status',
                      key: 'status',
                      render: (status) => {
                        const colors = {
                          pending: 'orange',
                          processing: 'blue',
                          shipped: 'purple',
                          delivered: 'green',
                          cancelled: 'red'
                        };
                        return (
                          <Tag color={colors[status] || 'default'}>
                            {status === 'pending' ? 'Ожидает' :
                             status === 'processing' ? 'В обработке' :
                             status === 'shipped' ? 'Отправлен' :
                             status === 'delivered' ? 'Доставлен' :
                             status === 'cancelled' ? 'Отменен' : status}
                          </Tag>
                        );
                      }
                    },
                    {
                      title: t('table.date', 'Дата'),
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      render: (date) => new Date(date).toLocaleString('ru-RU')
                    }
                  ]}
                  dataSource={recentOrders}
                  pagination={false}
                  rowKey="_id"
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Analytics;