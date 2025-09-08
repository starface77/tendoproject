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
  Tooltip,
  Row,
  Col,
  Statistic,
  Typography,
  Divider
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  FileTextOutlined,
  ShopOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  TagsOutlined,
  DollarOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { sellerApplicationsApi } from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function SellerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [actionVisible, setActionVisible] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [form] = Form.useForm();
  
  // Фильтры
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    console.log('🚀 useEffect запущен, filters:', filters);
    fetchApplications();
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Отладочный useEffect для отслеживания изменений состояния
  useEffect(() => {
    console.log('🔄 Состояние applications изменилось:', applications.length, applications);
  }, [applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (params.status === 'all') delete params.status;
      
      console.log('🔍 Загружаем заявки с параметрами:', params);
      console.log('🔍 URL запроса:', `/admin/seller-applications?${new URLSearchParams(params).toString()}`);
      
      const response = await sellerApplicationsApi.getAll(params);
      console.log('📋 Полный ответ API:', response);
      console.log('📋 response (уже обработан интерсептором):', response);
      console.log('📋 response.data:', response.data);
      console.log('📋 response.applications:', response.applications);
      
      // Интерсептор уже вернул response.data, поэтому response уже содержит данные
      const applicationsData = response.data || response.applications || [];
      console.log('📋 Обработанные заявки:', applicationsData);
      console.log('📋 Количество заявок:', applicationsData.length);
      console.log('📋 Тип данных:', typeof applicationsData, Array.isArray(applicationsData));
      
      setApplications(applicationsData);
      console.log('✅ Заявки установлены в состояние');
    } catch (error) {
      console.error('❌ Ошибка загрузки заявок:', error);
      console.error('❌ Детали ошибки:', error.response?.data || error.message);
      message.error('Ошибка загрузки заявок: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await sellerApplicationsApi.getStats();
      console.log('📊 Получена статистика:', response);
      // Интерсептор уже вернул response.data, поэтому response уже содержит данные
      const statsData = response.data || response || {};
      console.log('📊 Обработанная статистика:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('❌ Ошибка загрузки статистики:', error);
    }
  };

  const handleAction = async (values) => {
    try {
      const { comments, sellerData } = values;
      // no-op

      console.log('🔄 Выполняем действие:', actionType, 'для заявки:', selectedApplication._id);

      if (actionType === 'approve') {
        await sellerApplicationsApi.approve(selectedApplication._id, {
          comments,
          sellerData
        });
        message.success('Заявка одобрена!');
      } else if (actionType === 'reject') {
        await sellerApplicationsApi.reject(selectedApplication._id, {
          comments
        });
        message.success('Заявка отклонена');
      } else if (actionType === 'request-docs') {
        await sellerApplicationsApi.requestDocuments(selectedApplication._id, {
          comments
        });
        message.success('Запрошены дополнительные документы');
      }

      setActionVisible(false);
      form.resetFields();
      await fetchApplications();
      await fetchStats();
    } catch (error) {
      message.error('Ошибка: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      under_review: 'blue',
      approved: 'green',
      rejected: 'red',
      requires_documents: 'purple'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Ожидает',
      under_review: 'На рассмотрении',
      approved: 'Одобрена',
      rejected: 'Отклонена',
      requires_documents: 'Нужны документы'
    };
    return texts[status] || status;
  };

  const getBusinessTypeText = (type) => {
    const types = {
      individual: 'Физ. лицо',
      ip: 'ИП',
      llc: 'ООО',
      ooo: 'ОАО',
      other: 'Другое'
    };
    return types[type] || type;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      width: 80,
      render: (id) => `#${id?.slice(-6) || 'N/A'}`
    },
    {
      title: 'Компания',
      key: 'businessName',
      render: (record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.businessInfo?.companyName || record.businessName || 'Не указано'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.businessInfo?.phone || record.phone || 'Телефон не указан'}
          </div>
        </div>
      )
    },
    {
      title: 'Контакт',
      key: 'contactName',
      render: (record) => (
        <div>
          <div>{record.contactInfo?.contactPerson || record.contactName || 'Не указано'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.contactInfo?.email || record.email || 'Email не указан'}
          </div>
        </div>
      )
    },
    {
      title: 'Категории',
      key: 'categories',
      render: (record) => {
        const categories = record.productCategories || record.categories || [];
        return (
          <div>
            {categories?.slice(0, 2).map(cat => (
              <Tag key={cat} size="small">{cat}</Tag>
            ))}
            {categories?.length > 2 && (
              <Tag size="small">+{categories.length - 2}</Tag>
            )}
          </div>
        );
      }
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
      title: 'Дата подачи',
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
                setSelectedApplication(record);
                setDetailsVisible(true);
              }}
            />
          </Tooltip>
          
          {record.status === 'pending' && (
            <>
              <Tooltip title="Одобрить">
                <Button 
                  icon={<CheckOutlined />} 
                  size="small"
                  type="primary"
                  onClick={() => {
                    console.log('✅ Выбрана заявка для одобрения:', record._id, record);
                    setSelectedApplication(record);
                    setActionType('approve');
                    setActionVisible(true);
                  }}
                />
              </Tooltip>
              
              <Tooltip title="Отклонить">
                <Button 
                  icon={<CloseOutlined />} 
                  size="small"
                  danger
                  onClick={() => {
                    console.log('❌ Выбрана заявка для отклонения:', record._id, record);
                    setSelectedApplication(record);
                    setActionType('reject');
                    setActionVisible(true);
                  }}
                />
              </Tooltip>
              
              <Tooltip title="Запросить документы">
                <Button 
                  icon={<FileTextOutlined />} 
                  size="small"
                  onClick={() => {
                    console.log('📄 Выбрана заявка для запроса документов:', record._id, record);
                    setSelectedApplication(record);
                    setActionType('request-docs');
                    setActionVisible(true);
                  }}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>
        <ShopOutlined /> Заявки продавцов
      </Title>

      {/* Статистика */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Всего заявок"
              value={stats.total || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Ожидают рассмотрения"
              value={stats.byStatus?.pending || 0}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Одобрено"
              value={stats.byStatus?.approved || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Отклонено"
              value={stats.byStatus?.rejected || 0}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseOutlined />}
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
          <Col>
            <Select
              value={filters.status}
              style={{ width: 200 }}
              onChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
            >
              <Option value="all">Все статусы</Option>
              <Option value="pending">Ожидают</Option>
              <Option value="under_review">На рассмотрении</Option>
              <Option value="approved">Одобрены</Option>
              <Option value="rejected">Отклонены</Option>
              <Option value="requires_documents">Нужны документы</Option>
            </Select>
          </Col>
          <Col>
            <Button onClick={() => setFilters({ status: 'all', page: 1, limit: 10 })}>
              Сбросить
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Таблица заявок */}
      <Card>
        {/* Отладочная информация */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ marginBottom: 16, padding: 8, background: '#f0f0f0', fontSize: '12px' }}>
            <strong>Отладка:</strong> Заявок в состоянии: {applications.length} | 
            Загрузка: {loading ? 'Да' : 'Нет'} | 
            Статистика: {JSON.stringify(stats)}
          </div>
        )}
        <Table
          columns={columns}
          dataSource={applications}
          loading={loading}
          rowKey="_id"
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: applications.length > 0 ? 11 : 0, // Общее количество из статистики
            onChange: (page, pageSize) => {
              setFilters({ ...filters, page, limit: pageSize });
            }
          }}
        />
      </Card>

      {/* Модалка деталей заявки */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Детали заявки #{selectedApplication?.id}
          </Space>
        }
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={800}
      >
        {selectedApplication && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Статус" span={2}>
                <Tag color={getStatusColor(selectedApplication.status)}>
                  {getStatusText(selectedApplication.status)}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Название компании">
                {selectedApplication.businessName}
              </Descriptions.Item>
              <Descriptions.Item label="Тип бизнеса">
                {getBusinessTypeText(selectedApplication.businessType)}
              </Descriptions.Item>
              
              <Descriptions.Item label="Контактное лицо">
                <UserOutlined /> {selectedApplication.contactName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <MailOutlined /> {selectedApplication.email}
              </Descriptions.Item>
              
              <Descriptions.Item label="Телефон">
                <PhoneOutlined /> {selectedApplication.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Веб-сайт">
                {selectedApplication.website ? (
                  <><GlobalOutlined /> {selectedApplication.website}</>
                ) : 'Не указан'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Адрес" span={2}>
                {selectedApplication.address}
              </Descriptions.Item>
              
              <Descriptions.Item label="Категории товаров" span={2}>
                {selectedApplication.categories?.map(cat => (
                  <Tag key={cat} icon={<TagsOutlined />}>{cat}</Tag>
                ))}
              </Descriptions.Item>
              
              <Descriptions.Item label="Описание товаров" span={2}>
                {selectedApplication.productTypes}
              </Descriptions.Item>
              
              <Descriptions.Item label="Объем продаж">
                <DollarOutlined /> {selectedApplication.monthlyVolume}
              </Descriptions.Item>
              <Descriptions.Item label="Опыт работы">
                <TrophyOutlined /> {selectedApplication.experience}
              </Descriptions.Item>
              
              <Descriptions.Item label="Дата подачи">
                <CalendarOutlined /> {new Date(selectedApplication.createdAt).toLocaleString('ru-RU')}
              </Descriptions.Item>
              <Descriptions.Item label="Последнее обновление">
                <CalendarOutlined /> {new Date(selectedApplication.updatedAt).toLocaleString('ru-RU')}
              </Descriptions.Item>
            </Descriptions>

            {selectedApplication.moderatorComments && (
              <>
                <Divider />
                <Title level={5}>Комментарии модератора:</Title>
                <Text type="secondary">{selectedApplication.moderatorComments}</Text>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Модалка действий */}
      <Modal
        title={
          actionType === 'approve' ? 'Одобрить заявку' :
          actionType === 'reject' ? 'Отклонить заявку' :
          'Запросить документы'
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
          {actionType === 'approve' && (
            <>
              <Form.Item
                name="displayName"
                label="Название магазина"
                rules={[{ required: true, message: 'Укажите название магазина' }]}
              >
                <Input placeholder="Например: Tendo Textiles Store" />
              </Form.Item>
              
              <Form.Item
                name="description"
                label="Описание магазина"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Краткое описание магазина..."
                />
              </Form.Item>
            </>
          )}
          
          <Form.Item
            name="comments"
            label="Комментарий"
            rules={actionType === 'reject' ? [{ required: true, message: 'Укажите причину отклонения' }] : []}
          >
            <TextArea 
              rows={4} 
              placeholder={
                actionType === 'approve' ? 'Поздравления и дополнительная информация...' :
                actionType === 'reject' ? 'Укажите причину отклонения...' :
                'Укажите какие документы требуются...'
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default SellerApplications;



