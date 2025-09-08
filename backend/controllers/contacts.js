const { validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const Notification = require('../models/Notification');

/**
 * 📞 Создать сообщение обратной связи
 * @route   POST /api/v1/contacts
 * @access  Public
 */
const createContactMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;

    // Создаем новое сообщение
    const contactMessage = new Contact({
      name,
      email,
      subject,
      message,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    await contactMessage.save();

    console.log(`📧 Новое сообщение от ${name} (${email}): ${subject}`);

    // Создаем уведомление для админов
    try {
      const User = require('../models/User');
      const adminUsers = await User.find({ role: 'admin' });

      const adminNotifications = adminUsers.map(admin => ({
        recipient: admin._id,
        type: 'admin_new_message',
        title: {
          ru: 'Новое сообщение от клиента',
          uz: 'Mijozdan yangi xabar',
          en: 'New message from customer'
        },
        message: {
          ru: `${contactMessage.name} (${contactMessage.email}) отправил сообщение: "${contactMessage.subject}"`,
          uz: `${contactMessage.name} (${contactMessage.email}) quyidagi mavzu bo'yicha xabar yubordi: "${contactMessage.subject}"`,
          en: `${contactMessage.name} (${contactMessage.email}) sent message about: "${contactMessage.subject}"`
        },
        priority: 'normal',
        channels: ['in_app', 'email'],
        relatedData: { contact: contactMessage._id },
        metadata: {
          actionUrl: `/admin/contacts/${contactMessage._id}`,
          actionText: 'Просмотреть'
        }
      }));

      await Notification.insertMany(adminNotifications);
      console.log(`📧 Создано ${adminNotifications.length} уведомлений для админов`);
    } catch (notificationError) {
      console.error('❌ Ошибка создания уведомлений:', notificationError);
      // Не прерываем основной процесс из-за ошибок уведомлений
    }

    res.status(201).json({
      success: true,
      message: 'Сообщение успешно отправлено',
      data: {
        id: contactMessage._id,
        createdAt: contactMessage.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Ошибка при создании сообщения:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
};

/**
 * 📋 Получить все сообщения обратной связи
 * @route   GET /api/v1/contacts
 * @access  Private (Admin only)
 */
const getContactMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    // Построить фильтр
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Получить сообщения
    const messages = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Получить общее количество
    const total = await Contact.countDocuments(filter);

    // Получить статистику по статусам
    const stats = await Contact.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statsObj = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, { new: 0, read: 0, replied: 0, closed: 0 });

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: statsObj
      }
    });

  } catch (error) {
    console.error('❌ Ошибка при получении сообщений:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
};

/**
 * 📝 Обновить статус сообщения обратной связи
 * @route   PATCH /api/v1/contacts/:id/status
 * @access  Private (Admin only)
 */
const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      {
        status,
        updatedAt: new Date(),
        ...(status === 'read' && { readAt: new Date() }),
        ...(status === 'replied' && { repliedAt: new Date(), repliedBy: req.user._id })
      },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Сообщение не найдено'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Статус сообщения обновлен',
      data: contact
    });

  } catch (error) {
    console.error('❌ Ошибка при обновлении статуса:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
};

/**
 * 📧 Отправить ответ на сообщение обратной связи
 * @route   POST /api/v1/contacts/:id/reply
 * @access  Private (Admin only)
 */
const replyToContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      {
        status: 'replied',
        repliedAt: new Date(),
        repliedBy: req.user._id,
        replyMessage,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Сообщение не найдено'
      });
    }

    // Создаем уведомление для пользователя
    try {
      // Ищем пользователя по email (если он зарегистрирован)
      const User = require('../models/User');
      let user = await User.findOne({ email: contact.email });

      if (user) {
        // Создаем уведомление для зарегистрированного пользователя
        const notification = new Notification({
          recipient: user._id,
          type: 'customer_support_reply',
          title: Notification.getNotificationTitle('customer_support_reply', 'customer'),
          message: Notification.getNotificationMessage('customer_support_reply', 'customer', {
            subject: contact.subject,
            replyMessage: replyMessage
          }),
          priority: 'normal',
          channels: ['in_app', 'email'],
          relatedData: { contact: contact._id },
          metadata: {
            actionUrl: '/messages',
            actionText: 'Просмотреть'
          }
        });

        await notification.save();
        console.log(`📧 Уведомление создано для пользователя ${contact.email}`);
      } else {
        // Если пользователь не зарегистрирован, просто логируем
        console.log(`📧 Пользователь ${contact.email} не зарегистрирован, уведомление не создано`);
      }
    } catch (notificationError) {
      console.error('❌ Ошибка создания уведомления для пользователя:', notificationError);
      // Не прерываем основной процесс из-за ошибок уведомлений
    }

    // TODO: Отправить email ответ пользователю
    console.log(`📧 Отправка ответа пользователю ${contact.email}: ${replyMessage}`);

    res.status(200).json({
      success: true,
      message: 'Ответ отправлен успешно',
      data: contact
    });

  } catch (error) {
    console.error('❌ Ошибка при отправке ответа:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
};

module.exports = {
  createContactMessage,
  getContactMessages,
  updateContactStatus,
  replyToContact
};
