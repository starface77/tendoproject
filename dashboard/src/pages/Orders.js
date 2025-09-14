import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Select,
  Descriptions,
  Badge,
  Tooltip,
  Row,
  Col,
  Statistic,
  Typography,
  Divider,
  Avatar,
  Image,
  Popconfirm
} from 'antd';
import {
  ShoppingCartOutlined,
  EyeOutlined,
  EditOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  TruckOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { ordersApi, usersApi } from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Статистика заказов
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0
  });

  // Фильтры
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1,
    limit: 10,
    search: ''
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (params.status === 'all') delete params.status;
      if (!params.search) delete params.search;

      const response = await ordersApi.getAll(params);
      const ordersData = response.orders || response.data || [];
      setOrders(ordersData);

      // Вычисляем статистику
      const total = ordersData.length;
      const pending = ordersData.filter(o => o.status === 'pending').length;
      const processing = ordersData.filter(o => o.status === 'processing').length;
      const shipped = ordersData.filter(o => o.status === 'shipped').length;
      const delivered = ordersData.filter(o => o.status === 'delivered').length;
      const cancelled = ordersData.filter(o => o.status === 'cancelled').length;
      const totalRevenue = ordersData
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, order) => sum + (order.total || 0), 0);

      setStats({ total, pending, processing, shipped, delivered, cancelled, totalRevenue });

    } catch (error) {
      message.error('Ошибка загрузки заказов: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (values) => {
    try {
      await ordersApi.updateStatus(selectedOrder._id || selectedOrder.id, values.status);
      message.success('Статус заказа обновлен');

      setStatusModalVisible(false);
      form.resetFields();
      await fetchOrders();
    } catch (error) {
      message.error('Ошибка изменения статуса: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      processing: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Ожидает',
      processing: 'В обработке',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменен'
    };
    return texts[status] || status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' сум';
  };

  const columns = [
    {
      title: 'ID заказа',
      dataIndex: '_id',
      key: '_id',
      width: 120,
      render: (id) => `#${id?.slice(-8) || id}`
    },
    {
      title: 'Покупатель',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => {
        if (typeof customer === 'object' && customer?.name) {
          return (
            <div>
              <div style={{ fontWeight: 'bold' }}>{customer.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{customer.email}</div>
            </div>
          );
        }
        return <span>Не указан</span>;
      }
    },
    {
      title: 'Товары',
      dataIndex: 'items',
      key: 'items',
      render: (items) => {
        if (!items || items.length === 0) return 'Нет товаров';

        const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const firstItem = items[0];

        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {totalItems} товар{totalItems > 1 ? 'ов' : ''}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {items.length === 1 ? firstItem.name : `${firstItem.name} и ещё ${items.length - 1}`}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Сумма',
      dataIndex: 'total',
      key: 'total',
      render: (total) => (
        <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>
          {formatCurrency(total || 0)}
        </div>
      )
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={status === 'delivered' ? <CheckCircleOutlined /> : null}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => (
        <div style={{ fontSize: '12px' }}>
          {new Date(createdAt).toLocaleDateString('ru-RU')}
        </div>
      )
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Просмотреть">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => {
                setSelectedOrder(record);
                setDetailsVisible(true);
              }}
              size="small"
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#1A202C' }}>
            <ShoppingCartOutlined /> Заказы
          </Title>
          <Text type="secondary">Управление заказами маркетплейса</Text>
        </div>
      </div>

      {/* Статистика */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={4}>
          <Card 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <Statistic
              title="Всего заказов"
              value={stats.total}
              prefix={<ShoppingCartOutlined style={{ color: '#3b82f6' }} />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={4}>
          <Card 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <Statistic
              title="Выручка"
              value={stats.totalRevenue}
              prefix={<DollarOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={4}>
          <Card 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <Statistic
              title="В обработке"
              value={stats.processing}
              prefix={<ClockCircleOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={4}>
          <Card 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <Statistic
              title="Доставлено"
              value={stats.delivered}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={4}>
          <Card 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <Statistic
              title="Отменено"
              value={stats.cancelled}
              prefix={<CloseCircleOutlined style={{ color: '#ef4444' }} />}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={4}>
          <Card 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <Statistic
              title="Ожидает"
              value={stats.pending}
              prefix={<ExclamationCircleOutlined style={{ color: '#f97316' }} />}
              valueStyle={{ color: '#f97316' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Таблица заказов */}
      <Card 
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0'
        }}
      >
        <Table
          dataSource={orders}
          columns={columns}
          loading={loading}
          rowKey={(record) => record._id || record.id}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Модал для просмотра деталей заказа */}
      <Modal
        title="Детали заказа"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="ID заказа">
                #{selectedOrder._id?.slice(-8) || selectedOrder.id}
              </Descriptions.Item>
              <Descriptions.Item label="Дата">
                {new Date(selectedOrder.createdAt).toLocaleString('ru-RU')}
              </Descriptions.Item>
              <Descriptions.Item label="Статус">
                <Tag color={getStatusColor(selectedOrder.status)} icon={selectedOrder.status === 'delivered' ? <CheckCircleOutlined /> : null}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Сумма">
                <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>
                  {formatCurrency(selectedOrder.total || 0)}
                </span>
              </Descriptions.Item>
            </Descriptions>
            
            <Divider>Покупатель</Divider>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Имя">
                {selectedOrder.customer?.name || 'Не указано'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.customer?.email || 'Не указано'}
              </Descriptions.Item>
              <Descriptions.Item label="Телефон">
                {selectedOrder.customer?.phone || 'Не указано'}
              </Descriptions.Item>
              <Descriptions.Item label="Адрес">
                {selectedOrder.shippingAddress ? (
                  <div>
                    <div>{selectedOrder.shippingAddress.street}</div>
                    <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}</div>
                    <div>{selectedOrder.shippingAddress.postalCode}</div>
                  </div>
                ) : 'Не указан'}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider>Товары</Divider>
            <div>
              {selectedOrder.items?.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={60}
                    height={60}
                    style={{ objectFit: 'cover', borderRadius: '8px' }}
                    fallback="https://placehold.co/60x60?text=Нет+изображения"
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {item.quantity} шт. × {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                Итого: <span style={{ color: '#3b82f6' }}>{formatCurrency(selectedOrder.total || 0)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;