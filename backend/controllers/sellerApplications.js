const SellerApplication = require('../models/SellerApplication');
const User = require('../models/User');
const Seller = require('../models/Seller');

// @desc    Create seller application
// @route   POST /api/v1/seller-applications
// @access  Public
exports.createApplication = async (req, res) => {
  try {
    console.log('📝 Создание новой заявки продавца...');
    console.log('Данные:', req.body);
    
    // Получаем ID пользователя из токена (если авторизован)
    const userId = req.user ? req.user.id : null;
    
    // Проверяем, есть ли уже заявка от этого пользователя
    if (userId) {
      const existingApp = await SellerApplication.findOne({ userId });
      if (existingApp) {
        return res.status(400).json({
          success: false,
          message: 'У вас уже есть активная заявка'
        });
      }
    }
    
    // Создаем заявку
    const applicationData = {
      status: 'pending',
      businessInfo: {
        companyName: req.body.businessName || req.body.companyName,
        registrationNumber: req.body.registrationNumber || 'TEMP-' + Date.now(),
        taxId: req.body.taxId || 'TAX-' + Date.now(),
        address: {
          street: req.body.address || '',
          city: req.body.city || 'Ташкент',
          state: req.body.region || 'Ташкент',
          postalCode: req.body.postalCode || '100000',
          country: 'Узбекистан'
        },
        description: req.body.businessDescription || req.body.description || '',
        website: req.body.website || '',
        phone: req.body.businessPhone || req.body.phone
      },
      contactInfo: {
        contactPerson: req.body.contactName || req.body.fullName,
        position: req.body.position || 'Директор',
        email: req.body.email,
        phone: req.body.phone
      },
      documents: {
        businessLicense: req.body.businessLicense || '/uploads/placeholder.pdf',
        taxCertificate: req.body.taxCertificate || '/uploads/placeholder.pdf',
        identityDocument: req.body.identityDocument || '/uploads/placeholder.pdf',
        bankStatement: req.body.bankStatement || ''
      },
      productCategories: req.body.categories || req.body.productCategories || ['Разное'],
      expectedMonthlyRevenue: parseInt(req.body.expectedRevenue) || 0,
      salesExperience: req.body.experience || 'none',
      additionalInfo: req.body.additionalInfo || req.body.comments || ''
    };
    
    // Если пользователь авторизован, добавляем его ID
    if (userId) {
      applicationData.userId = userId;
    } else {
      // Для неавторизованных заявок создаем временного пользователя или просто пропускаем userId
      // В продакшене лучше требовать авторизацию, но для тестирования разрешаем
      console.log('⚠️ Заявка без авторизации - разрешено в тестовом режиме');
    }
    
    const application = new SellerApplication(applicationData);
    await application.save();
    
    console.log('✅ Заявка создана:', application._id);
    
    res.status(201).json({
      success: true,
      message: 'Заявка успешно отправлена на рассмотрение',
      data: {
        id: application._id,
        status: application.status,
        createdAt: application.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка создания заявки:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при создании заявки',
      error: error.message
    });
  }
};

// @desc    Get all seller applications
// @route   GET /api/v1/admin/seller-applications
// @access  Private (Admin)
exports.getApplications = async (req, res) => {
  try {
  console.log('📋 Получаем заявки продавцов...');
  
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const status = req.query.status;
  
  // Строим фильтр
  let filter = {};
  if (status) {
    filter.status = status;
  }
  
  const startIndex = (page - 1) * limit;
  
  // Получаем заявки с информацией о пользователе
  const applications = await SellerApplication.find(filter)
    .populate('userId', 'username email avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);
    
  const total = await SellerApplication.countDocuments(filter);
  
  // Pagination result
  const pagination = {};
  
  if (startIndex + limit < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  
  console.log(`✅ Найдено ${applications.length} заявок из ${total}`);
  
  res.status(200).json({
    success: true,
    count: applications.length,
    total,
    pagination,
    data: applications
  });
  } catch (error) {
    console.error('❌ Ошибка получения заявок:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении заявок'
    });
  }
};

// @desc    Get single seller application
// @route   GET /api/v1/admin/seller-applications/:id
// @access  Private (Admin)
exports.getApplication = async (req, res) => {
  try {
  const application = await SellerApplication.findById(req.params.id)
    .populate('userId', 'username email avatar phone createdAt');
    
  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Заявка не найдена'
    });
  }
  
  res.status(200).json({
    success: true,
    data: application
  });
  } catch (error) {
    console.error('❌ Ошибка получения заявки:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении заявки'
    });
  }
};

// @desc    Approve seller application
// @route   PUT /api/v1/admin/seller-applications/:id/approve
// @access  Private (Admin)
exports.approveApplication = async (req, res) => {
  try {
  console.log(`🟢 Одобряем заявку ${req.params.id}...`);
  
  const application = await SellerApplication.findById(req.params.id);
  
  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Заявка не найдена'
    });
  }
  
  if (application.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Можно одобрить только заявки со статусом "pending"'
    });
  }
  
  // Обновляем статус заявки
  application.status = 'approved';
  application.processedAt = new Date();
  application.processedBy = req.user._id;
  
  if (req.body.notes) {
    application.adminNotes = req.body.notes;
  }
  
  await application.save();
  
  // Обновляем пользователя - делаем его продавцом
  const user = await User.findById(application.userId);
  if (user) {
    user.role = 'seller';
    user.sellerProfile = {
      businessName: application.businessInfo.companyName,
      description: application.businessInfo.description || '',
      isApproved: true,
      approvedAt: new Date(),
      approvedBy: req.user._id,
      commissionRate: 0.05, // 5% комиссия по умолчанию
      status: 'active'
    };
    
    await user.save();
    console.log(`✅ Пользователь ${user.username} теперь продавец`);
  }
  
  // Можем отправить уведомление пользователю (добавим позже)
  
  res.status(200).json({
    success: true,
    message: 'Заявка одобрена',
    data: application
  });
  } catch (error) {
    console.error('❌ Ошибка одобрения заявки:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при одобрении заявки'
    });
  }
};

