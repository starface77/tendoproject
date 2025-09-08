import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Switch, 
  Button,
  message, 
  Tabs, 
  InputNumber,
  Select,
  ColorPicker,
  Space,
  Divider,
  Typography,
  Alert,
  Popconfirm,
  Spin
} from 'antd';
import {
  SaveOutlined, 
  ReloadOutlined, 
  SettingOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { dashboardApi } from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const Settings = () => {
  const [form] = Form.useForm();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Категории настроек
  const categories = {
    general: {
      title: 'Общие настройки', 
      icon: <SettingOutlined />,
      description: 'Основные настройки маркетплейса'
    },
    payments: { 
      title: 'Платежи', 
      icon: '💳',
      description: 'Настройки платежных систем'
    },
    delivery: { 
      title: 'Доставка', 
      icon: '🚚',
      description: 'Параметры доставки товаров'
    },
    appearance: { 
      title: 'Внешний вид', 
      icon: '🎨',
      description: 'Настройки дизайна и отображения'
    },
    social: { 
      title: 'Социальные сети', 
      icon: '📱',
      description: 'Ссылки на социальные сети'
    },
    notifications: { 
      title: 'Уведомления', 
      icon: '🔔',
      description: 'Настройки уведомлений'
    },
    security: { 
      title: 'Безопасность', 
      icon: '🔐',
      description: 'Параметры безопасности'
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getSettings();
      
      if (response.success) {
        setSettings(response.data);
        
        // Создаем объект значений для формы
        const formValues = {};
        Object.values(response.data).flat().forEach(setting => {
          formValues[setting.key] = setting.value;
        });
        
        form.setFieldsValue(formValues);
      } else {
        message.error('Ошибка загрузки настроек');
      }
    } catch (error) {
      console.error('Settings loading error:', error);
      message.error('Не удалось загрузить настройки');
      
      // Инициализируем настройки по умолчанию
      try {
        await initializeSettings();
      } catch (initError) {
        console.error('Initialize settings error:', initError);
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeSettings = async () => {
    try {
      const response = await dashboardApi.initializeSettings();
      if (response.success) {
        message.success('Настройки инициализированы');
        await loadSettings();
      }
    } catch (error) {
      console.error('Initialize error:', error);
    }
  };

  const handleSave = async (values) => {
    try {
      setSaving(true);
      
      const response = await dashboardApi.updateSettings(values);
      
      if (response.success) {
        message.success('Настройки сохранены');
        await loadSettings();
      } else {
        message.error('Ошибка сохранения настроек');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      message.error('Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (category = null) => {
    try {
      const response = await dashboardApi.resetSettings(category);
      
      if (response.success) {
        message.success('Настройки сброшены к значениям по умолчанию');
        await loadSettings();
      } else {
        message.error('Ошибка сброса настроек');
      }
    } catch (error) {
      console.error('Reset settings error:', error);
      message.error('Не удалось сбросить настройки');
    }
  };

  const renderField = (setting) => {
    const { key, value, meta } = setting;
    const { fieldType, title, description, options, validation } = meta;

    const commonProps = {
      placeholder: description?.ru,
      ...(validation?.required && { rules: [{ required: true, message: 'Поле обязательно' }] })
    };

    switch (fieldType) {
      case 'text':
        return <Input {...commonProps} />;
        
      case 'textarea':
        return <TextArea rows={3} {...commonProps} />;
        
      case 'number':
        return (
          <InputNumber 
            style={{ width: '100%' }}
            min={validation?.min}
            max={validation?.max}
            {...commonProps}
          />
        );
        
      case 'boolean':
        return <Switch checkedChildren="Включено" unCheckedChildren="Выключено" />;
        
      case 'select':
        return (
          <Select {...commonProps}>
            {options?.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label.ru || option.label.en}
              </Option>
            ))}
          </Select>
        );
        
      case 'color':
        return <ColorPicker showText format="hex" />;
        
      case 'url':
        return <Input addonBefore="https://" {...commonProps} />;
        
      case 'email':
        return <Input type="email" {...commonProps} />;
        
      default:
        return <Input {...commonProps} />;
    }
  };

  const renderCategorySettings = (categoryKey) => {
    const categorySettings = settings[categoryKey] || [];
    
    if (categorySettings.length === 0) {
    return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary">Настройки в этой категории не найдены</Text>
      </div>
    );
  }

  return (
    <div>
        <div style={{ marginBottom: 24 }}>
          <Title level={4}>{categories[categoryKey]?.title}</Title>
          <Text type="secondary">{categories[categoryKey]?.description}</Text>
        </div>
        
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {categorySettings.map((setting) => (
            <Card key={setting.key} size="small">
              <Form.Item
                name={setting.key}
                label={
                  <div>
                    <Text strong>{setting.meta.title.ru}</Text>
                    {setting.meta.description?.ru && (
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {setting.meta.description.ru}
                        </Text>
                      </div>
                    )}
                  </div>
                }
                style={{ marginBottom: 0 }}
              >
                {renderField(setting)}
              </Form.Item>

              {setting.meta.requiresRestart && (
                <Alert
                  message="Требует перезагрузки сервера"
                  type="warning"
                  size="small"
                  style={{ marginTop: 8 }}
                />
              )}
          </Card>
          ))}
        </Space>

              <Divider />

        <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
            onClick={() => form.submit()}
            loading={saving}
          >
            Сохранить изменения
          </Button>
          
          <Popconfirm
            title="Сбросить настройки этой категории?"
            description="Все значения будут заменены на значения по умолчанию"
            onConfirm={() => handleReset(categoryKey)}
            okText="Сбросить"
            cancelText="Отмена"
          >
            <Button icon={<ReloadOutlined />}>
              Сбросить категорию
              </Button>
          </Popconfirm>
        </Space>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Загрузка настроек...</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>⚙️ Настройки системы</Title>
        <Text type="secondary">
          Управление параметрами маркетплейса без необходимости редактирования кода
        </Text>
      </div>

      <Card>
            <Form
          form={form}
              layout="vertical"
          onFinish={handleSave}
        >
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            type="card"
          >
            {Object.entries(categories).map(([key, category]) => (
              <TabPane
                tab={
                  <span>
                    {category.icon} {category.title}
                  </span>
                }
                key={key}
              >
                {renderCategorySettings(key)}
              </TabPane>
            ))}
          </Tabs>
            </Form>
          </Card>

      {/* Глобальные действия */}
      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Глобальные действия</Title>
        <Space>
              <Button
                type="primary"
            size="large"
                icon={<SaveOutlined />}
            onClick={() => form.submit()}
            loading={saving}
              >
            Сохранить все изменения
              </Button>
          
          <Popconfirm
            title="Сбросить ВСЕ настройки?"
            description="Все настройки будут заменены на значения по умолчанию. Это действие необратимо!"
            onConfirm={() => handleReset()}
            okText="Сбросить всё"
            cancelText="Отмена"
          >
            <Button 
              danger
              icon={<ReloadOutlined />}
            >
              Сбросить всё
            </Button>
          </Popconfirm>
          
                      <Button
            icon={<PlusOutlined />}
            onClick={initializeSettings}
          >
            Инициализировать настройки
                      </Button>
        </Space>
                </Card>
    </div>
  );
};

export default Settings;