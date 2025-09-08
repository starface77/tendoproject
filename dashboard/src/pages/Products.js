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
  Image
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { productsApi, categoriesApi, uploadApi } from '../services/api';

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

  // Колонки таблицы
  const columns = [
    {
      title: 'Изображение',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image, record) => {
        const imageUrl = image || (record.images && record.images[0]);
        return imageUrl ? (
          <Image
            width={50}
            height={50}
            src={imageUrl}
            style={{ objectFit: 'cover' }}
            placeholder={<div style={{ width: 50, height: 50, background: '#f0f0f0' }}>No Image</div>}
          />
        ) : (
          <div style={{ width: 50, height: 50, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            No Image
          </div>
        );
      },
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text) => {
        const displayName = text?.ru || text?.en || text || 'Без названия';
        return <strong>{displayName}</strong>;
      },
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        if (typeof category === 'object' && category?.name) {
          const categoryName = category.name?.ru || category.name?.en || category.name || 'Без названия';
          return <Tag color="blue">{categoryName}</Tag>;
        }
        return <Tag color="default">Без категории</Tag>;
      },
    },
    {
      title: 'Бренд',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price?.toLocaleString()} сум`,
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_, record) => (
        <Space>
          <Switch
            checked={record.isActive !== false}
            onChange={(checked) => handleToggleStatus(record._id || record.id, checked)}
            checkedChildren="Активен"
            unCheckedChildren="Неактивен"
          />
          {record.inStock !== false && <Tag color="green">В наличии</Tag>}
          {record.isNew && <Tag color="orange">Новинка</Tag>}
          {record.featured && <Tag color="purple">Рекомендуемый</Tag>}
        </Space>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="primary"
            size="small"
          />
          <Popconfirm
            title="Удалить товар?"
            description="Это действие нельзя отменить"
            onConfirm={() => handleDelete(record._id || record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Статистика */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Всего товаров"
              value={stats.total}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Активных товаров"
              value={stats.active}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Общая стоимость"
              value={stats.totalValue}
              prefix={<DollarOutlined />}
              suffix="сум"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Заголовок и кнопка добавления */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>🛍️ Управление товарами</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Добавить товар
        </Button>
      </div>

      {/* Таблица товаров */}
      <Table
        columns={columns}
        dataSource={products}
        rowKey={(record) => record._id || record.id}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} из ${total} товаров`,
        }}
      />

      {/* Модал для добавления/редактирования товара */}
      <Modal
        title={editingProduct ? '✏️ Редактировать товар' : '➕ Добавить товар'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="Сохранить"
        cancelText="Отмена"
        width={800}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="name"
            label="Название товара"
            rules={[{ required: true, message: 'Введите название товара' }]}
          >
            <Input placeholder="Например: iPhone 15 Pro Max Silicone Case" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
          >
            <TextArea rows={4} placeholder="Подробное описание товара..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Цена (сум)"
                rules={[{ required: true, message: 'Введите цену' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="originalPrice"
                label="Старая цена (сум)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Категория"
                rules={[{ required: true, message: 'Выберите категорию' }]}
              >
                <select 
                  style={{
                    width: '100%',
                    height: '32px',
                    padding: '4px 11px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#fff'
                  }}
                  onChange={(e) => {
                    form.setFieldsValue({ category: e.target.value });
                  }}
                  value={form.getFieldValue('category') || ''}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(category => (
                    <option key={category._id || category.id} value={category._id || category.id}>
                      {category.name?.ru || category.name || 'Без названия'}
                    </option>
                  ))}
                </select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="brand"
                label="Бренд"
              >
                <Input placeholder="Apple, Samsung, Xiaomi..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Изображения">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              customRequest={async ({ file, onSuccess, onError }) => {
                try {
                  const uploadedFile = await handleUpload(file);
                  if (uploadedFile) {
                    onSuccess(uploadedFile.url, file);
                  } else {
                    onError(new Error('Upload failed'));
                  }
                } catch (error) {
                  onError(error);
                }
              }}
              onPreview={(file) => {
                window.open(file.url || file.preview, '_blank');
              }}
            >
              {fileList.length >= 5 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Загрузить</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="Активен" unCheckedChildren="Неактивен" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="inStock" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="В наличии" unCheckedChildren="Нет в наличии" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="isNew" valuePropName="checked">
                <Switch checkedChildren="Новинка" unCheckedChildren="Обычный" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="featured" valuePropName="checked">
                <Switch checkedChildren="Рекомендуемый" unCheckedChildren="Обычный" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;