/**
 * 🔐 ЗАЩИЩЕННЫЙ РОУТ
 * Компонент для ограничения доступа к страницам только для авторизованных пользователей
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './ui/LoadingSpinner'

const ProtectedRoute = ({ children, requireRole = null }) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  // Показываем загрузку пока проверяется авторизация
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Если не авторизован, перенаправляем на логин с сохранением попытки перехода
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Проверка роли, если требуется
  if (requireRole && user?.role !== requireRole) {
    return <Navigate to="/" replace />
  }

  // Если все проверки пройдены, показываем содержимое
  return children
}

export default ProtectedRoute





