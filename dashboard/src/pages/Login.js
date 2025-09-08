import React from 'react';
import { Form, Input, Button, Card, message, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined } from '@ant-design/icons';
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
      background: 'linear-gradient(135deg, #F2D024 0%, #D69E2E 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          borderRadius: '16px'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Space direction="vertical" size="small">
            <CrownOutlined style={{ fontSize: '48px', color: '#F2D024' }} />
            <Title level={2} style={{ margin: 0, color: '#1A202C' }}>
              Chexol.uz
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
            email: '',
            password: ''
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
              placeholder="admin@chexol.uz"
              size="large"
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
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                background: '#F2D024',
                borderColor: '#F2D024',
                height: '48px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px',
          padding: '16px',
          background: '#F8F9FA',
          borderRadius: '8px'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Введите учетные данные администратора
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
