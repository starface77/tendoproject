const fs = require('fs');
const path = require('path');

/**
 * 📁 КОНТРОЛЛЕР ЗАГРУЗКИ ФАЙЛОВ
 * Управление загрузкой и удалением файлов
 */

// @desc    Загрузка одного файла
// @route   POST /api/v1/upload/single
// @access  Private
const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Файл не был загружен'
      });
    }

    const file = req.file;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    res.status(200).json({
      success: true,
      message: 'Файл успешно загружен',
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `${baseUrl}/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload Single Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка загрузки файла'
    });
  }
};

// @desc    Загрузка нескольких файлов
// @route   POST /api/v1/upload/multiple
// @access  Private
const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Файлы не были загружены'
      });
    }

    const files = req.files;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const uploadedFiles = files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `${baseUrl}/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`,
      uploadedAt: new Date().toISOString()
    }));

    res.status(200).json({
      success: true,
      message: `${files.length} файлов успешно загружено`,
      count: files.length,
      data: uploadedFiles
    });

  } catch (error) {
    console.error('Upload Multiple Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка загрузки файлов'
    });
  }
};

// @desc    Получить информацию о файле
// @route   GET /api/v1/upload/info/:filename
// @access  Private
const getFileInfo = async (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Ищем файл во всех папках uploads
    const uploadPaths = [
      'uploads/products/',
      'uploads/categories/',
      'uploads/users/',
      'uploads/reviews/',
      'uploads/misc/'
    ];

    let filePath = null;
    let stats = null;

    for (const uploadPath of uploadPaths) {
      const fullPath = path.join(__dirname, '..', uploadPath, filename);
      if (fs.existsSync(fullPath)) {
        filePath = fullPath;
        stats = fs.statSync(fullPath);
        break;
      }
    }

    if (!filePath) {
      return res.status(404).json({
        success: false,
        error: 'Файл не найден'
      });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const directory = path.basename(path.dirname(filePath));
    
    res.status(200).json({
      success: true,
      data: {
        filename,
        path: path.basename(path.dirname(filePath)),
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `${baseUrl}/uploads/${directory}/${filename}`
      }
    });

  } catch (error) {
    console.error('Get File Info Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения информации о файле'
    });
  }
};

// @desc    Удалить файл
// @route   DELETE /api/v1/upload/:filename
// @access  Private (Admin)
const deleteFile = async (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Ищем файл во всех папках uploads
    const uploadPaths = [
      'uploads/products/',
      'uploads/categories/',
      'uploads/users/',
      'uploads/reviews/',
      'uploads/misc/'
    ];

    let filePath = null;

    for (const uploadPath of uploadPaths) {
      const fullPath = path.join(__dirname, '..', uploadPath, filename);
      if (fs.existsSync(fullPath)) {
        filePath = fullPath;
        break;
      }
    }

    if (!filePath) {
      return res.status(404).json({
        success: false,
        error: 'Файл не найден'
      });
    }

    // Удаляем файл
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'Файл успешно удален'
    });

  } catch (error) {
    console.error('Delete File Error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления файла'
    });
  }
};

// @desc    Очистка старых файлов (утилита)
// @access  Private (Cron job or manual)
const cleanupOldFiles = async () => {
  try {
    const uploadPaths = [
      'uploads/products/',
      'uploads/categories/',
      'uploads/users/',
      'uploads/reviews/',
      'uploads/misc/'
    ];

    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 дней
    const now = Date.now();
    let deletedCount = 0;

    for (const uploadPath of uploadPaths) {
      const fullPath = path.join(__dirname, '..', uploadPath);
      
      if (!fs.existsSync(fullPath)) continue;

      const files = fs.readdirSync(fullPath);
      
      for (const file of files) {
        const filePath = path.join(fullPath, file);
        const stats = fs.statSync(filePath);
        
        // Удаляем файлы старше 30 дней
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`Deleted old file: ${file}`);
        }
      }
    }

    console.log(`Cleanup completed. Deleted ${deletedCount} old files.`);
    return { success: true, deletedCount };

  } catch (error) {
    console.error('Cleanup Error:', error);
    return { success: false, error: error.message };
  }
};

// @desc    Получить статистику загрузок
// @access  Private (Admin)
const getUploadStats = async () => {
  try {
    const uploadPaths = [
      'uploads/products/',
      'uploads/categories/',
      'uploads/users/',
      'uploads/reviews/',
      'uploads/misc/'
    ];

    const stats = {};
    let totalFiles = 0;
    let totalSize = 0;

    for (const uploadPath of uploadPaths) {
      const fullPath = path.join(__dirname, '..', uploadPath);
      const folderName = path.basename(uploadPath);
      
      stats[folderName] = {
        files: 0,
        size: 0
      };

      if (!fs.existsSync(fullPath)) continue;

      const files = fs.readdirSync(fullPath);
      
      for (const file of files) {
        const filePath = path.join(fullPath, file);
        const fileStats = fs.statSync(filePath);
        
        stats[folderName].files++;
        stats[folderName].size += fileStats.size;
        totalFiles++;
        totalSize += fileStats.size;
      }
    }

    return {
      success: true,
      data: {
        total: {
          files: totalFiles,
          size: totalSize,
          sizeFormatted: formatFileSize(totalSize)
        },
        byCategory: Object.keys(stats).map(category => ({
          category,
          files: stats[category].files,
          size: stats[category].size,
          sizeFormatted: formatFileSize(stats[category].size)
        }))
      }
    };

  } catch (error) {
    console.error('Upload Stats Error:', error);
    return { success: false, error: error.message };
  }
};

// Утилита для форматирования размера файла
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Создание папок для загрузки если они не существуют
const ensureUploadDirectories = () => {
  const uploadPaths = [
    'uploads/products/',
    'uploads/categories/',
    'uploads/users/',
    'uploads/reviews/',
    'uploads/misc/'
  ];

  for (const uploadPath of uploadPaths) {
    const fullPath = path.join(__dirname, '..', uploadPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created upload directory: ${uploadPath}`);
    }
  }
};

// Инициализация папок при загрузке модуля
ensureUploadDirectories();

module.exports = {
  uploadSingle,
  uploadMultiple,
  getFileInfo,
  deleteFile,
  cleanupOldFiles,
  getUploadStats
};
