const express = require('express');
const { body } = require('express-validator');
// Импортируем из старого контроллера (если есть) или создаем заглушки
// const {
//   login,
//   getMe,
//   updateProfile,
//   changePassword,
//   getDashboard,
//   getAnalytics,
//   getSellers,
//   getSellerProfile
// } = require('../controllers/sellers');

// Импорт реальных обработчиков для seller кабинета
const {
  getMe,
  getSellerProducts,
  getDashboard,
  getFinance,
  getOrders,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerProfile,
  updateOrderStatus
} = require('../controllers/sellers');

// Временные заглушки для публичных seller страниц
const login = (req, res) => res.status(501).json({ message: 'Функция в разработке' });
const updateProfile = (req, res) => res.status(501).json({ message: 'Функция в разработке' });
const changePassword = (req, res) => res.status(501).json({ message: 'Функция в разработке' });
const getAnalytics = (req, res) => res.status(501).json({ message: 'Функция в разработке' });
const getSellers = (req, res) => res.status(501).json({ message: 'Функция в разработке' });

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Валидация для входа
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Некорректный формат email'),
  
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен')
];

// Валидация для обновления профиля
const updateProfileValidation = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Название магазина должно быть от 2 до 100 символов'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Описание не может быть длиннее 1000 символов'),
  
  body('phone')
    .optional()
    .matches(/^\+998[0-9]{9}$/)
    .withMessage('Телефон должен быть в формате +998XXXXXXXXX'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Адрес должен быть от 10 до 200 символов'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Некорректный формат веб-сайта'),
  
  body('categories')
    .optional()
    .isArray({ min: 1, max: 5 })
    .withMessage('Выберите от 1 до 5 категорий'),
  
  body('categories.*')
    .optional()
    .isIn([
      'Электроника',
      'Одежда и обувь', 
      'Дом и сад',
      'Красота и здоровье',
      'Спорт и отдых',
      'Автотовары',
      'Детские товары',
      'Книги и канцелярия',
      'Продукты питания',
      'Подарки и сувениры'
    ])
    .withMessage('Недопустимая категория товаров'),
  
  // Валидация режима работы
  body('workingHours.*.isOpen')
    .optional()
    .isBoolean()
    .withMessage('Некорректное значение для режима работы'),
  
  body('workingHours.*.open')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Некорректный формат времени открытия'),
  
  body('workingHours.*.close')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Некорректный формат времени закрытия'),
  
  // Валидация соц. сетей
  body('socialMedia.telegram')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Telegram username не может быть длиннее 50 символов'),
  
  body('socialMedia.instagram')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Instagram username не может быть длиннее 50 символов'),
  
  body('socialMedia.facebook')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Facebook страница не может быть длиннее 100 символов'),
  
  body('socialMedia.youtube')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('YouTube канал не может быть длиннее 100 символов'),
  
  // Валидация настроек
  body('settings.autoAcceptOrders')
    .optional()
    .isBoolean()
    .withMessage('Некорректное значение для автоматического принятия заказов'),
  
  body('settings.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Некорректное значение для email уведомлений'),
  
  body('settings.smsNotifications')
    .optional()
    .isBoolean()
    .withMessage('Некорректное значение для SMS уведомлений'),
  
  body('settings.showPhone')
    .optional()
    .isBoolean()
    .withMessage('Некорректное значение для отображения телефона'),
  
  body('settings.showAddress')
    .optional()
    .isBoolean()
    .withMessage('Некорректное значение для отображения адреса'),
  
  body('settings.allowReviews')
    .optional()
    .isBoolean()
    .withMessage('Некорректное значение для разрешения отзывов'),
  
  body('settings.requireOrderApproval')
    .optional()
    .isBoolean()
    .withMessage('Некорректное значение для требования подтверждения заказов')
];

// Валидация для смены пароля
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Текущий пароль обязателен'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Новый пароль должен содержать минимум 6 символов')
];

// Публичные маршруты
router.post('/login', loginValidation, login);
router.get('/', getSellers); // Список всех продавцов
router.get('/:sellerId', getSellerProfile); // Профиль конкретного продавца

// Защищенные маршруты (временно разрешено всем авторизованным)
router.use((req, res, next) => {
  console.log('🔍 Seller route accessed:', req.method, req.originalUrl);
  next();
});
router.use(protect);
// router.use(authorize('seller', 'admin', 'super_admin'));

router.get('/me/profile', getMe);
router.put('/me/profile', updateProfileValidation, updateProfile);
router.put('/me/change-password', changePasswordValidation, changePassword);
router.get('/me/dashboard', getDashboard);
router.get('/me/analytics', getAnalytics);
router.get('/me/products', getSellerProducts);
router.post('/me/products', createSellerProduct);
router.put('/me/products/:id', updateSellerProduct);
router.delete('/me/products/:id', deleteSellerProduct);
router.get('/me/finance', getFinance);
router.get('/me/orders', getOrders);
router.put('/me/orders/:id/status', updateOrderStatus);

module.exports = router;



