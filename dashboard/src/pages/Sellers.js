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
  InputNumber,
  Switch,
  Avatar
} from 'antd';
import {
  ShopOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  TagsOutlined,
  DollarOutlined,
  StarOutlined,
  CalendarOutlined,
  StopOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  BarChartOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { sellersApi } from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [actionVisible, setActionVisible] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [form] = Form.useForm();
  
  // Фильтры
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1,
    limit: 10,
    search: ''
  });

  useEffect(() => {
    fetchSellers();
  }, [filters]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (params.status === 'all') delete params.status;
      if (!params.search) delete params.search;
      
      const response = await sellersApi.getAll(params);
      console.log('🏪 Получены продавцы:', response.data);
      setSellers(response.data.data || []);
    } catch (error) {
      console.error('❌ Ошибка загрузки продавцов:', error);
      message.error('Ошибка загрузки продавцов: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (values) => {
    try {
      if (actionType === 'suspend') {
        await sellersApi.suspend(selectedSeller.id, values);
        message.success('Продавец заблокирован');
      } else if (actionType === 'unsuspend') {
        await sellersApi.unsuspend(selectedSeller.id);
        message.success('Продавец разблокирован');
      } else if (actionType === 'commission') {
        await sellersApi.updateCommission(selectedSeller.id, values.commissionRate);
        message.success('Комиссия обновлена');
      }

      setActionVisible(false);
      form.resetFields();
      await fetchSellers();
    } catch (error) {
      message.error('Ошибка: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'green',
      inactive: 'default',
      suspended: 'orange',
      banned: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      active: 'Активен',
      inactive: 'Неактивен',
      suspended: 'Заблокирован',
      banned: 'Забанен'
    };
    return texts[status] || status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' сум';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => `#${id}`
    },
    {
      title: 'Продавец',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar icon={<ShopOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.businessName}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              /{record.storeUrl}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Контакт',
      dataIndex: 'contactName',
      key: 'contactName',
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.email}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.phone}
          </div>
        </div>
      )
    },
    {
      title: 'Категории',
      dataIndex: 'categories',
      key: 'categories',
      render: (categories) => (
        <div>
          {categories?.slice(0, 2).map(cat => (
            <Tag key={cat} size="small">{cat}</Tag>
          ))}
          {categories?.length > 2 && (
            <Tag size="small">+{categories.length - 2}</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Статистика',
      key: 'stats',
      render: (_, record) => (
        <div>
          <div>
            <StarOutlined style={{ color: '#faad14' }} /> 
            {' '}{record.stats?.averageRating?.toFixed(1) || '0.0'}
            <span style={{ color: '#666', fontSize: '12px' }}>
              {' '}({record.stats?.totalReviews || 0})
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.stats?.totalOrders || 0} заказов
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.stats?.totalProducts || 0} товаров
          </div>
        </div>
      )
    },
    {
      title: 'Выручка',
      key: 'revenue',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {formatCurrency(record.stats?.totalRevenue || 0)}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Комиссия: {record.commissionRate}%
          </div>
        </div>
      )
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <div>
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
          {record.suspendedUntil && new Date(record.suspendedUntil) > new Date() && (
            <div style={{ fontSize: '12px', color: '#fa8c16' }}>
              До {new Date(record.suspendedUntil).toLocaleDateString('ru-RU')}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Дата регистрации',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('ru-RU')
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
                setSelectedSeller(record);
                setDetailsVisible(true);
              }}
            />
          </Tooltip>
          
          <Tooltip title="Изменить комиссию">
            <Button 
              icon={<DollarOutlined />} 
              size="small"
              onClick={() => {
                setSelectedSeller(record);
                setActionType('commission');
                form.setFieldsValue({ commissionRate: record.commissionRate });
                setActionVisible(true);
              }}
            />
          </Tooltip>
          
          {record.status === 'active' ? (
            <Tooltip title="Заблокировать">
              <Button 
                icon={<StopOutlined />} 
                size="small"
                danger
                onClick={() => {
                  setSelectedSeller(record);
                  setActionType('suspend');
                  setActionVisible(true);
                }}
              />
            </Tooltip>
          ) : record.status === 'suspended' ? (
            <Tooltip title="Разблокировать">
              <Button 
                icon={<PlayCircleOutlined />} 
                size="small"
                type="primary"
                onClick={() => {
                  setSelectedSeller(record);
                  setActionType('unsuspend');
                  handleAction({});
                }}
              />
            </Tooltip>
          ) : null}
          
          <Tooltip title="Аналитика">
            <Button 
              icon={<BarChartOutlined />} 
              size="small"
              onClick={() => {
                // TODO: Открыть аналитику продавца
                message.info('Аналитика будет добавлена в следующей версии');
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>
        <ShopOutlined /> Управление продавцами
      </Title>

      {/* Фильтры */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>Фильтры:</Text>
          </Col>
          <Col span={6}>
            <Input.Search
              placeholder="Поиск по названию или email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              onSearch={() => fetchSellers()}
            />
          </Col>
          <Col>
            <Select
              value={filters.status}
              style={{ width: 150 }}
              onChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
            >
              <Option value="all">Все статусы</Option>
              <Option value="active">Активные</Option>
              <Option value="inactive">Неактивные</Option>
              <Option value="suspended">Заблокированные</Option>
              <Option value="banned">Забаненные</Option>
            </Select>
          </Col>
          <Col>
            <Button onClick={() => setFilters({ status: 'all', page: 1, limit: 10, search: '' })}>
              Сбросить
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Таблица продавцов */}
      <Card>
        <Table
          columns={columns}
          dataSource={sellers}
          loading={loading}
          rowKey="id"
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            onChange: (page, pageSize) => {
              setFilters({ ...filters, page, limit: pageSize });
            }
          }}
        />
      </Card>

      {/* Модалка деталей продавца */}
      <Modal
        title={
          <Space>
            <ShopOutlined />
            {selectedSeller?.displayName}
          </Space>
        }
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={800}
      >
        {selectedSeller && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Статус" span={2}>
                <Tag color={getStatusColor(selectedSeller.status)}>
                  {getStatusText(selectedSeller.status)}
                </Tag>
                {selectedSeller.suspendedUntil && new Date(selectedSeller.suspendedUntil) > new Date() && (
                  <Text type="warning" style={{ marginLeft: 8 }}>
                    Заблокирован до {new Date(selectedSeller.suspendedUntil).toLocaleDateString('ru-RU')}
                  </Text>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="Название магазина">
                {selectedSeller.displayName}
              </Descriptions.Item>
              <Descriptions.Item label="URL магазина">
                /{selectedSeller.storeUrl}
              </Descriptions.Item>
              
              <Descriptions.Item label="Юридическое название">
                {selectedSeller.businessName}
              </Descriptions.Item>
              <Descriptions.Item label="Комиссия">
                {selectedSeller.commissionRate}%
              </Descriptions.Item>
              
              <Descriptions.Item label="Контактное лицо">
                <UserOutlined /> {selectedSeller.contactName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <MailOutlined /> {selectedSeller.email}
              </Descriptions.Item>
              
              <Descriptions.Item label="Телефон">
                <PhoneOutlined /> {selectedSeller.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Веб-сайт">
                {selectedSeller.website ? (
                  <><GlobalOutlined /> {selectedSeller.website}</>
                ) : 'Не указан'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Адрес" span={2}>
                {selectedSeller.address}
              </Descriptions.Item>
              
              <Descriptions.Item label="Описание" span={2}>
                {selectedSeller.description || 'Описание не указано'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Категории товаров" span={2}>
                {selectedSeller.categories?.map(cat => (
                  <Tag key={cat} icon={<TagsOutlined />}>{cat}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>

            <Divider />
            
            <Title level={5}>Статистика</Title>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Общая выручка"
                  value={selectedSeller.stats?.totalRevenue || 0}
                  formatter={(value) => formatCurrency(value)}
                  prefix={<DollarOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Заказов"
                  value={selectedSeller.stats?.totalOrders || 0}
                  prefix={<ShopOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Товаров"
                  value={selectedSeller.stats?.totalProducts || 0}
                  prefix={<TagsOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Рейтинг"
                  value={selectedSeller.stats?.averageRating || 0}
                  precision={1}
                  prefix={<StarOutlined />}
                  suffix={`/ 5 (${selectedSeller.stats?.totalReviews || 0})`}
                />
              </Col>
            </Row>

            <Divider />
            
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Дата регистрации">
                <CalendarOutlined /> {new Date(selectedSeller.createdAt).toLocaleString('ru-RU')}
              </Descriptions.Item>
              <Descriptions.Item label="Последний вход">
                {selectedSeller.lastLoginAt ? (
                  <><CalendarOutlined /> {new Date(selectedSeller.lastLoginAt).toLocaleString('ru-RU')}</>
                ) : 'Никогда'}
              </Descriptions.Item>
            </Descriptions>

            {selectedSeller.suspensionReason && (
              <>
                <Divider />
                <Title level={5}>Причина блокировки:</Title>
                <Text type="danger">{selectedSeller.suspensionReason}</Text>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Модалка действий */}
      <Modal
        title={
          actionType === 'suspend' ? 'Заблокировать продавца' :
          actionType === 'commission' ? 'Изменить комиссию' :
          'Действие'
        }
        open={actionVisible}
        onCancel={() => {
          setActionVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAction}
        >
          {actionType === 'suspend' && (
            <>
              <Form.Item
                name="duration"
                label="Длительность блокировки (дни)"
                rules={[{ required: true, message: 'Укажите длительность' }]}
                initialValue={30}
              >
                <InputNumber min={1} max={365} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="reason"
                label="Причина блокировки"
                rules={[{ required: true, message: 'Укажите причину блокировки' }]}
              >
                <TextArea 
                  rows={3} 
                  placeholder="Укажите причину блокировки..."
                />
              </Form.Item>
            </>
          )}
          
          {actionType === 'commission' && (
            <Form.Item
              name="commissionRate"
              label="Комиссия (%)"
              rules={[
                { required: true, message: 'Укажите размер комиссии' },
                { type: 'number', min: 0, max: 50, message: 'Комиссия должна быть от 0 до 50%' }
              ]}
            >
              <InputNumber 
                min={0} 
                max={50} 
                step={0.1} 
                style={{ width: '100%' }} 
                addonAfter="%"
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export default Sellers;



