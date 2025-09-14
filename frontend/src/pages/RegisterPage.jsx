/**
 * 📝 СТРАНИЦА РЕГИСТРАЦИИ
 * Создание новых аккаунтов пользователей
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { citiesApi } from '../services/api'
// import { useFormValidation, validationRules } from '../hooks/useFormValidation'

const RegisterPage = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth()

  // Перенаправление если уже авторизован
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Простая валидация формы
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: 'tashkent',
    agreeToTerms: false
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleValidationChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName) errors.firstName = 'Введите имя';
    if (!formData.lastName) errors.lastName = 'Введите фамилию';
    if (!formData.email) errors.email = 'Введите email';
    if (!formData.phone) errors.phone = 'Введите номер телефона';
    if (!formData.password) errors.password = 'Введите пароль';
    if (!formData.confirmPassword) errors.confirmPassword = 'Подтвердите пароль';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Пароли не совпадают';
    if (!formData.agreeToTerms) errors.agreeToTerms = 'Необходимо согласие с условиями';

    setValidationErrors(errors);
    
    // Возвращаем первую ошибку или null
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      return errors[errorKeys[0]];
    }
    return null;
  };

  const [formError, setFormError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [cities, setCities] = useState([])

  // Правильные города с английскими значениями
  const correctCities = [
    { value: 'tashkent', name: 'Ташкент' },
    { value: 'samarkand', name: 'Самарканд' },
    { value: 'bukhara', name: 'Бухара' },
    { value: 'andijan', name: 'Андижан' },
    { value: 'namangan', name: 'Наманган' },
    { value: 'fergana', name: 'Фергана' },
    { value: 'nukus', name: 'Нукус' },
    { value: 'urgench', name: 'Ургенч' },
    { value: 'karshi', name: 'Карши' },
    { value: 'termez', name: 'Термез' }
  ]

  // Загрузка городов
  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await citiesApi.getCities()
        if (response.success) {
          // Преобразуем данные с сервера, но все равно используем правильные значения
          const serverCities = response.data.map(city => {
            const correctCity = correctCities.find(c => 
              c.name === city.name || c.value === city.slug || c.value === city._id
            )
            return correctCity || { value: 'tashkent', name: city.name }
          })
          setCities(serverCities)
        } else {
          setCities(correctCities)
        }
      } catch (error) {
        console.error('Error loading cities:', error)
        // Используем правильные данные при ошибке
        setCities(correctCities)
      }
    }
    loadCities()
  }, [])

  // Очистка ошибок при изменении полей
  useEffect(() => {
    if (error || formError) {
      clearError()
      setFormError('')
    }
  }, [formData])

  // Обработка изменений в форме
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    handleValidationChange(name, type === 'checkbox' ? checked : value)
  }

  // Старая валидация формы (теперь используем хук)
  const validateOldForm = () => {
    if (!formData.firstName.trim()) {
      return t('first_name_required', 'Введите имя')
    }
    if (!formData.lastName.trim()) {
      return t('last_name_required', 'Введите фамилию')
    }
    if (!formData.email.trim()) {
      return t('email_required', 'Введите email')
    }
    if (!formData.email.includes('@')) {
      return t('enter_valid_email', 'Введите корректный email адрес')
    }
    if (!formData.phone.trim()) {
      return t('phone_required', 'Введите номер телефона')
    }
    if (!formData.phone.match(/^\+998[0-9]{9}$/)) {
      return t('phone_invalid_format', 'Номер телефона должен быть в формате +998XXXXXXXXX')
    }
    if (!formData.password) {
      return t('password', 'Введите пароль')
    }
    if (formData.password.length < 6) {
      return t('password_min_length', 'Пароль должен содержать минимум 6 символов')
    }
    if (formData.password !== formData.confirmPassword) {
      return t('passwords_not_match', 'Пароли не совпадают')
    }
    // Город уже установлен по умолчанию
    if (!formData.agreeToTerms) {
      return t('agree_required', 'Необходимо согласиться с условиями использования')
    }
    return null
  }

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    try {
      const result = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        city: formData.city || 'tashkent'
      })

      if (result.success) {
        navigate('/', { replace: true })
      } else {
        setFormError(result.error || 'Ошибка регистрации')
      }
    } catch (err) {
      setFormError('Произошла ошибка при регистрации')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('create_account', 'Создать аккаунт')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('or', 'Или')}{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t('already_have_account', 'войдите, если у вас уже есть аккаунт')}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Имя и Фамилия */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  {t('first_name', 'Имя')} *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('first_name', 'Имя')}
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  {t('last_name', 'Фамилия')} *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('last_name', 'Фамилия')}
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('email_address', 'Email адрес')} *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Телефон */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                {t('phone_number', 'Номер телефона')} *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="+998901234567"
                value={formData.phone}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-500">{t('phone_format', 'Формат: +998XXXXXXXXX')}</p>
            </div>

            {/* Город */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                {t('city', 'Город')} *
              </label>
              <select
                id="city"
                name="city"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.city}
                onChange={handleChange}
              >
                <option value="">{t('select_city', 'Выберите город')}</option>
                {cities.map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Пароль */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('password', 'Пароль')} *
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('min_6_chars', 'Минимум 6 символов')}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Подтверждение пароля */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('confirm_password', 'Подтвердите пароль')} *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('repeat_password', 'Повторите пароль')}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Ошибки */}
          {(formError || error) && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-600">
                    {formError || error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Согласие с условиями */}
          <div className="flex items-center">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.agreeToTerms}
              onChange={handleChange}
            />
            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
              {t('agree_terms', 'Я согласен с условиями использования и политикой конфиденциальности')}
            </label>
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('registering', 'Регистрация...')}
                </div>
              ) : (
                t('register', 'Зарегистрироваться')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
