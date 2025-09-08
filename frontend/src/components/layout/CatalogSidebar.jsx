
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiX, FiChevronRight, FiGrid, FiSmartphone, FiUser, 
  FiHome, FiActivity, FiHeart, FiTruck, FiBook, 
  FiGift, FiShoppingBag, FiTag, FiZap, FiStar, FiCircle
} from 'react-icons/fi'
import { categoriesApi } from '../../services/api'

const CatalogSidebar = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getCategories()
      console.log('📂 Загружены категории:', response)
      
      // Преобразуем данные если они приходят с API
      const categoriesData = response?.data || response || []
      
      // Добавляем иконки к категориям из API
      const categoriesWithIcons = categoriesData.map((category, index) => ({
        ...category,
        icon: getIconForCategory(category.name || category.slug, index)
      }))
      
      setCategories(categoriesWithIcons)
    } catch (error) {
      console.error('❌ Ошибка загрузки категорий:', error)
      // Fallback категории если API недоступен
      setCategories([
        { id: 1, name: 'Электроника', icon: <FiSmartphone className="h-5 w-5" />, slug: 'electronics' },
        { id: 2, name: 'Одежда', icon: <FiUser className="h-5 w-5" />, slug: 'clothing' },
        { id: 3, name: 'Дом и сад', icon: <FiHome className="h-5 w-5" />, slug: 'home' },
        { id: 4, name: 'Спорт', icon: <FiActivity className="h-5 w-5" />, slug: 'sports' },
        { id: 5, name: 'Красота', icon: <FiHeart className="h-5 w-5" />, slug: 'beauty' },
        { id: 6, name: 'Автотовары', icon: <FiTruck className="h-5 w-5" />, slug: 'auto' },
        { id: 7, name: 'Книги', icon: <FiBook className="h-5 w-5" />, slug: 'books' },
        { id: 8, name: 'Игрушки', icon: <FiGift className="h-5 w-5" />, slug: 'toys' },
        { id: 9, name: 'Продукты', icon: <FiShoppingBag className="h-5 w-5" />, slug: 'food' },
        { id: 10, name: 'Зоотовары', icon: <FiCircle className="h-5 w-5" />, slug: 'pets' }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Функция для получения иконки по названию категории
  const getIconForCategory = (name, index) => {
    const iconMap = {
      'электроника': <FiSmartphone className="h-5 w-5" />,
      'одежда': <FiUser className="h-5 w-5" />,
      'дом': <FiHome className="h-5 w-5" />,
      'спорт': <FiActivity className="h-5 w-5" />,
      'красота': <FiHeart className="h-5 w-5" />,
      'авто': <FiTruck className="h-5 w-5" />,
      'книги': <FiBook className="h-5 w-5" />,
      'игрушки': <FiGift className="h-5 w-5" />,
      'продукты': <FiShoppingBag className="h-5 w-5" />,
      'зоо': <FiCircle className="h-5 w-5" />
    }
    
    // Ищем подходящую иконку по ключевым словам
    const categoryKey = Object.keys(iconMap).find(key => 
      name?.toLowerCase().includes(key)
    )
    
    if (categoryKey) {
      return iconMap[categoryKey]
    }
    
    // Fallback иконки по индексу
    const fallbackIcons = [
      <FiSmartphone className="h-5 w-5" />,
      <FiUser className="h-5 w-5" />,
      <FiHome className="h-5 w-5" />,
      <FiActivity className="h-5 w-5" />,
      <FiHeart className="h-5 w-5" />,
      <FiTruck className="h-5 w-5" />,
      <FiBook className="h-5 w-5" />,
      <FiGift className="h-5 w-5" />,
      <FiShoppingBag className="h-5 w-5" />,
      <FiCircle className="h-5 w-5" />
    ]
    
    return fallbackIcons[index % fallbackIcons.length]
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-r border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <FiGrid className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">Каталог товаров</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4">
              {/* Все товары */}
              <Link
                to="/catalog"
                onClick={onClose}
                className="flex items-center justify-between px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200 group border-b border-gray-100"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-200">
                    <FiGrid className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                    Все товары
                  </span>
                </div>
                <FiChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
              </Link>

              {/* Категории */}
              {categories.map((category) => (
                <Link
                  key={category.id || category._id}
                  to={`/category/${category.slug || category._id}`}
                  onClick={onClose}
                  className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:scale-105 transition-all duration-200">
                      {category.icon || <FiShoppingBag className="h-5 w-5" />}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </span>
                      {category.productCount && (
                        <div className="text-sm text-gray-500 group-hover:text-blue-400 transition-colors">
                          {category.productCount} товаров
                        </div>
                      )}
                    </div>
                  </div>
                  <FiChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Специальные разделы</h3>
          <div className="space-y-2">
            <Link
              to="/catalog?filter=brands"
              onClick={onClose}
              className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-all duration-200 p-2 rounded-lg hover:bg-white group"
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-200">
                <FiTag className="h-4 w-4" />
              </div>
              <span className="font-medium">Все бренды</span>
            </Link>
            <Link
              to="/catalog?filter=sales"
              onClick={onClose}
              className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-all duration-200 p-2 rounded-lg hover:bg-white group"
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 group-hover:text-orange-500 group-hover:bg-orange-50 transition-all duration-200">
                <FiZap className="h-4 w-4" />
              </div>
              <span className="font-medium">Акции и скидки</span>
            </Link>
            <Link
              to="/catalog?filter=new"
              onClick={onClose}
              className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-all duration-200 p-2 rounded-lg hover:bg-white group"
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 group-hover:text-green-500 group-hover:bg-green-50 transition-all duration-200">
                <FiStar className="h-4 w-4" />
              </div>
              <span className="font-medium">Новинки</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default CatalogSidebar
