/**
 * 💳 ADVANCED PAYMENT METHOD SELECTOR FOR UZBEKISTAN
 * Полноценная интеграция с Payme, Click и другими местными платежными системами
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// Базовый URL API (работает в dev и prod)
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:5000';

const generateIdempotencyKey = () => `pay-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const PaymentMethodSelector = ({ 
  selectedMethod, 
  onMethodSelect, 
  amount = 0, 
  order = null,
  onPaymentCreated = null 
}) => {
  const { t, language } = useLanguage();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // Загрузить методы оплаты с сервера
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/v1/payments/methods`, { cache: 'no-store' });
        const data = await response.json();
        
        if (data.success) {
          setPaymentMethods(data.data.filter(method => method.enabled));
        } else {
          throw new Error(data.error || 'Ошибка загрузки методов оплаты');
        }
      } catch (error) {
        console.error('Payment methods loading error:', error);
        setError('Не удалось загрузить методы оплаты');
        
        // Fallback методы
        setPaymentMethods([
          {
            id: 'cash',
            name: {
              ru: 'Наличный расчет при доставке',
              uz: 'Yetkazib berishda naqd to\'lov',
              en: 'Cash on Delivery'
            },
            icon: '💵',
            fee: 0,
            enabled: true
          },
          {
            id: 'payme',
            name: {
              ru: 'Payme',
              uz: 'Payme',
              en: 'Payme'
            },
            icon: '📱',
            fee: 0,
            enabled: true
          },
          {
            id: 'click',
            name: {
              ru: 'Click',
              uz: 'Click',
              en: 'Click'
            },
            icon: '💳',
            fee: 0,
            enabled: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentMethods();
  }, []);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' сум';
  };

  const getMethodName = (method) => {
    return method.name[language] || method.name.ru || method.name.en;
  };

  const createPayment = async (methodId) => {
    if (!order?.id) {
      setError('Заказ не найден');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Idempotency-Key': generateIdempotencyKey()
        },
        body: JSON.stringify({
          orderId: order.id,
          paymentMethod: methodId,
          returnUrl: `${window.location.origin}/payment/success`
        })
      });

      const data = await response.json();

      if (data.success) {
        if (onPaymentCreated) {
          onPaymentCreated(data.data);
        }

        // Для онлайн платежей перенаправляем на страницу оплаты
        if (data.data.paymentUrl && ['payme', 'click'].includes(methodId)) {
          window.location.href = data.data.paymentUrl;
        }
      } else {
        throw new Error(data.error || 'Ошибка создания платежа');
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      setError(error.message || 'Ошибка при создании платежа');
    } finally {
      setCreating(false);
    }
  };

  const handleMethodSelect = (methodId) => {
    onMethodSelect(methodId);
    
    // Для онлайн методов создаем платеж сразу
    if (['payme', 'click', 'uzcard', 'humo'].includes(methodId)) {
      createPayment(methodId);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded mb-3"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('payment.methods', 'Способы оплаты')}
        </h3>
        {amount > 0 && (
          <div className="text-lg font-bold text-blue-600">
            {formatAmount(amount)}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}
      
      <div className="grid gap-3">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.id;
          const isProcessing = creating && isSelected;
          
          return (
            <div
              key={method.id}
              className={`
                relative p-4 border cursor-pointer transition-colors duration-200
                ${isSelected 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
                }
                ${isProcessing ? 'opacity-60' : ''}
              `}
              onClick={() => !isProcessing && handleMethodSelect(method.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">
                    {method.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {getMethodName(method)}
                    </div>
                    
                    {/* Описание метода */}
                    <div className="text-sm text-gray-600 mt-1">
                      {method.id === 'cash' && t('payment.cash_desc', 'Оплата наличными при получении')}
                      {method.id === 'payme' && t('payment.payme_desc', 'Быстрая оплата через Payme')}
                      {method.id === 'click' && t('payment.click_desc', 'Онлайн оплата через Click')}
                      {method.id === 'uzcard' && t('payment.uzcard_desc', 'Оплата картой UzCard')}
                      {method.id === 'humo' && t('payment.humo_desc', 'Оплата картой Humo')}
                    </div>

                    {/* Комиссия */}
                    {method.fee > 0 && (
                      <div className="text-xs text-gray-700 mt-1 font-medium">
                        + {formatAmount(method.fee)} {t('payment.fee', 'комиссия')}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Индикатор обработки */}
                  {isProcessing && (
                    <div className="flex items-center text-gray-600">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm">{t('payment.processing', 'Обработка...')}</span>
                    </div>
                  )}

                  {/* Радио кнопка */}
                  <div className={`
                    w-4 h-4 border rounded-full flex items-center justify-center
                    ${isSelected 
                      ? 'border-blue-600 bg-blue-600' 
                      : 'border-gray-300'
                    }
                  `}>
                    {isSelected && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Дополнительная информация для выбранного метода */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">
                      {method.id === 'cash' && t('payment.cash_selected', 'Оплата при получении заказа')}
                      {method.id === 'payme' && t('payment.payme_selected', 'Вы будете перенаправлены в приложение Payme')}
                      {method.id === 'click' && t('payment.click_selected', 'Переход на безопасную страницу Click')}
                      {['uzcard', 'humo'].includes(method.id) && t('payment.card_selected', 'Безопасная оплата картой')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Информация о безопасности */}
      <div className="mt-6 p-3 bg-gray-50 border border-gray-200">
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-gray-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 1L3 5v6c0 5.55 3.84 10.74 7 11 3.16-.26 7-5.45 7-11V5l-7-4zM8 14l-3-3 1.41-1.41L8 11.17l5.59-5.58L15 7l-7 7z" clipRule="evenodd"/>
          </svg>
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              {t('payment.secure_payments', 'Безопасные платежи')}
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              {t('payment.security_info', 'Все платежи защищены SSL-шифрованием')}
            </p>
          </div>
        </div>
      </div>

      {/* Поддержка */}
      <div className="text-center text-xs text-gray-500">
        {t('payment.support_text', 'Возникли проблемы с оплатой?')}{' '}
        <a href="/contacts" className="text-gray-700 hover:text-gray-900 underline underline-offset-2">
          {t('payment.contact_support', 'Свяжитесь с поддержкой')}
        </a>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;