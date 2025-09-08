/**
 * 📞 СТРАНИЦА КОНТАКТОВ
 * Контактная информация и форма обратной связи
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiMessageCircle, FiArrowLeft } from 'react-icons/fi'
import { useLanguage } from '../contexts/LanguageContext'

const ContactsPage = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const contactInfo = [
    {
      icon: FiPhone,
      title: t('phone_title', 'Телефон'),
      details: '+998 78 150 15 15',
      subtitle: t('phone_calls', 'Звонки принимаются с 9:00 до 21:00')
    },
    {
      icon: FiMail,
      title: t('email_title', 'Email'),
      details: 'support@tendomarket.uz',
      subtitle: t('email_response', 'Ответим в течение 2 часов')
    },
    {
      icon: FiMapPin,
      title: t('address_title', 'Адрес'),
      details: 'г. Ташкент, ул. Амира Темура, 15',
      subtitle: t('office_hours', 'Офис открыт пн-пт с 9:00 до 18:00')
    },
    {
      icon: FiClock,
      title: t('work_hours_title', 'Время работы'),
      details: t('work_hours_week', 'Пн-Пт: 9:00 - 21:00'),
      subtitle: t('work_hours_weekend', 'Сб-Вс: 10:00 - 18:00')
    }
  ]

  const socialLinks = [
    { name: 'Telegram', url: 'https://t.me/tendomarket', icon: '💬' },
    { name: 'Instagram', url: 'https://instagram.com/tendomarket', icon: '📸' },
    { name: 'Facebook', url: 'https://facebook.com/tendomarket', icon: '👥' },
    { name: 'YouTube', url: 'https://youtube.com/tendomarket', icon: '📺' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

    const handleSubmit = async (e) => {
    e.preventDefault()

    // Валидация формы
    if (formData.message.length < 5) {
      alert(t('message_min_length', 'Сообщение должно содержать минимум 5 символов'))
      return
    }

    setIsSubmitting(true)

    try {
      // Отправка данных на сервер
      console.log('Отправляем сообщение:', formData)

      // Реальный API запрос
      const response = await fetch('http://localhost:5000/api/v1/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error(t('send_error', 'Произошла ошибка при отправке сообщения. Попробуйте еще раз.'))
      }

      const result = await response.json()
      console.log('Сообщение отправлено:', result)

      setIsSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
      alert('Произошла ошибка при отправке сообщения. Попробуйте еще раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-0">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-6"
          >
            <FiArrowLeft className="mr-2" />
{t('back', 'Назад')}
          </button>

          <div className="flex items-start space-x-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FiMessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('contact_us', 'Свяжитесь с нами')}
              </h1>
              <p className="text-xl text-gray-600">
                {t('contact_description', 'Мы всегда готовы помочь вам. Выберите удобный способ связи или оставьте сообщение.')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Контактная информация */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('our_contacts', 'Наши контакты')}</h2>
            <p className="text-gray-600 mb-8">
              {t('contact_help', 'Свяжитесь с нами любым удобным способом. Мы всегда готовы помочь!')}
            </p>
            
            <div className="space-y-6 mb-12">
              {contactInfo.map((contact, index) => {
                const IconComponent = contact.icon
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{contact.title}</h3>
                      <p className="text-gray-900 font-medium mb-1">{contact.details}</p>
                      <p className="text-sm text-gray-600">{contact.subtitle}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Социальные сети */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiMessageCircle className="mr-2" />
                {t('social_networks', 'Мы в социальных сетях')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-2xl mr-3">{social.icon}</span>
                    <span className="font-medium text-gray-700">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Карта */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('our_office', 'Наш офис')}</h3>
              <p className="text-gray-600">г. Ташкент, ул. Амира Темура, 15</p>
              <div className="mt-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FiMapPin className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm">{t('map_placeholder', 'Карта будет добавлена')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Форма обратной связи */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('write_to_us', 'Напишите нам')}</h2>
            <p className="text-gray-600 mb-8">
              {t('write_description', 'Заполните форму и мы свяжемся с вами в ближайшее время')}
            </p>

            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSend className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('message_sent', 'Сообщение отправлено!')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('thank_feedback', 'Спасибо за ваше обращение. Мы ответим в ближайшее время.')}
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t('send_another', 'Отправить еще одно сообщение')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('your_name', 'Ваше имя')} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('enter_name', 'Введите ваше имя')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('email', 'Email')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('subject', 'Тема сообщения')} *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('choose_subject', 'Выберите тему')}</option>
                    <option value="general">{t('general_question', 'Общий вопрос')}</option>
                    <option value="order">{t('order_question', 'Вопрос по заказу')}</option>
                    <option value="payment">{t('payment_problem', 'Проблемы с оплатой')}</option>
                    <option value="delivery">{t('delivery_question', 'Доставка')}</option>
                    <option value="return">{t('return_product', 'Возврат товара')}</option>
                    <option value="seller">{t('become_seller_question', 'Стать продавцом')}</option>
                    <option value="technical">{t('technical_support', 'Техническая поддержка')}</option>
                    <option value="other">{t('other', 'Другое')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('message', 'Сообщение')} *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('describe_issue', 'Опишите ваш вопрос или проблему подробно (минимум 5 символов)...')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
{t('sending', 'Отправляем...')}
                    </>
                  ) : (
                    <>
                      <FiSend className="mr-2" />
                      {t('send_message', 'Отправить сообщение')}
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-500 text-center">
                  {t('privacy_agreement', 'Отправляя форму, вы соглашаетесь с политикой конфиденциальности')}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default ContactsPage
