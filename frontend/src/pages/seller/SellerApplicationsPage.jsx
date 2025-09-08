/**
 * 📋 СТРАНИЦА ЗАЯВОК В ПРОДАВЦЫ
 * Отдельная страница для управления заявками на статус продавца
 */

import { useState, useEffect } from 'react'
import {
  FiUsers, FiCheck, FiX, FiEye, FiSearch, FiFilter,
  FiCalendar, FiMail, FiPhone, FiMapPin, FiFileText
} from 'react-icons/fi'

const SellerApplicationsPage = () => {
  const [applications, setApplications] = useState([])
  const [filteredApplications, setFilteredApplications] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // Демо данные для заявок
  const demoApplications = [
    {
      id: 'app_001',
      firstName: 'Анна',
      lastName: 'Сидорова',
      email: 'anna.sidorova@email.com',
      phone: '+998901234567',
      companyName: 'TechStore',
      status: 'pending',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'app_002',
      firstName: 'Михаил',
      lastName: 'Иванов',
      email: 'm.ivanov@email.com',
      companyName: 'FashionHub',
      status: 'approved',
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ]

  useEffect(() => {
    loadApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, selectedStatus, searchQuery])

  const loadApplications = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setApplications(demoApplications)
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = applications

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus)
    }

    if (searchQuery) {
      filtered = filtered.filter(app =>
        app.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredApplications(filtered)
  }

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      )
    } catch (error) {
      console.error('Ошибка изменения статуса:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning text-white'
      case 'approved': return 'bg-success text-white'
      case 'rejected': return 'bg-error text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает'
      case 'approved': return 'Одобрена'
      case 'rejected': return 'Отклонена'
      default: return status
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStats = () => {
    return {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Заявки в продавцы</h1>
          <p className="text-gray-600 mt-2">Управление заявками на статус продавца</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadApplications}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Обновить
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <FiUsers className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Всего заявок</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-warning rounded-lg flex items-center justify-center mr-4">
              <FiCalendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Ожидают</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center mr-4">
              <FiCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-600">Одобрено</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-error rounded-lg flex items-center justify-center mr-4">
              <FiX className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Отклонено</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Поиск по имени, email, компании..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Все статусы</option>
              <option value="pending">Ожидают</option>
              <option value="approved">Одобрены</option>
              <option value="rejected">Отклонены</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Показано {filteredApplications.length} из {applications.length} заявок
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка заявок...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Кандидат
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Компания
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата подачи
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-primary-600 font-medium">
                            {application.firstName[0]}{application.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.firstName} {application.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{application.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.companyName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(application.submittedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-primary-600 hover:text-primary-900 p-1"
                          title="Просмотреть детали"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>

                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(application.id, 'approved')}
                              className="text-success hover:text-green-700 p-1"
                              title="Одобрить"
                            >
                              <FiCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(application.id, 'rejected')}
                              className="text-error hover:text-red-700 p-1"
                              title="Отклонить"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Заявок не найдено</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || selectedStatus !== 'all'
                    ? 'Попробуйте изменить фильтры поиска'
                    : 'Новых заявок пока нет'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerApplicationsPage