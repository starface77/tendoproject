import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
  Space,
  Popconfirm,
  Tag,
  Switch,
  Card,
  Row,
  Col,
  Statistic,
  Image,
  Typography,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { productsApi, categoriesApi, uploadApi } from '../services/api';

const { Title, Text } = Typography;
// const { Option } = Select; // Больше не нужен
const { TextArea } = Input;

const Products = () => {
  // Состояния
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalValue: 0
  });

  // Загрузка данных при монтировании
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Загрузка товаров
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAll();
      const productList = response.products || response.data || [];
      setProducts(productList);
      
      // Вычисляем статистику
      const total = productList.length;
      const active = productList.filter(p => p.isActive !== false).length;
      const totalValue = productList.reduce((sum, p) => sum + (p.price || 0), 0);
      setStats({ total, active, totalValue });
      
    } catch (error) {
      message.error('Ошибка загрузки товаров: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка категорий
  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.categories || response.data || []);
    } catch (error) {
      message.error('Ошибка загрузки категорий: ' + error.message);
    }
  };

  // Открытие модала для добавления товара
  const handleAdd = () => {
    setEditingProduct(null);
    setModalVisible(true);
    setFileList([]);
    form.resetFields();
  };

  // Открытие модала для редактирования товара
  const handleEdit = (product) => {
    setEditingProduct(product);
    setModalVisible(true);
    
    // Заполняем форму данными товара
    form.setFieldsValue({
      name: product.name?.ru || product.name?.en || product.name || '',
      description: product.description?.ru || product.description?.en || product.description || '',
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category?._id || product.category,
      brand: product.brand,
      isActive: product.isActive !== false,
      inStock: product.inStock !== false,
      isNew: product.isNew || false,
      featured: product.featured || false,
    });

    // Устанавливаем изображения
    if (product.images && product.images.length > 0) {
      setFileList(product.images.map((url, index) => ({
        uid: index,
        name: `image${index}.jpg`,
        status: 'done',
        url: url,
      })));
    } else if (product.image) {
      setFileList([{
        uid: 0,
        name: 'image.jpg',
        status: 'done',
        url: product.image,
      }]);
    } else {
      setFileList([]);
    }
  };

  // Удаление товара
  const handleDelete = async (id) => {
    try {
      await productsApi.delete(id);
      message.success('Товар удален');
      loadProducts();
    } catch (error) {
      message.error('Ошибка удаления товара: ' + error.message);
    }
  };

  // Изменение статуса товара
  const handleToggleStatus = async (id, isActive) => {
    try {
      await productsApi.toggleStatus(id, isActive);
      message.success(`Товар ${isActive ? 'активирован' : 'деактивирован'}`);
      loadProducts();
    } catch (error) {
      message.error('Ошибка изменения статуса: ' + error.message);
    }
  };

  // Обработка загрузки изображений
  const handleUpload = async (file) => {
    try {
      const response = await uploadApi.uploadImage(file, 'product');
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

  // Сохранение товара
  const handleSave = async (values) => {
    try {
      setLoading(true);

      // Собираем URL изображений
      const images = fileList
        .filter(file => file.status === 'done')
        .map(file => file.url || file.response);

      const productData = {
        ...values,
        images: images,
        image: images[0] || null, // Первое изображение как основное
      };

      if (editingProduct) {
        await productsApi.update(editingProduct._id || editingProduct.id, productData);
        message.success('Товар обновлен');
      } else {
        await productsApi.create(productData);
        message.success('Товар создан');
      }

      setModalVisible(false);
      loadProducts();
    } catch (error) {
      message.error('Ошибка сохранения товара: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Форматирование валюты
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' сум';
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
          alt="Product"
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: '8px' }}
          fallback="https://placehold.co/60x60?text=Нет+изображения"
        />
      ),
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (name) => name?.ru || name?.en || name || 'Без названия',
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      render: (category) => category?.name?.ru || category?.name?.en || category?.name || 'Не указана',
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => (
        <div>
          <div style={{ fontWeight: '600' }}>{formatCurrency(price)}</div>
          {record.originalPrice && record.originalPrice > price && (
            <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>
              {formatCurrency(record.originalPrice)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
             color={isActive ? 'success' : 'error'}>
          {isActive ? 'Активен' : 'Неактивен'}
        </Tag>
      ),
    },
    {
      title: 'В наличии',
      dataIndex: 'inStock',
      key: 'inStock',
      render: (inStock) => (
        <Tag color={inStock ? 'blue' : 'volcano'}>
          {inStock ? 'Есть' : 'Нет'}
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
            title="Удалить товар?"
            description="Вы уверены, что хотите удалить этот товар?"
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
            <AppstoreOutlined /> Товары
          </Title>
          <Text type="secondary">Управление товарами маркетплейса</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAdd}
          size="large"
        >
          Добавить товар
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
              title="Всего товаров"
              value={stats.total}
              prefix={<AppstoreOutlined style={{ color: '#3b82f6' }} />}
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
              title="Активных товаров"
              value={stats.active}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
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
              title="Общая стоимость"
              value={stats.totalValue}
              prefix={<DollarOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#f59e0b' }}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
      </Row>

      {/* Таблица товаров */}
      <Card 
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0'
        }}
      >
        <Table
          dataSource={products}
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

      {/* Модал для добавления/редактирования товара */}
      <Modal
        title={editingProduct ? 'Редактировать товар' : 'Добавить товар'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Название товара"
                rules={[{ required: true, message: 'Пожалуйста, введите название товара' }]}
              >
                <Input placeholder="Введите название товара" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="category"
                label="Категория"
                rules={[{ required: true, message: 'Пожалуйста, выберите категорию' }]}
              >
                <Select 
                  placeholder="Выберите категорию"
                  showSearch
                  optionFilterProp="children"
                >
                  {categories.map(category => (
                    <Select.Option key={category._id || category.id} value={category._id || category.id}>
                      {category.name?.ru || category.name?.en || category.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="price"
                label="Цена"
                rules={[{ required: true, message: 'Пожалуйста, введите цену' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Введите цену"
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={value => value.replace(/\s?/g, '')}
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="originalPrice"
                label="Оригинальная цена"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Введите оригинальную цену"
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={value => value.replace(/\s?/g, '')}
                />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item
                name="description"
                label="Описание"
              >
                <TextArea 
                  placeholder="Введите описание товара" 
                  rows={4} 
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="brand"
                label="Бренд"
              >
                <Input placeholder="Введите бренд" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Активен"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="inStock"
                label="В наличии"
                valuePropName="checked"
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="isNew"
                label="Новинка"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item
                name="images"
                label="Изображения"
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
                  multiple
                >
                  {fileList.length >= 8 ? null : (
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

export default Products;