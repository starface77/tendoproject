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
  Popconfirm
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
  ExclamationCircleOutlined
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
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status, record) => (
        <Tag color={getStatusColor(status, record.isActive)}>
          {getStatusText(status, record.isActive)}
        </Tag>
      )
    },
    {
      title: 'Регистрация',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('ru-RU')
    },
    {
      title: 'Последний вход',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 150,
      render: (date) => date ? new Date(date).toLocaleDateString('ru-RU') : 'Никогда'
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="Посмотреть детали">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setSelectedUser(record);
                setDetailsVisible(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Изменить роль">
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
              onClick={() => {
                setSelectedUser(record);
                form.setFieldsValue({ role: record.role });
                setEditModalVisible(true);
              }}
            />
          </Tooltip>

          <Tooltip title={record.isActive === false ? 'Разблокировать' : 'Заблокировать'}>
            <Popconfirm
              title={record.isActive === false ? 'Разблокировать пользователя?' : 'Заблокировать пользователя?'}
              description={record.isActive === false ? 'Пользователь сможет войти в систему' : 'Пользователь не сможет войти в систему'}
              onConfirm={() => handleStatusToggle(record._id || record.id, record.isActive)}
              okText="Да"
              cancelText="Нет"
            >
              <Button
                icon={record.isActive === false ? <UnlockOutlined /> : <LockOutlined />}
                size="small"
                danger={record.isActive !== false}
                type={record.isActive === false ? 'primary' : 'default'}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>
        <TeamOutlined /> Управление пользователями
      </Title>

      {/* Статистика пользователей */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Всего пользователей"
              value={stats.total}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Активные"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
              prefix={<UnlockOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Заблокированные"
              value={stats.inactive}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<LockOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Администраторы"
              value={stats.admin}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CrownOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Продавцы"
              value={stats.seller}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SecurityScanOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Покупатели"
              value={stats.buyer}
              valueStyle={{ color: '#52c41a' }}
              prefix={<UserOutlined />}
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
              placeholder="Поиск по имени или email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              onSearch={() => fetchUsers()}
            />
          </Col>
          <Col span={4}>
            <Select
              value={filters.status}
              style={{ width: '100%' }}
              onChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
            >
              <Option value="all">Все статусы</Option>
              <Option value="active">Активные</Option>
              <Option value="inactive">Заблокированные</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              value={filters.role}
              style={{ width: '100%' }}
              onChange={(value) => setFilters({ ...filters, role: value, page: 1 })}
            >
              <Option value="all">Все роли</Option>
              <Option value="admin">Администраторы</Option>
              <Option value="seller">Продавцы</Option>
              <Option value="buyer">Покупатели</Option>
            </Select>
          </Col>
          <Col>
            <Button onClick={() => setFilters({ status: 'all', role: 'all', page: 1, limit: 10, search: '' })}>
              Сбросить
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Таблица пользователей */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
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

      {/* Модалка деталей пользователя */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            {selectedUser?.name || selectedUser?.displayName || 'Пользователь'}
          </Space>
        }
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={800}
      >
        {selectedUser && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Статус" span={2}>
                <Tag color={getStatusColor(selectedUser.status, selectedUser.isActive)}>
                  {getStatusText(selectedUser.status, selectedUser.isActive)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Роль" span={2}>
                <Tag color={getRoleColor(selectedUser.role)} icon={getRoleIcon(selectedUser.role)}>
                  {getRoleText(selectedUser.role)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Имя">
                {selectedUser.name || selectedUser.displayName || 'Не указано'}
              </Descriptions.Item>
              <Descriptions.Item label="Фамилия">
                {selectedUser.surname || 'Не указано'}
              </Descriptions.Item>

              <Descriptions.Item label="Email">
                <MailOutlined /> {selectedUser.email}
              </Descriptions.Item>
              <Descriptions.Item label="Телефон">
                <PhoneOutlined /> {selectedUser.phone || 'Не указано'}
              </Descriptions.Item>

              <Descriptions.Item label="Дата регистрации">
                <CalendarOutlined /> {new Date(selectedUser.createdAt).toLocaleString('ru-RU')}
              </Descriptions.Item>
              <Descriptions.Item label="Последний вход">
                <CalendarOutlined /> {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString('ru-RU') : 'Никогда'}
              </Descriptions.Item>
            </Descriptions>

            {selectedUser.address && (
              <>
                <Divider />
                <Title level={5}>Адрес</Title>
                <Text>{selectedUser.address}</Text>
              </>
            )}

            {selectedUser.bio && (
              <>
                <Divider />
                <Title level={5}>О себе</Title>
                <Text>{selectedUser.bio}</Text>
              </>
            )}

            {selectedUser.isActive === false && selectedUser.blockReason && (
              <>
                <Divider />
                <Title level={5}>Причина блокировки:</Title>
                <Text type="danger">{selectedUser.blockReason}</Text>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Модалка изменения роли */}
      <Modal
        title="Изменить роль пользователя"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRoleChange}
        >
          <Form.Item
            name="role"
            label="Роль пользователя"
            rules={[{ required: true, message: 'Выберите роль' }]}
          >
            <Select>
              <Option value="buyer">Покупатель</Option>
              <Option value="seller">Продавец</Option>
              <Option value="admin">Администратор</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reason"
            label="Причина изменения (необязательно)"
          >
            <TextArea
              rows={3}
              placeholder="Укажите причину изменения роли..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;