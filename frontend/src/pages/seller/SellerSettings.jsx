import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const SellerSettings = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      storeName: 'Мой магазин',
      description: 'Лучшие товары по отличным ценам',
      phone: '+998901234567',
      email: 'seller@example.com',
      address: 'Ташкент, Узбекистан',
      logo: null
    },
    notifications: {
      newOrders: true,
      paymentUpdates: true,
      productReviews: true,
      promotions: false,
      marketingEmails: false
    },
    shop: {
      workingHours: '09:00 - 21:00',
      deliveryZones: ['Ташкент', 'Андижан', 'Самарканд'],
      returnPolicy: '30 дней',
      freeShippingThreshold: 100,
      currency: 'USD'
    }
  });

  const tabs = [
    { id: 'profile', name: t('seller.store_profile'), icon: '🏪' },
    { id: 'notifications', name: t('seller.notifications'), icon: '🔔' },
    { id: 'shop', name: t('seller.shop_settings'), icon: '⚙️' },
    { id: 'security', name: t('seller.security'), icon: '🔒' }
  ];

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Настройки сохранены!');
    }, 1000);
  };

  const updateProfileSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      profile: { ...prev.profile, [key]: value }
    }));
  };

  const updateNotificationSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  const updateShopSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      shop: { ...prev.shop, [key]: value }
    }));
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Информация о магазине</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название магазина
            </label>
            <input
              type="text"
              value={settings.profile.storeName}
              onChange={(e) => updateProfileSetting('storeName', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tendo-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => updateProfileSetting('email', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tendo-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Телефон
            </label>
            <input
              type="tel"
              value={settings.profile.phone}
              onChange={(e) => updateProfileSetting('phone', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tendo-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Адрес
            </label>
            <input
              type="text"
              value={settings.profile.address}
              onChange={(e) => updateProfileSetting('address', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tendo-primary focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание магазина
          </label>
          <textarea
            rows="4"
            value={settings.profile.description}
            onChange={(e) => updateProfileSetting('description', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tendo-primary focus:border-transparent"
            placeholder="Расскажите о своем магазине..."
          />
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Логотип магазина
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
              {settings.profile.logo ? (
                <img src={settings.profile.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <span className="text-gray-400 text-2xl">🏪</span>
              )}
            </div>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
              Загрузить логотип
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Настройки уведомлений</h3>
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {key === 'newOrders' && 'Новые заказы'}
                  {key === 'paymentUpdates' && 'Обновления платежей'}
                  {key === 'productReviews' && 'Отзывы о товарах'}
                  {key === 'promotions' && 'Промо-акции'}
                  {key === 'marketingEmails' && 'Маркетинговые письма'}
                </h4>
                <p className="text-sm text-gray-500">
                  {key === 'newOrders' && 'Получать уведомления о новых заказах'}
                  {key === 'paymentUpdates' && 'Уведомления об изменениях в платежах'}
                  {key === 'productReviews' && 'Новые отзывы на ваши товары'}
                  {key === 'promotions' && 'Уведомления о скидках и акциях'}
                  {key === 'marketingEmails' && 'Получать маркетинговые материалы'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateNotificationSetting(key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tendo-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tendo-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderShopTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Настройки магазина</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Часы работы
            </label>
            <input
              type="text"
              value={settings.shop.workingHours}
              onChange={(e) => updateShopSetting('workingHours', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tendo-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Валюта
            </label>
            <select
              value={settings.shop.currency}
              onChange={(e) => updateShopSetting('currency', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tendo-primary focus:border-transparent"
            >
              <option value="USD">USD</option>
              <option value="UZS">UZS</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Политика возврата (дней)
            </label>
            <input
              type="text"
              value={settings.shop.returnPolicy}
              onChange={(e) => updateShopSetting('returnPolicy', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tendo-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Бесплатная доставка от ($)
            </label>
            <input
              type="number"
              value={settings.shop.freeShippingThreshold}
              onChange={(e) => updateShopSetting('freeShippingThreshold', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tendo-primary focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Зоны доставки
          </label>
          <div className="flex flex-wrap gap-2">
            {settings.shop.deliveryZones.map((zone, index) => (
              <span key={index} className="bg-tendo-primary/10 text-tendo-primary px-3 py-1 rounded-full text-sm">
                {zone}
              </span>
            ))}
          </div>
          <button className="mt-2 text-tendo-primary hover:text-tendo-blue text-sm font-medium">
            + Добавить зону
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Безопасность</h3>
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Изменить пароль</h4>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Текущий пароль"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tendo-primary focus:border-transparent"
              />
              <input
                type="password"
                placeholder="Новый пароль"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tendo-primary focus:border-transparent"
              />
              <input
                type="password"
                placeholder="Подтвердить новый пароль"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tendo-primary focus:border-transparent"
              />
              <button className="bg-tendo-primary text-white px-4 py-2 rounded-lg hover:bg-tendo-blue">
                Изменить пароль
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Двухфакторная аутентификация</h4>
            <p className="text-sm text-gray-600 mb-3">
              Добавьте дополнительный уровень безопасности к вашему аккаунту
            </p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Включить 2FA
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Активные сеансы</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2">
                <div>
                  <div className="text-sm text-gray-900">Текущий сеанс</div>
                  <div className="text-xs text-gray-500">Chrome на Windows • Ташкент, Узбекистан</div>
                </div>
                <span className="text-xs text-green-600">Активен</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'notifications': return renderNotificationsTab();
      case 'shop': return renderShopTab();
      case 'security': return renderSecurityTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('seller.settings')}</h1>
          <p className="text-gray-600">{t('seller.manage_store')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-tendo-primary text-tendo-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-tendo-primary text-white px-6 py-2 rounded-lg hover:bg-tendo-blue disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </>
              ) : (
                'Сохранить изменения'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerSettings;