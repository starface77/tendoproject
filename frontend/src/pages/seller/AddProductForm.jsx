/**
 * 📦 ФОРМА ДОБАВЛЕНИЯ ТОВАРА
 * Многошаговая форма с загрузкой изображений и валидацией
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiUpload, FiX, FiCheck, FiArrowLeft, FiArrowRight,
  FiImage, FiDollarSign, FiPackage, FiTag, FiInfo,
  FiCamera, FiPlus, FiTrash2
} from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

const AddProductForm = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  // Функция для безопасного получения названия категории
  const getCategoryName = (category) => {
    if (!category) return 'Категория';
    const name = category.name;
    if (typeof name === 'object') {
      return name?.ru || name?.uz || name?.en || 'Категория';
    }
    return name || 'Категория';
  }
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    // Основная информация
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    brand: '',
    
    // Цена и наличие
    price: '',
    originalPrice: '',
    stock: '',
    sku: '',
    
    // ОБЯЗАТЕЛЬНОЕ ПОЛЕ! Material
    material: 'silicone',
    
    // Изображения
    images: [],
    
    // Характеристики
    specifications: [
      { name: '', value: '' }
    ],
    
    // Доставка и гарантия
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    warranty: '',
    
    // SEO
    tags: [],
    metaTitle: '',
    metaDescription: ''
  })

  const [categories, setCategories] = useState([])

  // Загружаем категории при монтировании
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await api.categories.getCategories()
      setCategories(response.data || [])
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error)
      // Fallback к статичным категориям
      setCategories([
        { _id: 'electronics', name: 'Электроника', icon: '📱' },
        { _id: 'clothing', name: 'Одежда', icon: '👔' },
        { _id: 'home', name: 'Дом и сад', icon: '🏠' },
        { _id: 'sports', name: 'Спорт', icon: '⚽' },
        { _id: 'books', name: 'Книги', icon: '📚' },
        { _id: 'beauty', name: 'Красота', icon: '💄' },
        { _id: 'auto', name: 'Авто', icon: '🚗' },
        { _id: 'toys', name: 'Игрушки', icon: '🧸' }
      ])
    }
  }

  const steps = [
    { id: 1, title: 'Основная информация', icon: FiInfo },
    { id: 2, title: 'Изображения', icon: FiImage },
    { id: 3, title: 'Цена и наличие', icon: FiDollarSign },
    { id: 4, title: 'Характеристики', icon: FiPackage },
    { id: 5, title: 'Публикация', icon: FiCheck }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
  }

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files)
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Размер изображения не должен превышать 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = {
          id: Date.now() + Math.random(),
          file,
          url: e.target.result,
          name: file.name
        }
        
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, imageData]
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }))
  }

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { name: '', value: '' }]
    }))
  }

  const updateSpecification = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => 
        i === index ? { ...spec, [field]: value } : spec
      )
    }))
  }

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }))
  }

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.description || !formData.category) {
          setError('Заполните все обязательные поля')
          return false
        }
        break
      case 2:
        if (formData.images.length === 0) {
          setError('Добавьте хотя бы одно изображение')
          return false
        }
        break
      case 3:
        if (!formData.price || !formData.stock) {
          setError('Укажите цену и количество товара')
          return false
        }
        if (parseFloat(formData.price) <= 0) {
          setError('Цена должна быть больше 0')
          return false
        }
        break
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    setError('')

    try {
      // Подготовка данных для отправки
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category, // Должно быть ObjectId категории
        brand: formData.brand,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        stock: parseInt(formData.stock) || 1,
        material: formData.material, // ОБЯЗАТЕЛЬНОЕ поле!
        images: formData.images.map(img => ({
          url: img.url,
          isPrimary: img === formData.images[0],
          order: formData.images.indexOf(img)
        })),
        specifications: formData.specifications.filter(spec => spec.name && spec.value)
          .map(spec => ({
            name: { ru: spec.name, uz: spec.name, en: spec.name },
            value: { ru: spec.value, uz: spec.value, en: spec.value }
          })),
        dimensions: {
          length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : undefined,
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : undefined,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : undefined,
          weight: formData.weight ? parseFloat(formData.weight) * 1000 : undefined // конвертируем кг в граммы
        },
        tags: formData.tags,
        status: 'active',
        isActive: true,
        publishDate: new Date()
      }



      // Отправляем на API
      const response = await api.seller.createProduct(productData)
      
      if (response.success) {
        // Перенаправляем на страницу товаров продавца
        navigate('/seller/products')
      } else {
        setError(response.message || 'Ошибка при создании товара')
      }
      
    } catch (err) {
      setError('Ошибка при добавлении товара')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Основная информация о товаре</h3>
            
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название товара *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Например: iPhone 15 Pro Max 256GB"
                className="input-modern w-full"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.name.length}/100 символов</p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map(category => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => handleInputChange('category', category._id)}
                    className={`p-3 border-2 rounded-lg transition-all text-center ${
                      formData.category === category._id
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{category.icon || '📦'}</div>
                    <div className="text-sm font-medium">
                      {getCategoryName(category)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Бренд
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Например: Apple, Samsung, Nike"
                className="input-modern w-full"
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Краткое описание
              </label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                placeholder="Привлекательное описание в одну строку"
                className="input-modern w-full"
                maxLength={150}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/150 символов</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Подробное описание *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Расскажите подробно о товаре: особенности, преимущества, состав..."
                rows={6}
                className="input-modern w-full resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000 символов</p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Изображения товара</h3>
            <p className="text-gray-600">Добавьте качественные фотографии товара. Первое изображение будет основным.</p>

            {/* Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
            >
              <FiCamera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Добавьте изображения</p>
              <p className="text-gray-500">Перетащите файлы сюда или нажмите для выбора</p>
              <p className="text-xs text-gray-400 mt-2">PNG, JPG до 5MB каждый</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Images Preview */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Главное
                      </div>
                    )}
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Цена и наличие</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена продажи * (сум)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="100000"
                  min="0"
                  className="input-modern w-full"
                />
              </div>

              {/* Original Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Старая цена (сум)
                </label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                  placeholder="150000"
                  min="0"
                  className="input-modern w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Для показа скидки</p>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Количество в наличии *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  placeholder="10"
                  min="0"
                  className="input-modern w-full"
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Артикул (SKU)
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="PROD-001"
                  className="input-modern w-full"
                />
              </div>
            </div>

            {/* Discount Badge */}
            {formData.price && formData.originalPrice && parseFloat(formData.originalPrice) > parseFloat(formData.price) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FiTag className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="font-medium text-green-900">
                      Скидка {Math.round((1 - parseFloat(formData.price) / parseFloat(formData.originalPrice)) * 100)}%
                    </p>
                    <p className="text-sm text-green-700">
                      Экономия: {new Intl.NumberFormat('ru-RU').format(parseFloat(formData.originalPrice) - parseFloat(formData.price))} сум
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Характеристики товара</h3>

            {/* Specifications */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-gray-700">Технические характеристики</label>
                <button
                  type="button"
                  onClick={addSpecification}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                >
                  <FiPlus className="h-4 w-4 mr-1" />
                  Добавить
                </button>
              </div>

              <div className="space-y-3">
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Характеристика"
                      value={spec.name}
                      onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                      className="input-modern flex-1"
                    />
                    <input
                      type="text"
                      placeholder="Значение"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      className="input-modern flex-1"
                    />
                    {formData.specifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Physical Properties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Вес (кг)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="0.5"
                  step="0.1"
                  min="0"
                  className="input-modern w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Гарантия (месяцев)
                </label>
                <input
                  type="number"
                  value={formData.warranty}
                  onChange={(e) => handleInputChange('warranty', e.target.value)}
                  placeholder="12"
                  min="0"
                  className="input-modern w-full"
                />
              </div>
            </div>

            {/* Material - ОБЯЗАТЕЛЬНОЕ ПОЛЕ! */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Материал *
              </label>
              <select
                value={formData.material}
                onChange={(e) => handleInputChange('material', e.target.value)}
                className="input-modern w-full"
                required
              >
                <option value="silicone">Силикон</option>
                <option value="leather">Кожа</option>
                <option value="plastic">Пластик</option>
                <option value="metal">Металл</option>
                <option value="fabric">Ткань</option>
                <option value="wood">Дерево</option>
                <option value="glass">Стекло</option>
              </select>
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Размеры (мм)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  value={formData.dimensions.length}
                  onChange={(e) => handleInputChange('dimensions', { ...formData.dimensions, length: e.target.value })}
                  placeholder="Длина (мм)"
                  min="0"
                  className="input-modern"
                />
                <input
                  type="number"
                  value={formData.dimensions.width}
                  onChange={(e) => handleInputChange('dimensions', { ...formData.dimensions, width: e.target.value })}
                  placeholder="Ширина (мм)"
                  min="0"
                  className="input-modern"
                />
                <input
                  type="number"
                  value={formData.dimensions.height}
                  onChange={(e) => handleInputChange('dimensions', { ...formData.dimensions, height: e.target.value })}
                  placeholder="Высота (мм)"
                  min="0"
                  className="input-modern"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Укажите размеры в миллиметрах</p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Готов к публикации</h3>
            
            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Сводка товара</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Название:</span>
                  <span className="ml-2 font-medium">{formData.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Категория:</span>
                  <span className="ml-2 font-medium">
                    {formData.category 
                      ? getCategoryName(categories.find(c => c._id === formData.category))
                      : 'Не выбрано'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Цена:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {new Intl.NumberFormat('ru-RU').format(formData.price)} сум
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Количество:</span>
                  <span className="ml-2 font-medium">{formData.stock} шт.</span>
                </div>
                <div>
                  <span className="text-gray-600">Изображений:</span>
                  <span className="ml-2 font-medium">{formData.images.length}</span>
                </div>
              </div>
            </div>

            {/* Final Check */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <FiInfo className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Перед публикацией убедитесь:</p>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• Все фотографии четкие и качественные</li>
                    <li>• Описание товара полное и точное</li>
                    <li>• Цена указана корректно</li>
                    <li>• Характеристики заполнены</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/seller')}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FiArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Добавить товар</h1>
                <p className="text-sm text-gray-600">Шаг {currentStep} из 5</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  currentStep >= step.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <FiCheck className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map(step => (
              <div key={step.id} className="text-xs text-gray-600 w-20 text-center">
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </button>

            <div className="flex space-x-3">
              {currentStep < 5 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Далее
                  <FiArrowRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Публикация...
                    </>
                  ) : (
                    <>
                      <FiCheck className="h-4 w-4 mr-2" />
                      Опубликовать товар
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddProductForm