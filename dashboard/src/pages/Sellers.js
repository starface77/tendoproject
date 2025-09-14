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
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MessageOutlined,
  ShoppingCartOutlined
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
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag icon={status === 'active' ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
             color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Рейтинг',
      key: 'rating',
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
            Продаж: {record.stats?.totalSales || 0}
          </div>
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
                setSelectedSeller(record);
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
            <ShopOutlined /> Продавцы
          </Title>
          <Text type="secondary">Управление продавцами маркетплейса</Text>
        </div>
      </div>

      {/* Таблица продавцов */}
      <Card 
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0'
        }}
      >
        <Table
          dataSource={sellers}
          columns={columns}
          loading={loading}
          rowKey={(record) => record.id}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Модал для просмотра деталей продавца */}
      <Modal
        title="Детали продавца"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={800}
      >
        {selectedSeller && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Avatar
                icon={<ShopOutlined />}
                size={80}
                style={{ backgroundColor: '#3b82f6' }}
              />
              <Title level={4} style={{ marginTop: '16px', marginBottom: '8px' }}>
                {selectedSeller.displayName}
              </Title>
              <Text type="secondary">{selectedSeller.businessName}</Text>
            </div>
            
            <Descriptions column={2} bordered>
              <Descriptions.Item label="ID">
                #{selectedSeller.id}
              </Descriptions.Item>
              <Descriptions.Item label="Статус">
                <Tag icon={selectedSeller.status === 'active' ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                     color={getStatusColor(selectedSeller.status)}>
                  {getStatusText(selectedSeller.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedSeller.email}
              </Descriptions.Item>
              <Descriptions.Item label="Телефон">
                {selectedSeller.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Контактное лицо">
                {selectedSeller.contactName}
              </Descriptions.Item>
              <Descriptions.Item label="Сайт">
                {selectedSeller.website ? (
                  <a href={selectedSeller.website} target="_blank" rel="noopener noreferrer">
                    {selectedSeller.website}
                  </a>
                ) : 'Не указан'}
              </Descriptions.Item>
              <Descriptions.Item label="Адрес">
                {selectedSeller.address || 'Не указан'}
              </Descriptions.Item>
              <Descriptions.Item label="Дата регистрации">
                {new Date(selectedSeller.createdAt).toLocaleString('ru-RU')}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider>Статистика</Divider>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Рейтинг"
                    value={selectedSeller.stats?.averageRating?.toFixed(1) || 0}
                    prefix={<StarOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Отзывы"
                    value={selectedSeller.stats?.totalReviews || 0}
                    prefix={<MessageOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Продажи"
                    value={selectedSeller.stats?.totalSales || 0}
                    prefix={<ShoppingCartOutlined />}
                  />
                </Card>
              </Col>
            </Row>
            
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <Space>
                {selectedSeller.status === 'active' ? (
                  <Button 
                    type="primary" 
                    danger
                    icon={<StopOutlined />}
                    onClick={() => {
                      setSelectedSeller(selectedSeller);
                      setActionType('suspend');
                      setActionVisible(true);
                    }}
                  >
                    Заблокировать
                  </Button>
                ) : (
                  <Button 
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={() => {
                      setSelectedSeller(selectedSeller);
                      setActionType('unsuspend');
                      setActionVisible(true);
                    }}
                  >
                    Разблокировать
                  </Button>
                )}
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* Модал для действий с продавцом */}
      <Modal
        title={actionType === 'suspend' ? 'Заблокировать продавца' : 
               actionType === 'unsuspend' ? 'Разблокировать продавца' : 
               'Изменить комиссию'}
        open={actionVisible}
        onCancel={() => setActionVisible(false)}
        onOk={() => form.submit()}
        okText="Подтвердить"
        cancelText="Отмена"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAction}
        >
          {actionType === 'suspend' && (
            <Form.Item
              name="reason"
              label="Причина блокировки"
              rules={[{ required: true, message: 'Пожалуйста, укажите причину блокировки' }]}
            >
              <TextArea placeholder="Укажите причину блокировки" rows={3} />
            </Form.Item>
          )}
          
          {actionType === 'commission' && (
            <Form.Item
              name="commissionRate"
              label="Процент комиссии (%)"
              rules={[{ required: true, message: 'Пожалуйста, укажите процент комиссии' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={100}
                formatter={value => `${value}%`}
                parser={value => value.replace('%', '')}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Sellers;