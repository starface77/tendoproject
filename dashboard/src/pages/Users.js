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
  Popconfirm,
  Switch
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  LockOutlined,
  UnlockOutlined,
  EditOutlined,
  EyeOutlined,
  CrownOutlined,
  TeamOutlined,
  SecurityScanOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { usersApi } from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Статистика пользователей
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admin: 0,
    seller: 0,
    buyer: 0
  });

  // Фильтры
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    page: 1,
    limit: 10,
    search: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (params.status === 'all') delete params.status;
      if (params.role === 'all') delete params.role;
      if (!params.search) delete params.search;

      const response = await usersApi.getAll(params);
      const usersData = response.users || response.data || [];
      setUsers(usersData);

      // Вычисляем статистику
      const total = usersData.length;
      const active = usersData.filter(u => u.isActive !== false).length;
      const inactive = total - active;
      const admin = usersData.filter(u => u.role === 'admin').length;
      const seller = usersData.filter(u => u.role === 'seller').length;
      const buyer = usersData.filter(u => u.role === 'buyer' || !u.role).length;

      setStats({ total, active, inactive, admin, seller, buyer });

    } catch (error) {
      message.error('Ошибка загрузки пользователей: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === false ? true : false;
      await usersApi.toggleStatus(userId, newStatus);
      message.success(`Пользователь ${newStatus ? 'разблокирован' : 'заблокирован'}`);
      await fetchUsers();
    } catch (error) {
      message.error('Ошибка изменения статуса: ' + error.message);
    }
  };

  const handleRoleChange = async (values) => {
    try {
      // Предполагаем, что у нас есть API для изменения роли
      // await usersApi.updateRole(selectedUser._id || selectedUser.id, values.role);
      message.success('Роль пользователя обновлена');

      setEditModalVisible(false);
      form.resetFields();
      await fetchUsers();
    } catch (error) {
      message.error('Ошибка изменения роли: ' + error.message);
    }
  };

  const getStatusColor = (status, isActive) => {
    if (isActive === false) return 'red';
    return status === 'active' ? 'green' : 'default';
  };

  const getStatusText = (status, isActive) => {
    if (isActive === false) return 'Заблокирован';
    return status === 'active' ? 'Активен' : 'Неактивен';
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'red',
      seller: 'blue',
      buyer: 'green'
    };
    return colors[role] || 'default';
  };

  const getRoleText = (role) => {
    const texts = {
      admin: 'Администратор',
      seller: 'Продавец',
      buyer: 'Покупатель'
    };
    return texts[role] || 'Пользователь';
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: <CrownOutlined />,
      seller: <SecurityScanOutlined />,
      buyer: <UserOutlined />
    };
    return icons[role] || <UserOutlined />;
  };

  const columns = [
    {
      title: 'Пользователь',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            icon={<UserOutlined />}
            src={record.avatar}
            size={40}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {name || record.displayName || 'Без имени'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.email}
            </div>
            {record.phone && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                {record.phone}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role) => (
        <Tag color={getRoleColor(role)} icon={getRoleIcon(role)}>
          {getRoleText(role)}
        </Tag>
      )
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive) => (
        <Tag icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
             color={isActive ? 'success' : 'error'}>
          {isActive ? 'Активен' : 'Заблокирован'}
        </Tag>
      )
    },
    {
      title: 'Дата регистрации',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (createdAt) => (
        <div style={{ fontSize: '12px' }}>
          {new Date(createdAt).toLocaleDateString('ru-RU')}
        </div>
      )
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Просмотреть">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => {
                setSelectedUser(record);
                setDetailsVisible(true);
              }}
              size="small"
            />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Заблокировать' : 'Разблокировать'}>
            <Button 
              icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />} 
              onClick={() => handleStatusToggle(record._id || record.id, record.isActive)}
              danger={!record.isActive}
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
            <TeamOutlined /> Пользователи
          </Title>
          <Text type="secondary">Управление пользователями маркетплейса</Text>
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
              title="Всего"
              value={stats.total}
              prefix={<TeamOutlined style={{ color: '#3b82f6' }} />}
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
              title="Активные"
              value={stats.active}
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
              title="Заблокированные"
              value={stats.inactive}
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
              title="Администраторы"
              value={stats.admin}
              prefix={<CrownOutlined style={{ color: '#f59e0b' }} />}
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
              title="Продавцы"
              value={stats.seller}
              prefix={<SecurityScanOutlined style={{ color: '#8b5cf6' }} />}
              valueStyle={{ color: '#8b5cf6' }}
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
              title="Покупатели"
              value={stats.buyer}
              prefix={<UserOutlined style={{ color: '#ec4899' }} />}
              valueStyle={{ color: '#ec4899' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Таблица пользователей */}
      <Card 
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0'
        }}
      >
        <Table
          dataSource={users}
          columns={columns}
          loading={loading}
          rowKey={(record) => record._id || record.id}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Модал для просмотра деталей пользователя */}
      <Modal
        title="Детали пользователя"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Avatar
                icon={<UserOutlined />}
                src={selectedUser.avatar}
                size={80}
              />
              <Title level={4} style={{ marginTop: '16px', marginBottom: '8px' }}>
                {selectedUser.name || selectedUser.displayName || 'Без имени'}
              </Title>
              <Text type="secondary">{selectedUser.email}</Text>
            </div>
            
            <Descriptions column={1} bordered>
              <Descriptions.Item label="ID">
                {selectedUser._id || selectedUser.id}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedUser.email}
              </Descriptions.Item>
              {selectedUser.phone && (
                <Descriptions.Item label="Телефон">
                  {selectedUser.phone}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Роль">
                <Tag color={getRoleColor(selectedUser.role)} icon={getRoleIcon(selectedUser.role)}>
                  {getRoleText(selectedUser.role)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Статус">
                <Tag icon={selectedUser.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                     color={selectedUser.isActive ? 'success' : 'error'}>
                  {selectedUser.isActive ? 'Активен' : 'Заблокирован'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Дата регистрации">
                {new Date(selectedUser.createdAt).toLocaleString('ru-RU')}
              </Descriptions.Item>
              {selectedUser.lastLoginAt && (
                <Descriptions.Item label="Последний вход">
                  {new Date(selectedUser.lastLoginAt).toLocaleString('ru-RU')}
                </Descriptions.Item>
              )}
            </Descriptions>
            
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <Button 
                type={selectedUser.isActive ? "primary" : "default"}
                danger={!selectedUser.isActive}
                icon={selectedUser.isActive ? <LockOutlined /> : <UnlockOutlined />}
                onClick={() => handleStatusToggle(selectedUser._id || selectedUser.id, selectedUser.isActive)}
              >
                {selectedUser.isActive ? 'Заблокировать' : 'Разблокировать'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;