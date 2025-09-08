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
  ExclamationCircleOutlined
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
        await reviewsApi.approve(reviewId);
        message.success('Отзыв одобрен');
      } else if (action === 'reject') {
        await reviewsApi.reject(reviewId);
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
      ellipsis: true,
      render: (comment) => (
        <div style={{ maxWidth: 200 }}>
          {comment && comment.length > 100 ? `${comment.substring(0, 100)}...` : comment}
        </div>
      )
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => new Date(date).toLocaleString('ru-RU')
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Посмотреть детали">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setSelectedReview(record);
                setDetailsVisible(true);
              }}
            />
          </Tooltip>

          {record.status === 'pending' && (
            <>
              <Tooltip title="Одобрить">
                <Button
                  icon={<CheckOutlined />}
                  size="small"
                  type="primary"
                  onClick={() => {
                    setSelectedReview(record);
                    setModerateAction('approve');
                    handleModerate('approve', record._id || record.id);
                  }}
                />
              </Tooltip>

              <Tooltip title="Отклонить">
                <Button
                  icon={<CloseOutlined />}
                  size="small"
                  danger
                  onClick={() => {
                    setSelectedReview(record);
                    setModerateAction('reject');
                    setModerateModalVisible(true);
                  }}
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
      <Title level={2}>
        <MessageOutlined /> Управление отзывами
      </Title>

      {/* Статистика отзывов */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={5}>
          <Card>
            <Statistic
              title="Всего отзывов"
              value={stats.total}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="На модерации"
              value={stats.pending}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Одобрено"
              value={stats.approved}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Отклонено"
              value={stats.rejected}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Средний рейтинг"
              value={stats.averageRating}
              prefix={<StarOutlined />}
              suffix="/5"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Фильтры */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>Фильтры:</Text>
          </Col>
          <Col span={8}>
            <Input.Search
              placeholder="Поиск по автору или товару..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              onSearch={() => fetchReviews()}
            />
          </Col>
          <Col span={6}>
            <Select
              value={filters.status}
              style={{ width: '100%' }}
              onChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
            >
              <Option value="all">Все статусы</Option>
              <Option value="pending">На модерации</Option>
              <Option value="approved">Одобрено</Option>
              <Option value="rejected">Отклонено</Option>
            </Select>
          </Col>
          <Col>
            <Button onClick={() => setFilters({ status: 'all', page: 1, limit: 10, search: '' })}>
              Сбросить
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Таблица отзывов */}
      <Card>
        <Table
          columns={columns}
          dataSource={reviews}
          loading={loading}
          rowKey={(record) => record._id || record.id}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            onChange: (page, pageSize) => {
              setFilters({ ...filters, page, limit: pageSize });
            }
          }}
        />
      </Card>

      {/* Модалка деталей отзыва */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Детали отзыва
          </Space>
        }
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={800}
      >
        {selectedReview && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Статус" span={2}>
                <Tag color={getStatusColor(selectedReview.status)}>
                  {getStatusText(selectedReview.status)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Автор">
                <UserOutlined /> {selectedReview.author?.name || selectedReview.user?.name || selectedReview.authorName || 'Аноним'}
              </Descriptions.Item>
              <Descriptions.Item label="Email автора">
                {selectedReview.author?.email || selectedReview.user?.email || selectedReview.authorEmail || 'Не указан'}
              </Descriptions.Item>

              <Descriptions.Item label="Товар" span={2}>
                <ShoppingOutlined /> {selectedReview.product?.name || selectedReview.productName || 'Не указан'}
              </Descriptions.Item>

              <Descriptions.Item label="Рейтинг" span={2}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Rate disabled value={selectedReview.rating || 0} />
                  <span style={{ color: getRatingColor(selectedReview.rating), fontWeight: 'bold', fontSize: '16px' }}>
                    {selectedReview.rating || 0}/5
                  </span>
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Дата создания">
                <CalendarOutlined /> {new Date(selectedReview.createdAt).toLocaleString('ru-RU')}
              </Descriptions.Item>
              <Descriptions.Item label="Последнее обновление">
                <CalendarOutlined /> {new Date(selectedReview.updatedAt).toLocaleString('ru-RU')}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Текст отзыва:</Title>
            <div style={{
              padding: '16px',
              background: '#f5f5f5',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              {selectedReview.comment || 'Текст отзыва отсутствует'}
            </div>

            {selectedReview.images && selectedReview.images.length > 0 && (
              <>
                <Divider />
                <Title level={5}>Изображения:</Title>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedReview.images.map((image, index) => (
                    <Image
                      key={index}
                      width={100}
                      height={100}
                      src={image}
                      style={{ objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ))}
                </div>
              </>
            )}

            {selectedReview.helpful && (
              <>
                <Divider />
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Полезно"
                      value={selectedReview.helpful}
                      prefix={<LikeOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Не полезно"
                      value={selectedReview.notHelpful || 0}
                      prefix={<DislikeOutlined />}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                </Row>
              </>
            )}

            {selectedReview.moderatorComment && (
              <>
                <Divider />
                <Title level={5}>Комментарий модератора:</Title>
                <Text type="secondary">{selectedReview.moderatorComment}</Text>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Модалка модерации */}
      <Modal
        title={
          moderateAction === 'approve' ? 'Одобрить отзыв' :
          moderateAction === 'reject' ? 'Отклонить отзыв' :
          'Модерация отзыва'
        }
        open={moderateModalVisible}
        onCancel={() => {
          setModerateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => handleModerate(moderateAction, selectedReview._id || selectedReview.id, values)}
        >
          {moderateAction === 'reject' && (
            <Form.Item
              name="reason"
              label="Причина отклонения"
              rules={[{ required: true, message: 'Укажите причину отклонения' }]}
            >
              <TextArea
                rows={4}
                placeholder="Укажите причину отклонения отзыва..."
              />
            </Form.Item>
          )}

          <Form.Item
            name="moderatorComment"
            label="Комментарий модератора (необязательно)"
          >
            <TextArea
              rows={3}
              placeholder="Дополнительный комментарий..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Reviews;