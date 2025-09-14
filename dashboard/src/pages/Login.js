import React from 'react';
import { Form, Input, Button, Card, message, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { email, password } = values;
    const result = await login(email, password);
    
    if (result.success) {
      message.success('Успешный вход в систему!');
      navigate('/dashboard');
    } else {
      message.error(result.error || 'Ошибка авторизации');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}
        bodyStyle={{ padding: '30px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Space direction="vertical" size="small">
            <HomeOutlined style={{ fontSize: '36px', color: '#3b82f6' }} />
            <Title level={3} style={{ margin: 0, color: '#1A202C' }}>
              Tendo Market
            </Title>
            <Text type="secondary">Админ панель</Text>
          </Space>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          initialValues={{
            email: 'admin@tendo.uz',
            password: 'admin123456'
          }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Введите email!' },
              { type: 'email', message: 'Некорректный email!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="admin@tendo.uz"
              size="middle"
            />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: 'Введите пароль!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Введите пароль"
              size="middle"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '16px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="middle"
              style={{
                height: '36px',
                fontWeight: '500'
              }}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '16px',
          padding: '12px',
          background: '#f1f5f9',
          borderRadius: '6px'
        }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Демо доступ: admin@tendo.uz / admin123456
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;