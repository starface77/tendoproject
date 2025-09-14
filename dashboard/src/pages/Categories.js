import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  message,
  Space,
  Popconfirm,
  Switch,
  Card,
  Row,
  Col,
  Statistic,
  Image,
  Typography,
  Divider,
  Tag
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  TagsOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { categoriesApi, uploadApi } from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // Загрузка категорий при монтировании
  useEffect(() => {
    loadCategories();
  }, []);

  // Загрузка категорий
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.getAll();
      setCategories(response.categories || response.data || []);
    } catch (error) {
      message.error('Ошибка загрузки категорий: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Открытие модала для добавления категории
  const handleAdd = () => {
    setEditingCategory(null);
    setModalVisible(true);
    setFileList([]);
    form.resetFields();
  };

  // Открытие модала для редактирования категории
  const handleEdit = (category) => {
    setEditingCategory(category);
    setModalVisible(true);
    
    // Заполняем форму данными категории
    form.setFieldsValue({
      nameRu: category.name?.ru || '',
      nameEn: category.name?.en || '',
      descriptionRu: category.description?.ru || '',
      descriptionEn: category.description?.en || '',
      sortOrder: category.sortOrder || 0,
      isActive: category.isActive !== false,
    });

    // Устанавливаем изображение
    if (category.image) {
      setFileList([{
        uid: 0,
        name: 'image.jpg',
        status: 'done',
        url: category.image,
      }]);
    } else {
      setFileList([]);
    }
  };

  // Удаление категории
  const handleDelete = async (id) => {
    try {
      await categoriesApi.delete(id);
      message.success('Категория удалена');
      loadCategories();
    } catch (error) {
      message.error('Ошибка удаления категории: ' + error.message);
    }
  };

  // Обработка загрузки изображения
  const handleUpload = async (file) => {
    try {
      const response = await uploadApi.uploadImage(file, 'category');
      const imageUrl = response.imageUrl || response.url;
      
      return {
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: imageUrl,
        response: imageUrl
      };
    } catch (error) {
      message.error('Ошибка загрузки изображения: ' + error.message);
      return false;
    }
  };

  // Сохранение категории
  const handleSave = async (values) => {
    try {
      setLoading(true);

      // Получаем URL изображения
      const image = fileList.length > 0 && fileList[0].status === 'done' 
        ? (fileList[0].url || fileList[0].response) 
        : null;

      const categoryData = {
        name: {
          ru: values.nameRu,
          en: values.nameEn
        },
        description: {
          ru: values.descriptionRu,
          en: values.descriptionEn
        },
        sortOrder: values.sortOrder,
        isActive: values.isActive,
        image: image
      };

      if (editingCategory) {
        await categoriesApi.update(editingCategory._id || editingCategory.id, categoryData);
        message.success('Категория обновлена');
      } else {
        await categoriesApi.create(categoryData);
        message.success('Категория создана');
      }

      setModalVisible(false);
      loadCategories();
    } catch (error) {
      message.error('Ошибка сохранения категории: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Столбцы таблицы
  const columns = [
    {
      title: 'Изображение',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image) => (
        <Image
          src={image}
          alt="Category"
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: '8px' }}
          fallback="https://placehold.co/60x60?text=Нет+изображения"
        />
      ),
    },
    {
      title: 'Название (RU)',
      dataIndex: 'name',
      key: 'nameRu',
      render: (name) => name?.ru || 'Не указано',
    },
    {
      title: 'Название (EN)',
      dataIndex: 'name',
      key: 'nameEn',
      render: (name) => name?.en || 'Не указано',
    },
    {
      title: 'Порядок',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 100,
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
             color={isActive ? 'success' : 'error'}>
          {isActive ? 'Активна' : 'Неактивна'}
        </Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          >
            Редактировать
          </Button>
          <Popconfirm
            title="Удалить категорию?"
            description="Вы уверены, что хотите удалить эту категорию?"
            onConfirm={() => handleDelete(record._id || record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button icon={<DeleteOutlined />} danger size="small">
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
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
            <TagsOutlined /> Категории
          </Title>
          <Text type="secondary">Управление категориями товаров</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAdd}
          size="large"
        >
          Добавить категорию
        </Button>
      </div>

      {/* Статистика */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <Statistic
              title="Всего категорий"
              value={categories.length}
              prefix={<TagsOutlined style={{ color: '#3b82f6' }} />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <Card 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <Statistic
              title="Активных категорий"
              value={categories.filter(c => c.isActive !== false).length}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Таблица категорий */}
      <Card 
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0'
        }}
      >
        <Table
          dataSource={categories}
          columns={columns}
          loading={loading}
          rowKey={(record) => record._id || record.id}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Модал для добавления/редактирования категории */}
      <Modal
        title={editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nameRu"
                label="Название категории (RU)"
                rules={[{ required: true, message: 'Пожалуйста, введите название категории на русском' }]}
              >
                <Input placeholder="Введите название категории на русском" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="nameEn"
                label="Название категории (EN)"
                rules={[{ required: true, message: 'Пожалуйста, введите название категории на английском' }]}
              >
                <Input placeholder="Введите название категории на английском" />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item
                name="descriptionRu"
                label="Описание (RU)"
              >
                <TextArea 
                  placeholder="Введите описание категории на русском" 
                  rows={3} 
                />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item
                name="descriptionEn"
                label="Описание (EN)"
              >
                <TextArea 
                  placeholder="Введите описание категории на английском" 
                  rows={3} 
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="sortOrder"
                label="Порядок сортировки"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Введите порядок сортировки"
                  min={0}
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Активна"
                valuePropName="checked"
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item
                name="image"
                label="Изображение"
              >
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  customRequest={({ file, onSuccess, onError }) => {
                    handleUpload(file).then(result => {
                      if (result) {
                        onSuccess(result, file);
                      } else {
                        onError(new Error('Upload failed'));
                      }
                    });
                  }}
                  onChange={({ fileList }) => setFileList(fileList)}
                  multiple={false}
                >
                  {fileList.length >= 1 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Загрузить</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
          
          <Divider />
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Сохранить
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;