// @desc    Reject seller application
// @route   PUT /api/v1/admin/seller-applications/:id/reject
// @access  Private (Admin)
exports.rejectApplication = async (req, res) => {
  try {
  console.log(`🔴 Отклоняем заявку ${req.params.id}...`);
  
  const application = await SellerApplication.findById(req.params.id);
  
  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Заявка не найдена'
    });
  }
  
  if (application.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Можно отклонить только заявки со статусом "pending"'
    });
  }
  
  // Обновляем статус заявки
  application.status = 'rejected';
  application.processedAt = new Date();
  application.processedBy = req.user._id;
  
  if (req.body.reason) {
    application.rejectionReason = req.body.reason;
  }
  
  if (req.body.notes) {
    application.adminNotes = req.body.notes;
  }
  
  await application.save();
  
  // Можем отправить уведомление пользователю (добавим позже)
  
  res.status(200).json({
    success: true,
    message: 'Заявка отклонена',
    data: application
  });
  } catch (error) {
    console.error('❌ Ошибка отклонения заявки:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при отклонении заявки'
    });
  }
};

// @desc    Request additional documents
// @route   PUT /api/v1/admin/seller-applications/:id/request-documents
// @access  Private (Admin)
exports.requestDocuments = async (req, res) => {
  try {
  console.log(`📄 Запрашиваем документы для заявки ${req.params.id}...`);
  
  const application = await SellerApplication.findById(req.params.id);
  
  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Заявка не найдена'
    });
  }
  
  if (application.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Можно запросить документы только для заявок со статусом "pending"'
    });
  }
  
  // Обновляем статус заявки
  application.status = 'documents_required';
  application.processedAt = new Date();
  application.processedBy = req.user._id;
  
  if (req.body.requiredDocuments) {
    application.requiredDocuments = req.body.requiredDocuments;
  }
  
  if (req.body.notes) {
    application.adminNotes = req.body.notes;
  }
  
  await application.save();
  
  // Можем отправить уведомление пользователю (добавим позже)
  
  res.status(200).json({
    success: true,
    message: 'Запрошены дополнительные документы',
    data: application
  });
  } catch (error) {
    console.error('❌ Ошибка запроса документов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при запросе документов'
    });
  }
};

// @desc    Get seller applications statistics
// @route   GET /api/v1/admin/seller-applications/stats
// @access  Private (Admin)
exports.getApplicationStats = async (req, res) => {
  try {
  console.log('📊 Получаем статистику заявок...');
  
  // Агрегация статистики
  const stats = await SellerApplication.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Статистика по периодам
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const [
    totalCount,
    weekCount,
    monthCount,
    pendingCount
  ] = await Promise.all([
    SellerApplication.countDocuments(),
    SellerApplication.countDocuments({ createdAt: { $gte: weekAgo } }),
    SellerApplication.countDocuments({ createdAt: { $gte: monthAgo } }),
    SellerApplication.countDocuments({ status: 'pending' })
  ]);
  
  // Преобразуем статистику в удобный формат
  const statusStats = {
    pending: 0,
    approved: 0,
    rejected: 0,
    documents_required: 0
  };
  
  stats.forEach(stat => {
    if (statusStats.hasOwnProperty(stat._id)) {
      statusStats[stat._id] = stat.count;
    }
  });
  
  const result = {
    total: totalCount,
    byStatus: statusStats,
    recent: {
      thisWeek: weekCount,
      thisMonth: monthCount
    },
    pending: pendingCount
  };
  
  console.log('✅ Статистика заявок получена:', result);
  
  res.status(200).json({
    success: true,
    data: result
  });
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении статистики'
    });
  }
};

// @desc    Get current user's seller application status
// @route   GET /api/v1/seller-applications/status
// @access  Private (Auth)
exports.getMyApplicationStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Необходима авторизация' });
    }

    // Если уже есть профиль продавца — считаем одобренным
    const existingSeller = await Seller.findOne({ userId: req.user._id }).select('_id status').lean();
    if (existingSeller) {
      return res.json({ success: true, status: 'approved', data: { sellerStatus: existingSeller.status } });
    }

    // Ищем последнюю заявку пользователя
    const lastApplication = await SellerApplication
      .findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('status createdAt updatedAt processedAt rejectionReason requiredDocuments')
      .lean();

    if (!lastApplication) {
      return res.json({ success: true, status: 'none' });
    }

    return res.json({ success: true, status: lastApplication.status, data: lastApplication });
  } catch (error) {
    console.error('❌ Ошибка получения статуса заявки:', error.message);
    res.status(500).json({ success: false, message: 'Ошибка сервера при получении статуса заявки' });
  }
};