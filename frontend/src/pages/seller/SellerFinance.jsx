import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';

const SellerFinance = () => {
  const { t } = useLanguage();
  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load real finance data from backend
  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      const response = await api.seller.getFinance();
      
      if (response.success) {
        setFinanceData(response.data);
      } else {
        // Показываем пустое состояние если нет данных
        setFinanceData({
          balance: 0,
          monthlyRevenue: 0,
          pendingPayouts: 0,
          totalEarnings: 0,
          recentTransactions: [],
          monthlyChart: []
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки финансовых данных:', error);
      setFinanceData({
        balance: 0,
        monthlyRevenue: 0,
        pendingPayouts: 0,
        totalEarnings: 0,
        recentTransactions: [],
        monthlyChart: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'sale': return '💰';
      case 'payout': return '🏦';
      case 'refund': return '↩️';
      default: return '💳';
    }
  };

  const getTransactionColor = (type, amount) => {
    if (amount > 0) return 'text-green-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tendo-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('seller.finance')}</h1>
          <p className="text-gray-600">{t('seller.track_earnings')}</p>
        </div>
        <button className="bg-tendo-primary text-white px-4 py-2 rounded-lg hover:bg-tendo-blue transition-colors">
          {t('seller.request_payout')}
        </button>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">{t('seller.current_balance')}</p>
              <p className="text-2xl font-bold">${financeData.balance.toFixed(2)}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">{t('seller.monthly_revenue')}</p>
              <p className="text-2xl font-bold">${financeData.monthlyRevenue.toFixed(2)}</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">{t('seller.pending_payouts')}</p>
              <p className="text-2xl font-bold">${financeData.pendingPayouts.toFixed(2)}</p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">{t('seller.total_earnings')}</p>
              <p className="text-2xl font-bold">${financeData.totalEarnings.toFixed(2)}</p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
        </div>
      </div>

      {/* Charts and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Доходы по месяцам</h3>
          <div className="space-y-3">
            {financeData.monthlyChart.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-tendo-primary h-2 rounded-full" 
                      style={{ width: `${(item.revenue / 10000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">${item.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Последние транзакции</h3>
          <div className="space-y-4">
            {financeData.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getTransactionIcon(transaction.type)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${getTransactionColor(transaction.type, transaction.amount)}`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount)}
                  </p>
                  <p className={`text-xs ${
                    transaction.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {transaction.status === 'completed' ? 'Завершено' : 'В ожидании'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payout Settings */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Настройки выплат</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Банковская карта
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-900">**** **** **** 1234</div>
                <div className="text-xs text-gray-500">Humo Card</div>
              </div>
              <button className="text-tendo-primary hover:text-tendo-blue text-sm font-medium">
                Изменить
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Минимальная сумма выплаты
            </label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="50">$50</option>
              <option value="100">$100</option>
              <option value="200">$200</option>
              <option value="500">$500</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerFinance;












