const Chat = require('../models/Chat');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Product = require('../models/Product');

// @desc    Создать или получить чат между покупателем и продавцом
// @route   POST /api/v1/chats/start
// @access  Private (Customer)
const startChat = async (req, res) => {
  try {
    const { sellerId, productId, initialMessage } = req.body;
    const customerId = req.user.id;

    console.log('🚀 Создание чата:', { customerId, sellerId, productId });

    // Проверяем существование продавца
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Продавец не найден'
      });
    }

    // Проверяем существование покупателя
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Покупатель не найден'
      });
    }

    // Проверяем товар (если указан)
    let product = null;
    if (productId) {
      product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Товар не найден'
        });
      }
    }

    // Ищем существующий чат
    let chat = await Chat.findChatByParticipants(customerId, sellerId, productId);

    // Если чат не существует, создаем новый
    if (!chat) {
      const chatData = {
        customer: {
          id: customer._id,
          name: customer.firstName + ' ' + customer.lastName,
          email: customer.email
        },
        seller: {
          id: seller._id,
          businessName: seller.businessName,
          email: seller.email
        }
      };

      // Добавляем информацию о товаре если есть
      if (product) {
        chatData.product = {
          id: product._id,
          name: product.name,
          image: product.images && product.images[0] ? product.images[0] : null
        };
      }

      chat = new Chat(chatData);
      await chat.save();
    }

    // Добавляем начальное сообщение если есть
    if (initialMessage && initialMessage.trim()) {
      await chat.addMessage('customer', customer.firstName + ' ' + customer.lastName, initialMessage.trim());
    }

    res.status(200).json({
      success: true,
      data: {
        chatId: chat._id,
        chat: chat
      }
    });

  } catch (error) {
    console.error('❌ Ошибка создания чата:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при создании чата'
    });
  }
};

// @desc    Отправить сообщение в чат
// @route   POST /api/v1/chats/:chatId/messages
// @access  Private (Customer/Seller)
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, attachments = [] } = req.body;
    const userId = req.user.id;
    const userType = req.user.role || 'customer'; // customer или seller

    console.log('💬 Отправка сообщения:', { chatId, userId, userType, content });

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Сообщение не может быть пустым'
      });
    }

    // Находим чат
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Чат не найден'
      });
    }

    // Проверяем права доступа
    const isCustomer = chat.customer.id.toString() === userId;
    const isSeller = chat.seller.id.toString() === userId;
    
    if (!isCustomer && !isSeller) {
      return res.status(403).json({
        success: false,
        error: 'Нет доступа к этому чату'
      });
    }

    // Определяем отправителя
    const senderType = isCustomer ? 'customer' : 'seller';
    const senderName = isCustomer ? chat.customer.name : chat.seller.businessName;

    // Добавляем сообщение
    await chat.addMessage(senderType, senderName, content.trim(), attachments);

    res.status(200).json({
      success: true,
      data: {
        message: 'Сообщение отправлено',
        chat: chat
      }
    });

  } catch (error) {
    console.error('❌ Ошибка отправки сообщения:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при отправке сообщения'
    });
  }
};

// @desc    Получить список чатов для покупателя
// @route   GET /api/v1/chats/customer
// @access  Private (Customer)
const getCustomerChats = async (req, res) => {
  try {
    const customerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const chats = await Chat.getCustomerChats(customerId, page, limit);

    res.status(200).json({
      success: true,
      data: {
        chats: chats,
        pagination: {
          page,
          limit,
          total: chats.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Ошибка получения чатов покупателя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении чатов'
    });
  }
};

// @desc    Получить список чатов для продавца
// @route   GET /api/v1/chats/seller
// @access  Private (Seller)
const getSellerChats = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const chats = await Chat.getSellerChats(sellerId, page, limit);

    res.status(200).json({
      success: true,
      data: {
        chats: chats,
        pagination: {
          page,
          limit,
          total: chats.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Ошибка получения чатов продавца:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении чатов'
    });
  }
};

// @desc    Получить конкретный чат с сообщениями
// @route   GET /api/v1/chats/:chatId
// @access  Private (Customer/Seller)
const getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Чат не найден'
      });
    }

    // Проверяем права доступа
    const isCustomer = chat.customer.id.toString() === userId;
    const isSeller = chat.seller.id.toString() === userId;
    
    if (!isCustomer && !isSeller) {
      return res.status(403).json({
        success: false,
        error: 'Нет доступа к этому чату'
      });
    }

    // Отмечаем сообщения как прочитанные
    const readerType = isCustomer ? 'customer' : 'seller';
    await chat.markAsRead(readerType);

    // Пагинация сообщений (последние сообщения)
    const messagesTotal = chat.messages.length;
    const skip = Math.max(0, messagesTotal - (page * limit));
    const paginatedMessages = chat.messages.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      data: {
        chat: {
          ...chat.toObject(),
          messages: paginatedMessages
        },
        pagination: {
          page,
          limit,
          total: messagesTotal,
          hasMore: skip > 0
        }
      }
    });

  } catch (error) {
    console.error('❌ Ошибка получения чата:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении чата'
    });
  }
};

// @desc    Закрыть чат
// @route   PUT /api/v1/chats/:chatId/close
// @access  Private (Customer/Seller)
const closeChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Чат не найден'
      });
    }

    // Проверяем права доступа
    const isCustomer = chat.customer.id.toString() === userId;
    const isSeller = chat.seller.id.toString() === userId;
    
    if (!isCustomer && !isSeller) {
      return res.status(403).json({
        success: false,
        error: 'Нет доступа к этому чату'
      });
    }

    chat.status = 'closed';
    await chat.save();

    res.status(200).json({
      success: true,
      data: {
        message: 'Чат закрыт',
        chat: chat
      }
    });

  } catch (error) {
    console.error('❌ Ошибка закрытия чата:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при закрытии чата'
    });
  }
};

module.exports = {
  startChat,
  sendMessage,
  getCustomerChats,
  getSellerChats,
  getChat,
  closeChat
};



