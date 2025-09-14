import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiX, FiChevronRight, FiGrid, FiSmartphone, FiUser, 
  FiHome, FiActivity, FiHeart, FiTruck, FiBook, 
  FiGift, FiShoppingBag, FiTag, FiZap, FiStar, FiCircle,
  FiSearch, FiPercent, FiClock
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
        className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out border-r border-gray-200 lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FiGrid className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Каталог товаров</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск по категориям..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <FiSearch className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-100">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-2">
              {/* Все товары */}
              <Link
                to="/catalog"
                onClick={onClose}
                className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors group border-b border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-200">
                    <FiGrid className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-blue-600">
                    Все товары
                  </span>
                </div>
                <FiChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
              </Link>

              {/* Категории */}
              {categories.map((category) => (
                <Link
                  key={category.id || category._id}
                  to={`/category/${category.slug || category.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group border-b border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 group-hover:text-blue-600 group-hover:bg-blue-50">
                      {category.icon || <FiShoppingBag className="h-5 w-5" />}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 group-hover:text-blue-600">
                        {typeof category.name === 'object' ? category.name?.ru || category.name?.en || category.name?.uz || 'Категория' : category.name || 'Категория'}
                      </span>
                      {category.productCount && (
                        <div className="text-sm text-gray-500 group-hover:text-blue-400">
                          {category.productCount} товаров
                        </div>
                      )}
                    </div>
                  </div>
                  <FiChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Special Sections */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Специальные разделы</h3>
          <div className="space-y-2">
            <Link
              to="/catalog?filter=brands"
              onClick={onClose}
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors p-3 rounded-lg hover:bg-white border border-gray-200"
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-600">
                <FiTag className="h-4 w-4" />
              </div>
              <div>
                <span className="font-medium">Все бренды</span>
                <div className="text-xs text-gray-500">Популярные производители</div>
              </div>
            </Link>
            <Link
              to="/catalog?filter=sales"
              onClick={onClose}
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors p-3 rounded-lg hover:bg-white border border-gray-200"
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-orange-500">
                <FiPercent className="h-4 w-4" />
              </div>
              <div>
                <span className="font-medium">Акции и скидки</span>
                <div className="text-xs text-gray-500">Специальные предложения</div>
              </div>
            </Link>
            <Link
              to="/catalog?filter=new"
              onClick={onClose}
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors p-3 rounded-lg hover:bg-white border border-gray-200"
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-green-500">
                <FiClock className="h-4 w-4" />
              </div>
              <div>
                <span className="font-medium">Новинки</span>
                <div className="text-xs text-gray-500">Свежие поступления</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default CatalogSidebar