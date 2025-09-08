/**
 * ⚙️ SETTINGS CONTROLLER
 * Управление настройками системы через админ-панель
 */

const Setting = require('../models/Setting');

// @desc    Get all settings grouped by category
// @route   GET /api/v1/admin/settings
// @access  Private (Admin)
const getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.getAllSettings();
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get all settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения настроек'
    });
  }
};

// @desc    Get settings by category
// @route   GET /api/v1/admin/settings/:category
// @access  Private (Admin)
const getSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const settings = await Setting.getSettingsByCategory(category);
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings by category error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения настроек категории'
    });
  }
};

// @desc    Update setting value
// @route   PUT /api/v1/admin/settings/:key
// @access  Private (Admin)
const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const setting = await Setting.setSetting(key, value, req.user.id);
    
    res.status(200).json({
      success: true,
      data: setting,
      message: 'Настройка обновлена'
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления настройки'
    });
  }
};

// @desc    Update multiple settings at once
// @route   PUT /api/v1/admin/settings
// @access  Private (Admin)
const updateMultipleSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const results = [];
    
    for (const [key, value] of Object.entries(settings)) {
      try {
        const setting = await Setting.setSetting(key, value, req.user.id);
        results.push({ key, success: true, setting });
      } catch (error) {
        results.push({ key, success: false, error: error.message });
      }
    }
    
    res.status(200).json({
      success: true,
      data: results,
      message: 'Настройки обновлены'
    });
  } catch (error) {
    console.error('Update multiple settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления настроек'
    });
  }
};

// @desc    Create new setting
// @route   POST /api/v1/admin/settings
// @access  Private (Admin)
const createSetting = async (req, res) => {
  try {
    const setting = new Setting({
      ...req.body,
      updatedBy: req.user.id
    });
    
    await setting.save();
    
    res.status(201).json({
      success: true,
      data: setting,
      message: 'Настройка создана'
    });
  } catch (error) {
    console.error('Create setting error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Настройка с таким ключом уже существует'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Ошибка создания настройки'
    });
  }
};

// @desc    Delete setting
// @route   DELETE /api/v1/admin/settings/:key
// @access  Private (Admin)
const deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;
    
    const setting = await Setting.findOne({ key });
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        error: 'Настройка не найдена'
      });
    }
    
    if (setting.meta.isSystem) {
      return res.status(400).json({
        success: false,
        error: 'Системную настройку нельзя удалить'
      });
    }
    
    await setting.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Настройка удалена'
    });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления настройки'
    });
  }
};

// @desc    Reset settings to default values
// @route   POST /api/v1/admin/settings/reset
// @access  Private (Admin)
const resetSettings = async (req, res) => {
  try {
    const { category } = req.body;
    
    let filter = {};
    if (category) {
      filter = { 'meta.category': category };
    }
    
    const settings = await Setting.find(filter);
    const results = [];
    
    for (const setting of settings) {
      if (setting.meta.defaultValue !== undefined) {
        try {
          setting.value = setting.meta.defaultValue;
          setting.updatedBy = req.user.id;
          await setting.save();
          results.push({ key: setting.key, success: true });
        } catch (error) {
          results.push({ key: setting.key, success: false, error: error.message });
        }
      }
    }
    
    res.status(200).json({
      success: true,
      data: results,
      message: 'Настройки сброшены к значениям по умолчанию'
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сброса настроек'
    });
  }
};

// @desc    Initialize default settings
// @route   POST /api/v1/admin/settings/initialize
// @access  Private (Admin)
const initializeSettings = async (req, res) => {
  try {
    const defaultSettings = [
      // Общие настройки
      {
        key: 'site_name',
        value: 'Tendo Market',
        meta: {
          category: 'general',
          title: { ru: 'Название сайта' },
          description: { ru: 'Основное название маркетплейса' },
          fieldType: 'text',
          order: 1,
          isSystem: true,
          defaultValue: 'Tendo Market'
        }
      },
      {
        key: 'site_description',
        value: 'Современный маркетплейс Узбекистана',
        meta: {
          category: 'general',
          title: { ru: 'Описание сайта' },
          description: { ru: 'Краткое описание для SEO' },
          fieldType: 'textarea',
          order: 2,
          defaultValue: 'Современный маркетплейс Узбекистана'
        }
      },
      {
        key: 'contact_phone',
        value: '+998 78 150 15 15',
        meta: {
          category: 'general',
          title: { ru: 'Контактный телефон' },
          description: { ru: 'Основной номер телефона поддержки' },
          fieldType: 'text',
          order: 3,
          defaultValue: '+998 78 150 15 15'
        }
      }
    ];
    
    const results = [];
    
    for (const settingData of defaultSettings) {
      try {
        const existing = await Setting.findOne({ key: settingData.key });
        
        if (!existing) {
          const setting = new Setting({
            ...settingData,
            updatedBy: req.user.id
          });
          await setting.save();
          results.push({ key: settingData.key, success: true, action: 'created' });
        } else {
          results.push({ key: settingData.key, success: true, action: 'exists' });
        }
      } catch (error) {
        results.push({ key: settingData.key, success: false, error: error.message });
      }
    }
    
    res.status(200).json({
      success: true,
      data: results,
      message: 'Настройки инициализированы'
    });
  } catch (error) {
    console.error('Initialize settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка инициализации настроек'
    });
  }
};

module.exports = {
  getAllSettings,
  getSettingsByCategory,
  updateSetting,
  updateMultipleSettings,
  createSetting,
  deleteSetting,
  resetSettings,
  initializeSettings
};