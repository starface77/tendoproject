/**
 * 📖 СТРАНИЦА FAQ (ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ)
 * Интерактивная страница с категориями и поиском
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiChevronDown, FiChevronUp, FiSearch, FiShoppingCart, FiTruck, FiCreditCard, FiUsers, FiHelpCircle, FiArrowLeft } from 'react-icons/fi'
import { useLanguage } from '../contexts/LanguageContext'

const FAQPage = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [openQuestions, setOpenQuestions] = useState(new Set())

  const categories = [
    { id: 'all', name: t('faq.all_questions', 'Все вопросы'), icon: FiHelpCircle },
    { id: 'orders', name: t('faq.orders', 'Заказы'), icon: FiShoppingCart },
    { id: 'delivery', name: t('faq.delivery', 'Доставка'), icon: FiTruck },
    { id: 'payment', name: t('faq.payment', 'Оплата'), icon: FiCreditCard },
    { id: 'account', name: t('faq.account', 'Аккаунт'), icon: FiUsers }
  ]

  const faqData = [
    {
      category: 'orders',
      question: 'Как оформить заказ?',
      answer: `Оформить заказ очень просто:

**Шаг 1:** Выберите товар и добавьте его в корзину
**Шаг 2:** Перейдите в корзину и проверьте свой заказ
**Шаг 3:** Заполните адрес доставки и контактные данные
**Шаг 4:** Выберите способ оплаты и подтвердите заказ

После оформления заказа вы получите подтверждение по email и SMS.`
    },
    {
      category: 'orders',
      question: 'Как отменить заказ?',
      answer: `Заказ можно отменить в следующих случаях:

- До подтверждения заказа продавцом (обычно в течение 1-2 часов)
- В течение 24 часов после оформления (если товар еще не передан в доставку)

Для отмены заказа:
1. Перейдите в раздел "Мои заказы"
2. Найдите нужный заказ
3. Нажмите "Отменить заказ"

При отмене заказа денежные средства будут возвращены на ваш счет.`
    },
    {
      category: 'delivery',
      question: 'Какие способы доставки доступны?',
      answer: `Мы предлагаем несколько вариантов доставки:

**Курьерская доставка:**
- Доставка по Ташкенту: от 10,000 сум
- Доставка по регионам: от 25,000 сум
- Срок: 1-3 дня

**Самовывоз:**
- Из пунктов выдачи: бесплатно
- Из магазинов партнеров: бесплатно

**Экспресс-доставка:**
- Доставка в день заказа: от 50,000 сум
- Доступно с 9:00 до 21:00`
    },
    {
      category: 'delivery',
      question: 'Как отслеживать статус доставки?',
      answer: `Отслеживать статус доставки можно несколькими способами:

**Через личный кабинет:**
1. Перейдите в раздел "Мои заказы"
2. Выберите нужный заказ
3. Посмотрите статус доставки

**По номеру заказа:**
- Позвоните в службу поддержки: +998 78 150 15 15
- Напишите в чат поддержки

**Статусы доставки:**
- Готовится к отправке
- Передан в доставку
- В пути
- Доставлен`
    },
    {
      category: 'payment',
      question: 'Какие способы оплаты доступны?',
      answer: `Мы принимаем следующие способы оплаты:

**Банковские карты:**
- Visa, MasterCard, UzCard, Humo
- Оплата онлайн без комиссии

**Наличными:**
- При получении заказа
- Через терминалы оплаты

**Электронные кошельки:**
- PayMe, Click, Apelsin
- Быстрая оплата без комиссии

Все платежи защищены и соответствуют стандартам безопасности PCI DSS.`
    },
    {
      category: 'payment',
      question: 'Как вернуть деньги за заказ?',
      answer: `Возврат денежных средств осуществляется:

**При отмене заказа:**
- Автоматический возврат на карту/кошелек
- Срок: 3-7 рабочих дней

**При возврате товара:**
- Возврат после проверки товара
- Срок рассмотрения: до 3 дней
- Возврат денег: 3-7 рабочих дней

**Причины возврата:**
- Товар не соответствует описанию
- Товар с дефектом
- Неправильный размер/цвет`
    },
    {
      category: 'account',
      question: 'Как зарегистрироваться на сайте?',
      answer: `Регистрация занимает всего пару минут:

**Через email:**
1. Нажмите "Регистрация"
2. Введите email и пароль
3. Подтвердите email по ссылке

**Через социальные сети:**
1. Нажмите "Войти через Google/Facebook"
2. Разрешите доступ к данным
3. Профиль создан автоматически

После регистрации вы получите доступ к личному кабинету, истории заказов и персональным скидкам.`
    },
    {
      category: 'account',
      question: 'Как восстановить пароль?',
      answer: `Восстановить пароль очень просто:

**Способ 1: Через email**
1. Нажмите "Забыли пароль?"
2. Введите email от аккаунта
3. Получите письмо с инструкциями
4. Перейдите по ссылке и установите новый пароль

**Способ 2: Через поддержку**
- Позвоните: +998 78 150 15 15
- Укажите email и последние цифры телефона

Пароль должен содержать минимум 8 символов и включать буквы и цифры.`
    }
  ]

  const filteredFAQ = faqData.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const matchesSearch = searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const toggleQuestion = (index) => {
    const newOpenQuestions = new Set(openQuestions)
    if (newOpenQuestions.has(index)) {
      newOpenQuestions.delete(index)
    } else {
      newOpenQuestions.add(index)
    }
    setOpenQuestions(newOpenQuestions)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-6"
          >
            <FiArrowLeft className="mr-2" />
            {t('faq.back', 'Назад')}
          </button>

          <div className="flex items-start space-x-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FiHelpCircle className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('faq.title', 'Часто задаваемые вопросы')}
              </h1>
              <p className="text-xl text-gray-600">
                {t('faq.subtitle', 'Найдите ответы на популярные вопросы или свяжитесь с нашей поддержкой')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('faq.categories', 'Категории')}</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {t('faq.more_than_1000', 'Более 1000 вопросов и ответов')}
            </p>

            {/* Поиск */}
            <div className="relative max-w-xl">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('faq.search_placeholder', 'Поиск по вопросам...')}
                className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 placeholder-gray-500 rounded-lg border border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors text-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Категории */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('faq.categories', 'Категории')}</h3>
              <div className="space-y-2">
                {categories.map(category => {
                  const IconComponent = category.icon
                  const isActive = activeCategory === category.id
                  const categoryCount = category.id === 'all'
                    ? faqData.length
                    : faqData.filter(item => item.category === category.id).length

                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${isActive
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                      <div className="flex items-center">
                        <IconComponent className="h-5 w-5 mr-3" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className={`text-sm ${isActive ? 'text-blue-500' : 'text-gray-500'}`}>
                        {categoryCount}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Вопросы и ответы */}
            <div className="lg:col-span-3">
              {filteredFAQ.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <FiHelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Вопросы не найдены
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Попробуйте изменить поисковый запрос или выбрать другую категорию
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setActiveCategory('all')
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Сбросить фильтры
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQ.map((item, index) => {
                    const isOpen = openQuestions.has(index)
                    return (
                      <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <button
                          onClick={() => toggleQuestion(index)}
                          className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <h3 className="font-medium text-gray-900 pr-4 text-lg">
                            {item.question}
                          </h3>
                          {isOpen ? (
                            <FiChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <FiChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="px-8 pb-8">
                            <div className="border-t border-gray-200 pt-6">
                              <div className="prose prose-base max-w-none text-gray-600 leading-relaxed">
                                {item.answer.split('\n').map((line, lineIndex) => (
                                  <p key={lineIndex} className="mb-2 last:mb-0">
                                    {line.startsWith('**') && line.endsWith('**') ? (
                                      <strong className="text-gray-900">
                                        {line.slice(2, -2)}
                                      </strong>
                                    ) : line.startsWith('- ') ? (
                                      <span className="block ml-4">• {line.slice(2)}</span>
                                    ) : line.match(/^\d+\./) ? (
                                      <span className="block ml-4">{line}</span>
                                    ) : (
                                      line
                                    )}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Блок "Не нашли ответ?" */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
            <h3 className="text-xl font-bold mb-4">
              {t('faq.no_answer_title', 'Не нашли ответ на свой вопрос?')}
            </h3>
            <p className="mb-6 text-blue-100">
              {t('faq.no_answer_desc', 'Наша служба поддержки готова помочь вам 24/7')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contacts"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {t('faq.contact_support', 'Связаться с поддержкой')}
              </a>
              <a
                href="tel:+998781501515"
                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Позвонить: +998 78 150 15 15
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQPage