import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

const defaultLang = (() => {
  const saved = localStorage.getItem('admin_lang');
  if (saved) return saved;
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'ru';
  if (nav.startsWith('uz')) return 'uz';
  if (nav.startsWith('en')) return 'en';
  return 'ru';
})();

const translations = {
  ru: {
    'dashboard.title': 'Дашборд',
    'analytics.title': 'Аналитика маркетплейса',
    'filters.period': 'Период',
    'period.7d': '7 дней',
    'period.30d': '30 дней',
    'period.90d': '90 дней',
    'period.1y': '1 год',
    'loading.analytics': 'Загрузка аналитики...',
    'stats.totalRevenue': 'Общая выручка',
    'stats.totalOrders': 'Всего заказов',
    'stats.totalProducts': 'Товаров',
    'stats.totalUsers': 'Пользователей',
    'stats.activeUsers': 'Активных пользователей',
    'stats.totalCategories': 'Категорий',
    'analytics.salesByCategory': 'Распределение товаров по категориям',
    'analytics.topProducts': 'Самые дорогие товары',
    'analytics.recentOrders': 'Последние заказы',
    'table.category': 'Категория',
    'table.count': 'Количество товаров',
    'table.total': 'Общая стоимость',
    'table.name': 'Название товара',
    'table.price': 'Цена',
    'table.status': 'Статус',
    'table.customer': 'Покупатель',
    'table.sum': 'Сумма',
    'table.date': 'Дата'
  },
  uz: {
    'dashboard.title': 'Boshqaruv paneli',
    'analytics.title': 'Marketpleys analitikasi',
    'filters.period': 'Davr',
    'period.7d': '7 kun',
    'period.30d': '30 kun',
    'period.90d': '90 kun',
    'period.1y': '1 yil',
    'loading.analytics': 'Analitika yuklanmoqda...',
    'stats.totalRevenue': 'Umumiy daromad',
    'stats.totalOrders': 'Buyurtmalar soni',
    'stats.totalProducts': 'Mahsulotlar',
    'stats.totalUsers': 'Foydalanuvchilar',
    'stats.activeUsers': 'Faol foydalanuvchilar',
    'stats.totalCategories': 'Kategoriyalar',
    'analytics.salesByCategory': 'Mahsulotlarning kategoriyalar bo\'yicha taqsimoti',
    'analytics.topProducts': 'Eng qimmat mahsulotlar',
    'analytics.recentOrders': 'Oxirgi buyurtmalar',
    'table.category': 'Kategoriya',
    'table.count': 'Mahsulotlar soni',
    'table.total': 'Umumiy narx',
    'table.name': 'Mahsulot nomi',
    'table.price': 'Narxi',
    'table.status': 'Holati',
    'table.customer': 'Xaridor',
    'table.sum': 'Summasi',
    'table.date': 'Sana'
  },
  en: {
    'dashboard.title': 'Dashboard',
    'analytics.title': 'Marketplace Analytics',
    'filters.period': 'Period',
    'period.7d': '7 days',
    'period.30d': '30 days',
    'period.90d': '90 days',
    'period.1y': '1 year',
    'loading.analytics': 'Loading analytics...',
    'stats.totalRevenue': 'Total Revenue',
    'stats.totalOrders': 'Total Orders',
    'stats.totalProducts': 'Products',
    'stats.totalUsers': 'Users',
    'stats.activeUsers': 'Active Users',
    'stats.totalCategories': 'Categories',
    'analytics.salesByCategory': 'Products by Category',
    'analytics.topProducts': 'Top Priced Products',
    'analytics.recentOrders': 'Recent Orders',
    'table.category': 'Category',
    'table.count': 'Count',
    'table.total': 'Total Value',
    'table.name': 'Product Name',
    'table.price': 'Price',
    'table.status': 'Status',
    'table.customer': 'Customer',
    'table.sum': 'Amount',
    'table.date': 'Date'
  }
};

const I18nContext = createContext({ lang: defaultLang, setLang: () => {}, t: (k) => k });

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(defaultLang);

  useEffect(() => {
    localStorage.setItem('admin_lang', lang);
  }, [lang]);

  const t = useMemo(() => {
    const dict = translations[lang] || translations.ru;
    return (key, fallback) => dict[key] ?? fallback ?? key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
