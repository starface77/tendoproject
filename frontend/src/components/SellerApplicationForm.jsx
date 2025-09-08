/**
 * 🛍️ ФОРМА ЗАЯВКИ НА ПРОДАВЦА
 * Компонент для подачи заявки на получение статуса продавца
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiPhone, FiMapPin, FiFileText, FiSend, FiCheck } from 'react-icons/fi'
import { sellerApi } from '../services/api'

const SellerApplicationForm = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'individual',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    categories: [],
    productTypes: '',
    monthlyVolume: '',
    experience: '',
    otherPlatforms: '',
    agreesToTerms: false,
    marketingConsent: false
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCategoryChange = (category, checked) => {
    setFormData(prev => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter(cat => cat !== category)
    }))
  }

  const isFormValid = () => {
    return formData.businessName && formData.contactName && formData.email &&
           formData.phone && formData.address && formData.productTypes &&
           formData.monthlyVolume && formData.experience && formData.agreesToTerms
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isFormValid()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Отправляем заявку через API-обертку
      const response = await sellerApi.applyToBecomeSeller(formData)
      
      if (response?.success) {
        setSubmitSuccess(true)
        if (onSuccess) onSuccess()
        setTimeout(() => {
          navigate('/profile')
        }, 3000)
      } else {
        throw new Error(response?.message || 'Ошибка отправки заявки')
      }
      
    } catch (error) {
      console.error('Ошибка отправки заявки:', error)
      setSubmitError(error.message || 'Ошибка при отправке заявки. Попробуйте снова.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheck className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Заявка отправлена!
        </h3>
        <p className="text-gray-600 mb-6">
          Мы рассмотрим вашу заявку и свяжемся с вами в ближайшее время
        </p>
        <div className="text-sm text-gray-500">
          Перенаправление на профиль через несколько секунд...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiFileText className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Заявка на продавца
          </h2>
          <p className="text-gray-600">
            Заполните форму, чтобы стать продавцом на нашей платформе
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiFileText className="inline h-4 w-4 mr-2" />
                Название компании *
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Название вашей компании"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiUser className="inline h-4 w-4 mr-2" />
                Контактное лицо *
              </label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="ФИО контактного лица"
              />
            </div>
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип бизнеса *
            </label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="individual">Индивидуальный предприниматель</option>
              <option value="llc">ООО</option>
              <option value="ooo">ООО</option>
              <option value="ip">ИП</option>
              <option value="other">Другое</option>
            </select>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiMail className="inline h-4 w-4 mr-2" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiPhone className="inline h-4 w-4 mr-2" />
                Телефон *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="+998XXXXXXXXX"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiMapPin className="inline h-4 w-4 mr-2" />
              Адрес *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Полный адрес вашей компании"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Веб-сайт
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="https://example.com"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категории товаров *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
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
              ].map(category => (
                <label key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category)}
                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Product Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание товаров *
            </label>
            <textarea
              name="productTypes"
              value={formData.productTypes}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Опишите ваши товары и услуги подробно"
            />
          </div>

          {/* Monthly Volume */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Планируемый объем продаж *
            </label>
            <select
              name="monthlyVolume"
              value={formData.monthlyVolume}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Выберите объем</option>
              <option value="under_1m">До 1 млн сум</option>
              <option value="1m_5m">1-5 млн сум</option>
              <option value="5m_20m">5-20 млн сум</option>
              <option value="20m_50m">20-50 млн сум</option>
              <option value="over_50m">Более 50 млн сум</option>
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Опыт работы *
            </label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Выберите опыт</option>
              <option value="none">Нет опыта</option>
              <option value="under_1_year">Менее 1 года</option>
              <option value="1_3_years">1-3 года</option>
              <option value="3_5_years">3-5 лет</option>
              <option value="over_5_years">Более 5 лет</option>
            </select>
          </div>

          {/* Other Platforms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Работа на других платформах
            </label>
            <textarea
              name="otherPlatforms"
              value={formData.otherPlatforms}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Укажите, на каких платформах вы уже работаете (Olx, Avito, Instagram и т.д.)"
            />
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="agreesToTerms"
                checked={formData.agreesToTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, agreesToTerms: e.target.checked }))}
                required
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">
                Я согласен с <a href="/terms" className="text-blue-600 hover:text-blue-700 underline">условиями использования</a> платформы *
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="marketingConsent"
                checked={formData.marketingConsent}
                onChange={(e) => setFormData(prev => ({ ...prev, marketingConsent: e.target.checked }))}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">
                Я согласен получать маркетинговые материалы и предложения
              </label>
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {submitError}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Отправка...
                </>
              ) : (
                <>
                  <FiSend className="h-5 w-5 mr-2" />
                  Отправить заявку
                </>
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default SellerApplicationForm
