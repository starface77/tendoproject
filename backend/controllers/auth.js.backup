const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const nodemailer = require('nodemailer');

/**
 * 🔐 КОНТРОЛЛЕР АУТЕНТИФИКАЦИИ
 * Регистрация, вход, восстановление пароля
 */

// @desc    Регистрация пользователя
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
  try {

    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    const { email, password, firstName, lastName, phone, city, language } = req.body;
    
    // Принудительно устанавливаем город если не передан или неверный
    const validCity = city && ['tashkent', 'samarkand', 'bukhara', 'andijan', 'namangan', 'fergana', 'nukus', 'urgench', 'karshi', 'termez'].includes(city) ? city : 'tashkent';
    


    // Проверка на существование пользователя
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Пользователь с таким email или телефоном уже существует'
      });
    }

    // Создание пользователя
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      city: validCity,
      language: language || 'ru'
    });

    await user.save();

    // Создание токена
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo_development_only_change_in_production_2025',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        city: user.city,
        language: user.language,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при регистрации'
    });
  }
};

// @desc    Вход пользователя
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Найти пользователя с паролем
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Неверные учетные данные'
      });
    }

    // Проверка пароля
    const isPasswordValid = await user.checkPassword(password);

    if (!isPasswordValid) {
      // await user.incLoginAttempts(); // Метод не реализован
      return res.status(401).json({
        success: false,
        error: 'Неверные учетные данные'
      });
    }

    // Проверка блокировки
    // if (user.isLocked) { // Поле не реализовано в модели
    //   return res.status(423).json({
    //     success: false,
    //     error: 'Аккаунт заблокирован из-за множественных неудачных попыток входа'
    //   });
    // }

    // Сброс попыток входа
    // await user.resetLoginAttempts(); // Метод не реализован

    // Обновление времени последнего входа без триггера полной валидации документа
    // Это исключает проблемы приведения типов для легаси-полей (например, permissions как массив)
    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } }, { timestamps: false });

    // Создание токена
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo_development_only_change_in_production_2025',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Успешный вход в систему',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        city: user.city,
        language: user.language,
        role: user.role,
        avatar: user.avatar,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при входе'
    });
  }
};

// @desc    Вход администратора
// @route   POST /api/v1/auth/admin/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Ошибки валидации',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    console.log(`🔍 Админ логин: ищем пользователя с email: ${email}`);

    // Найти пользователя с паролем
    const user = await User.findOne({ email }).select('+password');

    console.log(`🔍 Результат поиска: ${user ? 'найден' : 'не найден'}`);
    if (user) {
      console.log(`   ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Роль: ${user.role}`);
      console.log(`   Активен: ${user.isActive}`);
      console.log(`   Пароль присутствует: ${!!user.password}`);
    }

    if (!user) {
      console.log(`❌ Пользователь не найден с email: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Неверные учетные данные администратора'
      });
    }

    // Проверить пароль
    console.log(`🔐 Проверяем пароль для пользователя: ${user.email}`);
    console.log(`   Введенный пароль: "${password}"`);
    console.log(`   Хеш из БД: ${user.password.substring(0, 20)}...`);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`   Результат проверки bcrypt.compare: ${isMatch}`);

    if (!isMatch) {
      console.log(`❌ Пароль не совпадает для пользователя: ${user.email}`);
      return res.status(401).json({
        success: false,
        error: 'Неверные учетные данные администратора'
      });
    }

    // Проверить роль администратора
    if (!['admin', 'super_admin', 'moderator'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Доступ запрещен: недостаточно прав'
      });
    }

    // Проверить активность аккаунта
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Аккаунт заблокирован'
      });
    }

    // Обновить последний вход атомарно, без полной валидации документа
    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } }, { timestamps: false });

    // Создать JWT токен
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo_development_only_change_in_production_2025',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log(`✅ Админ вход: ${user.email} (роль: ${user.role})`);

    res.status(200).json({
      success: true,
      message: 'Успешный вход администратора',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: user.permissions,
        avatar: user.avatar,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при входе администратора'
    });
  }
};

// @desc    Выход пользователя
// @route   GET /api/v1/auth/logout
// @access  Private
const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Успешный выход из системы'
  });
};

// @desc    Получение текущего пользователя
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        city: user.city,
        language: user.language,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent,
        favoriteProducts: user.favoriteProducts,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения профиля'
    });
  }
};

// @desc    Забыл пароль
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь с таким email не найден'
      });
    }

    // Генерация токена сброса
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Хеширование и сохранение токена
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Время жизни токена - 10 минут
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Создание URL сброса
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/reset-password/${resetToken}`;

    const message = `
      Вы получили это письмо, потому что запросили сброс пароля.
      
      Перейдите по следующей ссылке для сброса пароля:
      
      ${resetUrl}
      
      Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
    `;

    try {
      // Здесь должна быть отправка email
      // await sendEmail({
      //   email: user.email,
      //   subject: 'Сброс пароля',
      //   message
      // });

      res.status(200).json({
        success: true,
        message: 'Письмо для сброса пароля отправлено',
        // В разработке отправляем токен в ответе
        ...(process.env.NODE_ENV === 'development' && { resetToken })
      });

    } catch (error) {
      console.error('Email Send Error:', error);
      
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      res.status(500).json({
        success: false,
        error: 'Письмо не может быть отправлено'
      });
    }

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при восстановлении пароля'
    });
  }
};

// @desc    Сброс пароля
// @route   PUT /api/v1/auth/reset-password/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    // Получить хешированный токен
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Недействительный токен'
      });
    }

    // Установить новый пароль
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // Создание токена
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo_development_only_change_in_production_2025',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Пароль успешно изменен',
      token
    });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при сбросе пароля'
    });
  }
};

// @desc    Обновление данных пользователя
// @route   PUT /api/v1/auth/update-details
// @access  Private
const updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      city: req.body.city,
      language: req.body.language
    };

    // Убираем undefined поля
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Данные успешно обновлены',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        city: user.city,
        language: user.language,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Update Details Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при обновлении данных'
    });
  }
};

// @desc    Обновление пароля
// @route   PUT /api/v1/auth/update-password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Проверка текущего пароля
    const isCurrentPasswordCorrect = await user.checkPassword(currentPassword);

    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({
        success: false,
        error: 'Неверный текущий пароль'
      });
    }

    user.password = newPassword;
    await user.save();

    // Создание нового токена
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo_development_only_change_in_production_2025',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Пароль успешно обновлен',
      token
    });

  } catch (error) {
    console.error('Update Password Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при обновлении пароля'
    });
  }
};

// @desc    Подтверждение email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Найти пользователя с токеном подтверждения
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Недействительный или истекший токен подтверждения'
      });
    }

    // Подтвердить email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email успешно подтвержден'
    });

  } catch (error) {
    console.error('Verify Email Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при подтверждении email'
    });
  }
};

// @desc    Повторная отправка подтверждения email
// @route   POST /api/v1/auth/resend-verification
// @access  Private
const resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email уже подтвержден'
      });
    }

    // Генерация нового токена
    const verificationToken = crypto.randomBytes(20).toString('hex');

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 часа

    await user.save();

    // Отправка email (заглушка)
    res.status(200).json({
      success: true,
      message: 'Письмо подтверждения отправлено повторно',
      // В разработке отправляем токен в ответе
      ...(process.env.NODE_ENV === 'development' && { verificationToken })
    });

  } catch (error) {
    console.error('Resend Verification Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при повторной отправке подтверждения'
    });
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  verifyEmail,
  resendVerificationEmail
};
