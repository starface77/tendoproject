import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, InputNumber, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { bannersApi, uploadApi } from '../services/api';

const Banners = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageType, setImageType] = useState('url'); // 'url' или 'upload'
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await bannersApi.getAdminBanners();
      setData(res.data || []);
    } catch (e) {
      message.error('Не удалось загрузить баннеры');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setImageType('url');
    setIsModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    // Определяем тип изображения по URL
    setImageType(record.imageUrl && record.imageUrl.startsWith('http') ? 'url' : 'upload');
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await bannersApi.updateBanner(editing._id, values);
        message.success('Баннер обновлен');
      } else {
        await bannersApi.createBanner(values);
        message.success('Баннер создан');
      }
      setIsModalOpen(false);
      load();
    } catch (e) {
      message.error('Ошибка');
    }
  };

  const handleDelete = async (id) => {
        try {
      await bannersApi.deleteBanner(id);
      message.success('Баннер удален');
          load();
        } catch (e) {
          message.error('Ошибка удаления');
        }
  };

  const handleUpload = async (file) => {
        setUploading(true);
    try {
      const response = await uploadApi.uploadImage(file, 'banner');
      console.log('Upload response:', response);
      
      const imageUrl = response.data?.data?.url || response.data?.url || response.url;
      console.log('Setting imageUrl:', imageUrl);
      
      if (imageUrl) {
        form.setFieldsValue({ imageUrl });
          message.success('Изображение загружено');
        } else {
        throw new Error('Не получен URL изображения');
      }
    } catch (e) {
      console.error('Upload error:', e);
      message.error('Ошибка загрузки изображения: ' + e.message);
    } finally {
      setUploading(false);
    }
    return false; // prevent default upload
  };

  const uploadProps = {
    accept: 'image/*',
    beforeUpload: handleUpload,
    showUploadList: false,
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Изображение',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (imageUrl) => (
        <img src={imageUrl} alt="banner" style={{ width: 100, height: 50, objectFit: 'cover' }} />
      ),
    },
    {
      title: 'Активен',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Switch checked={isActive} disabled />
      ),
    },
    {
      title: 'Порядок',
      dataIndex: 'order',
      key: 'order',
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => openEdit(record)}>Редактировать</Button>
          <Button danger onClick={() => handleDelete(record._id)}>Удалить</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreate}>Добавить баннер</Button>
      </Space>

      <Table
        loading={loading}
        dataSource={data}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? 'Редактировать баннер' : 'Создать баннер'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Название"
            name="title"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Описание"
            name="description"
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            label="Ссылка"
            name="targetUrl"
          >
            <Input />
          </Form.Item>

          <Form.Item label="Тип изображения">
            <div style={{ marginBottom: 16 }}>
              <Button.Group>
                <Button 
                  type={imageType === 'url' ? 'primary' : 'default'}
                  onClick={() => setImageType('url')}
                >
                  Ввести URL
                </Button>
                <Button 
                  type={imageType === 'upload' ? 'primary' : 'default'}
                  onClick={() => setImageType('upload')}
                >
                  Загрузить файл
                </Button>
              </Button.Group>
            </div>

            {imageType === 'url' ? (
              <Form.Item
                name="imageUrl"
                rules={[{ required: true, message: 'Введите URL изображения' }]}
              >
                <Input 
                  placeholder="https://example.com/image.jpg" 
                  onChange={(e) => {
                    // Автоматически показываем preview при вводе URL
                    const url = e.target.value;
                    if (url) {
                      form.setFieldsValue({ imageUrl: url });
                    }
                  }}
                />
              </Form.Item>
            ) : (
              <Form.Item
                name="imageUrl"
                rules={[{ required: true, message: 'Загрузите изображение' }]}
              >
                <Upload {...uploadProps} maxCount={1}>
                  <Button icon={<UploadOutlined />} loading={uploading}>
                    Выберите изображение
                </Button>
              </Upload>
              </Form.Item>
            )}

            {/* Preview изображения */}
            {form.getFieldValue('imageUrl') && (
              <div style={{ marginTop: 10 }}>
                <div style={{ marginBottom: 5, fontSize: '12px', color: '#666' }}>
                  Предварительный просмотр:
                </div>
                <img
                  src={form.getFieldValue('imageUrl')}
                  alt="preview"
                  style={{ 
                    width: 200, 
                    height: 100, 
                    objectFit: 'cover',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div 
                  style={{ 
                    display: 'none', 
                    width: 200, 
                    height: 100, 
                    border: '1px dashed #d9d9d9',
                    borderRadius: '6px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '12px'
                  }}
                >
                  Ошибка загрузки изображения
                </div>
            </div>
            )}
          </Form.Item>

          <Form.Item
            label="Порядок сортировки"
            name="order"
            initialValue={0}
          >
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item
            label="Активен"
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Banners;