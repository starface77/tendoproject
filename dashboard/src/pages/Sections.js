import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Switch, 
  Select, 
  message, 
  Card, 
  Space, 
  Tag,
  Divider,
  Typography,
  Row,
  Col,
  InputNumber
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  HomeOutlined,
  AppstoreOutlined,
  TagsOutlined
} from '@ant-design/icons';
import { sectionsApi } from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const Sections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [form] = Form.useForm();

  // Load sections
  const loadSections = async () => {
    try {
      setLoading(true);
      const response = await sectionsApi.getAdminSections();
      if (response.success) {
        setSections(response.data || []);
      }
    } catch (error) {
      message.error('Ошибка загрузки секций: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      let response;
      
      if (editingSection) {
        // Update existing section
        response = await sectionsApi.updateSection(editingSection.id, values);
      } else {
        // Create new section
        response = await sectionsApi.createSection(values);
      }
      
      if (response.success) {
        message.success(editingSection ? 'Секция обновлена' : 'Секция создана');
        setModalVisible(false);
        form.resetFields();
        setEditingSection(null);
        loadSections();
      } else {
        message.error(response.error || 'Ошибка сохранения');
      }
    } catch (error) {
      message.error('Ошибка сохранения: ' + error.message);
    }
  };

  // Handle edit
  const handleEdit = (section) => {
    setEditingSection(section);
    form.setFieldsValue({
      title: section.title,
      key: section.key || '',
      type: section.type || 'manual',
      description: section.description || '',
      order: section.order || 0,
      isActive: section.isActive !== false,
      productIds: section.productIds || [],
      query: section.query || {}
    });
    setModalVisible(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const response = await sectionsApi.deleteSection(id);
      if (response.success) {
        message.success('Секция удалена');
        loadSections();
      } else {
        message.error(response.error || 'Ошибка удаления');
      }
    } catch (error) {
      message.error('Ошибка удаления: ' + error.message);
    }
  };

  // Handle modal cancel
  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingSection(null);
  };

  // Columns for the table
  const columns = [
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.key && <Text type="secondary" style={{ fontSize: '12px' }}>{record.key}</Text>}
        </Space>
      )
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag icon={type === 'manual' ? <AppstoreOutlined /> : <TagsOutlined />} 
             color={type === 'manual' ? 'blue' : 'green'}>
          {type === 'manual' ? 'Ручной' : 'Динамический'}
        </Tag>
      ),
      filters: [
        { text: 'Ручной', value: 'manual' },
        { text: 'Динамический', value: 'dynamic' }
      ],
      onFilter: (value, record) => record.type === value
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Активна' : 'Неактивна'}
        </Tag>
      ),
      filters: [
        { text: 'Активна', value: true },
        { text: 'Неактивна', value: false }
      ],
      onFilter: (value, record) => record.isActive === value
    },
    {
      title: 'Порядок',
      dataIndex: 'order',
      key: 'order',
      sorter: (a, b) => a.order - b.order
    },
    {
      title: 'Товары',
      dataIndex: 'productIds',
      key: 'productIds',
      render: (productIds) => (
        <Text type="secondary">{Array.isArray(productIds) ? productIds.length : 0} шт.</Text>
      )
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          >
            Редактировать
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            Удалить
          </Button>
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
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1A202C' }}>
            <HomeOutlined style={{ marginRight: '12px' }} />
            Секции главной страницы
          </Title>
          <Text type="secondary">Управление секциями на главной странице сайта</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Добавить секцию
        </Button>
      </div>

      <Card 
        style={{ 
          borderRadius: '8px', 
          border: '1px solid #e2e8f0'
        }}
      >
        <Table 
          dataSource={sections}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: false
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Modal for creating/editing sections */}
      <Modal
        title={editingSection ? 'Редактировать секцию' : 'Создать секцию'}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Название"
                rules={[{ required: true, message: 'Введите название секции' }]}
              >
                <Input placeholder="Например: Рекомендуемые товары" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="key"
                label="Ключ (необязательно)"
                tooltip="Системный ключ для идентификации секции"
              >
                <Input placeholder="Например: recommended" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Тип секции"
                rules={[{ required: true, message: 'Выберите тип секции' }]}
              >
                <Select>
                  <Option value="manual">Ручной (выбор конкретных товаров)</Option>
                  <Option value="dynamic">Динамический (по параметрам)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="order"
                label="Порядок отображения"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Описание"
          >
            <Input.TextArea rows={2} placeholder="Описание секции" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Статус"
            valuePropName="checked"
          >
            <Switch checkedChildren="Активна" unCheckedChildren="Неактивна" />
          </Form.Item>

          <Divider>Настройки динамической секции</Divider>
          
          <Form.Item
            name={['query', 'isFeatured']}
            label="Только избранные товары"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name={['query', 'isOnSale']}
            label="Только товары со скидкой"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name={['query', 'tag']}
            label="Тег"
            tooltip="Товары с определенным тегом"
          >
            <Input placeholder="Например: new, sale, popular" />
          </Form.Item>
          
          <Form.Item
            name={['query', 'limit']}
            label="Количество товаров"
          >
            <InputNumber min={1} max={48} defaultValue={12} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name={['query', 'sort']}
            label="Сортировка"
          >
            <Select>
              <Option value="-createdAt">Новинки (новые первые)</Option>
              <Option value="createdAt">Старые первые</Option>
              <Option value="-rating.average">По рейтингу (высокий первый)</Option>
              <Option value="rating.average">По рейтингу (низкий первый)</Option>
              <Option value="-price">По убыванию цены</Option>
              <Option value="price">По возрастанию цены</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingSection ? 'Обновить' : 'Создать'}
              </Button>
              <Button onClick={handleCancel}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Sections;