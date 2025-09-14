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
  Badge,
  Tooltip,
  Row,
  Col,
  Statistic,
  Typography,
  Divider,
  Avatar,
  Rate,
  Popconfirm,
  Image
} from 'antd';
import {
  MessageOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  StarOutlined,
  UserOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  LikeOutlined,
  DislikeOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { reviewsApi, usersApi, productsApi } from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [moderateModalVisible, setModerateModalVisible] = useState(false);
  const [moderateAction, setModerateAction] = useState(null);
  const [form] = Form.useForm();

  // Статистика отзывов
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    averageRating: 0
  });

  // Фильтры
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1,
    limit: 10,
    search: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (params.status === 'all') delete params.status;
      if (!params.search) delete params.search;

      const response = await reviewsApi.getAll(params);
      const reviewsData = response.reviews || response.data || [];
      setReviews(reviewsData);

      // Вычисляем статистику
      const total = reviewsData.length;
      const pending = reviewsData.filter(r => r.status === 'pending').length;
      const approved = reviewsData.filter(r => r.status === 'approved').length;
      const rejected = reviewsData.filter(r => r.status === 'rejected').length;
      const averageRating = reviewsData.length > 0
        ? (reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length).toFixed(1)
        : 0;

      setStats({ total, pending, approved, rejected, averageRating });

    } catch (error) {
      message.error('Ошибка загрузки отзывов: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (action, reviewId, values = {}) => {
    try {
      if (action === 'approve') {
        await reviewsApi.updateStatus(reviewId, 'approved');
        message.success('Отзыв одобрен');
      } else if (action === 'reject') {
        await reviewsApi.updateStatus(reviewId, 'rejected');
        message.success('Отзыв отклонен');
      }

      setModerateModalVisible(false);
      form.resetFields();
      await fetchReviews();
    } catch (error) {
      message.error('Ошибка модерации отзыва: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'На модерации',
      approved: 'Одобрен',
      rejected: 'Отклонен'
    };
    return texts[status] || status;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#52c41a';
    if (rating >= 3) return '#faad14';
    return '#ff4d4f';
  };

  const columns = [
    {
      title: 'Автор',
      dataIndex: 'author',
      key: 'author',
      render: (author, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            icon={<UserOutlined />}
            src={author?.avatar || record.user?.avatar}
            size={40}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {author?.name || record.user?.name || record.authorName || 'Аноним'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {author?.email || record.user?.email || record.authorEmail}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Товар',
      dataIndex: 'product',
      key: 'product',
      render: (product, record) => {
        if (typeof product === 'object' && product?.name) {
          return (
            <div>
              <div style={{ fontWeight: 'bold' }}>{product.name}</div>
              {product.sku && <div style={{ fontSize: '12px', color: '#666' }}>SKU: {product.sku}</div>}
            </div>
          );
        }
        return <span>{record.productName || 'Не указан'}</span>;
      }
    },
    {
      title: 'Рейтинг',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      render: (rating) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Rate disabled value={rating || 0} style={{ fontSize: '14px' }} />
          <span style={{ color: getRatingColor(rating), fontWeight: 'bold' }}>
            {rating || 0}/5
          </span>
        </div>
      )
    },
    {
      title: 'Отзыв',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment) => (
        <div style={{ maxWidth: '300px' }}>
          {comment?.length > 100 ? `${comment.substring(0, 100)}...` : comment}
        </div>
      )
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag icon={status === 'approved' ? <CheckCircleOutlined /> : status === 'rejected' ? <CloseCircleOutlined /> : <ExclamationCircleOutlined />} 
             color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => (
        <div style={{ fontSize: '12px' }}>
          {new Date(createdAt).toLocaleDateString('ru-RU')}
        </div>
      )
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Просмотреть">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => {
                setSelectedReview(record);
                setDetailsVisible(true);
              }}
              size="small"
            />
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Tooltip title="Одобрить">
                <Button 
                  icon={<CheckOutlined />} 
                  onClick={() => {
                    setSelectedReview(record);
                    setModerateAction('approve');
                    setModerateModalVisible(true);
                  }}
                  size="small"
                  type="primary"
                />
              </Tooltip>
              <Tooltip title="Отклонить">
                <Button 
                  icon={<CloseOutlined />} 
                  onClick={() => {
                    setSelectedReview(record);
                    setModerateAction('reject');
                    setModerateModalVisible(true);
                  }}
                  size="small"
                  danger
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
            <MessageOutlined /> Отзывы
          </Title>
          <Text type="secondary">Управление отзывами маркетплейса</Text>
        </div>
      </div>

      {/* Статистика */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={4}>
          <Card 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <Statistic
              title="Всего отзывов"
              value={stats.total}
              prefix={<MessageOutlined style={{ color: '#3b82f6' }} />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={4}>
          <Card 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <Statistic
              title="Средний рейтинг"
              value={stats.averageRating}
              prefix={<StarOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={4}>
          <Card 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <Statistic
              title="На модерации"
              value={stats.pending}
              prefix={<ExclamationCircleOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={4}>
          <Card 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <Statistic
              title="Одобренные"
              value={stats.approved}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={4}>
          <Card 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}
          >
            <Statistic
              title="Отклоненные"
              value={stats.rejected}
              prefix={<CloseCircleOutlined style={{ color: '#ef4444' }} />}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Таблица отзывов */}
      <Card 
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0'
        }}
      >
        <Table
          dataSource={reviews}
          columns={columns}
          loading={loading}
          rowKey={(record) => record._id || record.id}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Модал для просмотра деталей отзыва */}
      <Modal
        title="Детали отзыва"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={700}
      >
        {selectedReview && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <Avatar
                icon={<UserOutlined />}
                src={selectedReview.author?.avatar || selectedReview.user?.avatar}
                size={60}
              />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {selectedReview.author?.name || selectedReview.user?.name || selectedReview.authorName || 'Аноним'}
                </Title>
                <Text type="secondary">{selectedReview.author?.email || selectedReview.user?.email || selectedReview.authorEmail}</Text>
              </div>
            </div>
            
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Рейтинг">
                <Rate disabled value={selectedReview.rating || 0} />
              </Descriptions.Item>
              <Descriptions.Item label="Статус">
                <Tag icon={selectedReview.status === 'approved' ? <CheckCircleOutlined /> : selectedReview.status === 'rejected' ? <CloseCircleOutlined /> : <ExclamationCircleOutlined />} 
                     color={getStatusColor(selectedReview.status)}>
                  {getStatusText(selectedReview.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Дата">
                {new Date(selectedReview.createdAt).toLocaleString('ru-RU')}
              </Descriptions.Item>
              <Descriptions.Item label="Товар">
                {selectedReview.product?.name || selectedReview.productName || 'Не указан'}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider>Отзыв</Divider>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <Text>{selectedReview.comment}</Text>
            </div>
            
            {selectedReview.images && selectedReview.images.length > 0 && (
              <>
                <Divider>Изображения</Divider>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedReview.images.map((image, index) => (
                    <Image
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ))}
                </div>
              </>
            )}
            
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              {selectedReview.status === 'pending' && (
                <Space>
                  <Button 
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => {
                      setSelectedReview(selectedReview);
                      setModerateAction('approve');
                      setModerateModalVisible(true);
                      setDetailsVisible(false);
                    }}
                  >
                    Одобрить
                  </Button>
                  <Button 
                    icon={<CloseOutlined />}
                    onClick={() => {
                      setSelectedReview(selectedReview);
                      setModerateAction('reject');
                      setModerateModalVisible(true);
                      setDetailsVisible(false);
                    }}
                    danger
                  >
                    Отклонить
                  </Button>
                </Space>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Модал для модерации отзыва */}
      <Modal
        title={moderateAction === 'approve' ? 'Одобрить отзыв' : 'Отклонить отзыв'}
        open={moderateModalVisible}
        onCancel={() => setModerateModalVisible(false)}
        onOk={() => form.submit()}
        okText={moderateAction === 'approve' ? 'Одобрить' : 'Отклонить'}
        okType={moderateAction === 'approve' ? 'primary' : 'danger'}
        cancelText="Отмена"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => handleModerate(moderateAction, selectedReview?._id || selectedReview?.id, values)}
        >
          {moderateAction === 'reject' && (
            <Form.Item
              name="reason"
              label="Причина отклонения"
              rules={[{ required: true, message: 'Пожалуйста, укажите причину отклонения' }]}
            >
              <TextArea placeholder="Укажите причину отклонения отзыва" rows={3} />
            </Form.Item>
          )}
          <Text>
            Вы уверены, что хотите {moderateAction === 'approve' ? 'одобрить' : 'отклонить'} этот отзыв?
          </Text>
        </Form>
      </Modal>
    </div>
  );
};

export default Reviews;