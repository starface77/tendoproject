import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Upload,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  AppstoreOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { categoriesApi, uploadApi } from '../services/api';

const { TextArea } = Input;

const Categories = () => {
  // Состояния
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [iconFile, setIconFile] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    withProducts: 0
  });

  // Загрузка данных при монтировании
  useEffect(() => {
    loadCategories();
  }, []);

  // Загрузка категорий
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.getAll();
      const categoryList = response.categories || response.data || [];
      setCategories(categoryList);
      
      // Вычисляем статистику
      const total = categoryList.length;
      const withProducts = categoryList.filter(c => (c.productCount || 0) > 0).length;
      setStats({ total, withProducts });
      
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
    setIconFile(null);
    form.resetFields();
  };

  // Открытие модала для редактирования категории
  const handleEdit = (category) => {
    setEditingCategory(category);
    setModalVisible(true);
    
    // Заполняем форму данными категории
    form.setFieldsValue({
      name: category.name?.ru || category.name?.en || category.name || '',
      description: category.description?.ru || category.description?.en || category.description || '',
    });

    // Устанавливаем иконку
    if (category.icon) {
      setIconFile({
        uid: 0,
        name: 'icon.jpg',
        status: 'done',
        url: category.icon,
      });
    } else {
      setIconFile(null);
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

  // Обработка загрузки иконки
  const handleIconUpload = async (file) => {
    try {
      const response = await uploadApi.uploadImage(file, 'category');
      const iconUrl = response.imageUrl || response.url;
      
      return {
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: iconUrl,
        response: iconUrl
      };
    } catch (error) {
      message.error('Ошибка загрузки иконки: ' + error.message);
      return false;
    }
  };

  // Сохранение категории
  const handleSave = async (values) => {
    try {
      setLoading(true);

      const categoryData = {
        ...values,
        icon: iconFile?.url || iconFile?.response || null,
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

  // Колонки таблицы
  const columns = [
    {
      title: 'Иконка',
      dataIndex: 'icon',
      key: 'icon',
      width: 80,
      render: (icon, record) => (
        icon ? (
          <Avatar src={icon} size={40} />
        ) : (
          <Avatar 
            style={{ backgroundColor: '#f0f0f0', color: '#999' }} 
            size={40}
            icon={<AppstoreOutlined />}
          />
        )
      ),
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
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => {
        const displayDescription = text?.ru || text?.en || text || '';
        return displayDescription;
      },
    },
    {
      title: 'Товаров',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 100,
      render: (count) => count || 0,
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
            title="Удалить категорию?"
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
              title="Всего категорий"
              value={stats.total}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="С товарами"
              value={stats.withProducts}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Пустых категорий"
              value={stats.total - stats.withProducts}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Заголовок и кнопка добавления */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>📂 Управление категориями</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Добавить категорию
        </Button>
      </div>

      {/* Таблица категорий */}
      <Table
        columns={columns}
        dataSource={categories}
        rowKey={(record) => record._id || record.id}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} из ${total} категорий`,
        }}
      />

      {/* Модал для добавления/редактирования категории */}
      <Modal
        title={editingCategory ? '✏️ Редактировать категорию' : '➕ Добавить категорию'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="Сохранить"
        cancelText="Отмена"
        width={600}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="name"
            label="Название категории"
            rules={[{ required: true, message: 'Введите название категории' }]}
          >
            <Input placeholder="Например: iPhone" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
          >
            <TextArea rows={3} placeholder="Краткое описание категории..." />
          </Form.Item>

          <Form.Item label="Иконка категории">
            <Upload
              listType="picture-card"
              maxCount={1}
              fileList={iconFile ? [iconFile] : []}
              onChange={({ fileList }) => setIconFile(fileList[0] || null)}
              customRequest={async ({ file, onSuccess, onError }) => {
                try {
                  const uploadedFile = await handleIconUpload(file);
                  if (uploadedFile) {
                    setIconFile(uploadedFile);
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
              {!iconFile && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Загрузить</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;