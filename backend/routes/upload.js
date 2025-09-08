const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const {
  uploadSingle,
  uploadMultiple,
  deleteFile,
  getFileInfo
} = require('../controllers/upload');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// 📁 КОНФИГУРАЦИЯ MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    
    switch (file.fieldname) {
      case 'productImage':
      case 'productImages':
        folder += 'products/';
        break;
      case 'categoryImage':
        folder += 'categories/';
        break;
      case 'userAvatar':
        folder += 'users/';
        break;
      case 'reviewImage':
      case 'reviewImages':
        folder += 'reviews/';
        break;
      case 'file': // для баннеров через /upload/single
        folder += 'banners/';
        break;
      default:
        folder += 'misc/';
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Генерация уникального имени файла
    const uniqueSuffix = `${crypto.randomBytes(16).toString('hex')}-${Date.now()}`;
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
  // Разрешенные типы файлов
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый тип файла. Разрешены: JPG, JPEG, PNG, WebP'), false);
  }
};

// Настройки multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    files: 10 // Максимум 10 файлов за раз
  }
});

// 🔐 ЗАЩИЩЕННЫЕ МАРШРУТЫ

// Загрузка одного файла
router.post('/single', protect, upload.single('file'), uploadSingle);

// Загрузка множественных файлов
router.post('/multiple', protect, upload.array('files', 10), uploadMultiple);

// Загрузка изображения товара
router.post('/product', protect, authorize('admin', 'super_admin'), 
  upload.single('productImage'), uploadSingle);

// Загрузка множественных изображений товара
router.post('/product/multiple', protect, authorize('admin', 'super_admin'),
  upload.array('productImages', 10), uploadMultiple);

// Загрузка изображения категории
router.post('/category', protect, authorize('admin', 'super_admin'),
  upload.single('categoryImage'), uploadSingle);

// Загрузка аватара пользователя
router.post('/avatar', protect, upload.single('userAvatar'), uploadSingle);

// Загрузка изображений для отзыва
router.post('/review', protect, upload.array('reviewImages', 5), uploadMultiple);

// 📋 УПРАВЛЕНИЕ ФАЙЛАМИ

// Получить информацию о файле
router.get('/info/:filename', protect, getFileInfo);

// Удалить файл
router.delete('/:filename', protect, authorize('admin', 'super_admin'), deleteFile);

// 🚨 ОБРАБОТКА ОШИБОК MULTER
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Файл слишком большой. Максимальный размер: 5MB'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Слишком много файлов. Максимум: 10 файлов'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Неожиданный файл'
      });
    }
  }
  
  if (error.message.includes('Неподдерживаемый тип файла')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  
  next(error);
});

module.exports = router;
