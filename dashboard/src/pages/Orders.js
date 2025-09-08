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
  ExclamationCircleOutlined
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
        <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {formatCurrency(total || 0)}
        </div>
      )
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Дата заказа',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('ru-RU')
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Посмотреть детали">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setSelectedOrder(record);
                setDetailsVisible(true);
              }}
            />
          </Tooltip>

          {record.status !== 'delivered' && record.status !== 'cancelled' && (
            <Tooltip title="Изменить статус">
              <Button
                icon={<EditOutlined />}
                size="small"
                type="primary"
                onClick={() => {
                  setSelectedOrder(record);
                  setStatusModalVisible(true);
                }}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>
        <ShoppingCartOutlined /> Управление заказами
      </Title>

      {/* Статистика заказов */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Всего заказов"
              value={stats.total}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Ожидают"
              value={stats.pending}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="В обработке"
              value={stats.processing}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Отправлены"
              value={stats.shipped}
              valueStyle={{ color: '#722ed1' }}
              prefix={<TruckOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Доставлены"
              value={stats.delivered}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Общая выручка"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="сум"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Фильтры */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>Фильтры:</Text>
          </Col>
          <Col span={6}>
            <Input.Search
              placeholder="Поиск по ID заказа или email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              onSearch={() => fetchOrders()}
            />
          </Col>
          <Col span={6}>
            <Select
              value={filters.status}
              style={{ width: '100%' }}
              onChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
            >
              <Option value="all">Все статусы</Option>
              <Option value="pending">Ожидают</Option>
              <Option value="processing">В обработке</Option>
              <Option value="shipped">Отправлены</Option>
              <Option value="delivered">Доставлены</Option>
              <Option value="cancelled">Отменены</Option>
            </Select>
          </Col>
          <Col>
            <Button onClick={() => setFilters({ status: 'all', page: 1, limit: 10, search: '' })}>
              Сбросить
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Таблица заказов */}
      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          rowKey={(record) => record._id || record.id}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            onChange: (page, pageSize) => {
              setFilters({ ...filters, page, limit: pageSize });
            }
          }}
        />
      </Card>

      {/* Модалка деталей заказа */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Детали заказа #{selectedOrder?._id?.slice(-8) || selectedOrder?.id}
          </Space>
        }
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={900}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Статус" span={2}>
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Дата заказа">
                <CalendarOutlined /> {new Date(selectedOrder.createdAt).toLocaleString('ru-RU')}
              </Descriptions.Item>
              <Descriptions.Item label="Обновлено">
                <CalendarOutlined /> {new Date(selectedOrder.updatedAt).toLocaleString('ru-RU')}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Информация о покупателе</Title>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Имя">
                <UserOutlined /> {selectedOrder.customer?.name || 'Не указано'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <MailOutlined /> {selectedOrder.customer?.email || 'Не указано'}
              </Descriptions.Item>

              <Descriptions.Item label="Телефон">
                <PhoneOutlined /> {selectedOrder.customer?.phone || 'Не указано'}
              </Descriptions.Item>
              <Descriptions.Item label="Адрес">
                <HomeOutlined /> {selectedOrder.shippingAddress || 'Не указано'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Товары в заказе</Title>
            <Table
              size="small"
              columns={[
                {
                  title: 'Изображение',
                  dataIndex: 'image',
                  key: 'image',
                  width: 80,
                  render: (image) => image ? (
                    <Image width={50} height={50} src={image} style={{ objectFit: 'cover' }} />
                  ) : <div style={{ width: 50, height: 50, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Нет</div>
                },
                {
                  title: 'Название',
                  dataIndex: 'name',
                  key: 'name',
                  render: (name, record) => (
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{name}</div>
                      {record.sku && <div style={{ fontSize: '12px', color: '#666' }}>SKU: {record.sku}</div>}
                    </div>
                  )
                },
                {
                  title: 'Цена',
                  dataIndex: 'price',
                  key: 'price',
                  render: (price) => formatCurrency(price)
                },
                {
                  title: 'Количество',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  render: (qty) => qty || 1
                },
                {
                  title: 'Итого',
                  key: 'total',
                  render: (_, record) => formatCurrency((record.price || 0) * (record.quantity || 1))
                }
              ]}
              dataSource={selectedOrder.items || []}
              pagination={false}
              rowKey={(record, index) => index}
            />

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Сумма товаров"
                    value={selectedOrder.subtotal || 0}
                    formatter={(value) => formatCurrency(value)}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Доставка"
                    value={selectedOrder.shippingCost || 0}
                    formatter={(value) => formatCurrency(value)}
                  />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row>
              <Col span={24}>
                <Card size="small">
                  <Statistic
                    title="Итого к оплате"
                    value={selectedOrder.total || 0}
                    formatter={(value) => formatCurrency(value)}
                    valueStyle={{ color: '#cf1322', fontSize: '24px' }}
                  />
                </Card>
              </Col>
            </Row>

            {selectedOrder.notes && (
              <>
                <Divider />
                <Title level={5}>Примечания:</Title>
                <Text>{selectedOrder.notes}</Text>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Модалка изменения статуса */}
      <Modal
        title="Изменить статус заказа"
        open={statusModalVisible}
        onCancel={() => {
          setStatusModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleStatusChange}
        >
          <Form.Item
            name="status"
            label="Новый статус"
            rules={[{ required: true, message: 'Выберите статус' }]}
          >
            <Select>
              <Option value="pending">Ожидает</Option>
              <Option value="processing">В обработке</Option>
              <Option value="shipped">Отправлен</Option>
              <Option value="delivered">Доставлен</Option>
              <Option value="cancelled">Отменен</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Примечания (необязательно)"
          >
            <TextArea
              rows={3}
              placeholder="Добавьте комментарий к изменению статуса..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Orders;