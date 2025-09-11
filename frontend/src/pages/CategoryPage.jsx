/**
 * 📱 СТРАНИЦА КАТЕГОРИИ
 * Отображает все товары определённой категории с фильтрацией
 */

import { useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { FiGrid, FiList, FiFilter, FiChevronDown, FiChevronRight, FiRefreshCw, FiTag, FiStar, FiShoppingBag, FiArrowLeft } from 'react-icons/fi'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ProductCard from '../components/product/ProductCard'
import { productsApi, categoriesApi, checkApiHealth } from '../services/api'

const CategoryPage = () => {
  const { categoryId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState(null)
  const [subcategories, setSubcategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('popularity')
  const [showFilters, setShowFilters] = useState(false)
  const [expandedFilterCategories, setExpandedFilterCategories] = useState(new Set())

  // Компонент для иерархического фильтра подкатегорий
  const CategoryFilterItem = ({ category, level = 0, selectedSubcategory, onSelect }) => {
    const hasSubcategories = category.subcategories && category.subcategories.length > 0
    const isExpanded = expandedFilterCategories.has(category.id)
    const isSelected = selectedSubcategory === category.id
    const paddingLeft = level * 12 + 16

    const toggleExpansion = () => {
      setExpandedFilterCategories(prev => {
        const newSet = new Set(prev)
        if (newSet.has(category.id)) {
          newSet.delete(category.id)
        } else {
          newSet.add(category.id)
        }
        return newSet
      })
    }

    return (
      <div>
        <button
          onClick={() => onSelect(category.id)}
          className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-between group ${
            isSelected
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-[1.01]'
              : 'hover:bg-gray-50 hover:scale-[1.005] text-gray-700'
          }`}
          style={{ paddingLeft }}
        >
          <div className="flex items-center space-x-2 flex-1">
            <span className="font-medium truncate">{category.name}</span>
            {category.count && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                isSelected
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
              }`}>
                {category.count}
              </span>
            )}
          </div>
          {hasSubcategories && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpansion()
              }}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? (
                <FiChevronDown className="h-3 w-3" />
              ) : (
                <FiChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
        </button>

        {/* Подкатегории */}
        {hasSubcategories && isExpanded && (
          <div className="ml-4">
            {category.subcategories.map(subcategory => (
              <CategoryFilterItem
                key={subcategory.id}
                category={subcategory}
                level={level + 1}
                selectedSubcategory={selectedSubcategory}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
  const [filters, setFilters] = useState({
    subcategory: searchParams.get('subcategory') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    brand: searchParams.get('brand') || '',
    rating: searchParams.get('rating') || '',
    inStock: searchParams.get('inStock') === 'true',
    discount: searchParams.get('discount') === 'true'
  })

  // Демо данные категорий с иерархической структурой
  const categoryData = {
    electronics: {
      id: 'electronics',
      name: 'Электроника',
      icon: '📱',
      description: 'Смартфоны, планшеты, ноутбуки и другая электроника',
      subcategories: [
        {
          id: 'electronics-smartphones',
          name: 'Смартфоны и гаджеты',
          count: 89,
          subcategories: [
            { id: 'electronics-smartphones-phones', name: 'Смартфоны', count: 45 },
            { id: 'electronics-smartphones-tablets', name: 'Планшеты', count: 23 },
            { id: 'electronics-smartphones-accessories', name: 'Аксессуары', count: 156 }
          ]
        },
        {
          id: 'electronics-computers',
          name: 'Компьютеры',
          count: 78,
          subcategories: [
            { id: 'electronics-computers-laptops', name: 'Ноутбуки', count: 34 },
            { id: 'electronics-computers-desktops', name: 'Настольные ПК', count: 12 },
            { id: 'electronics-computers-monitors', name: 'Мониторы', count: 18 },
            { id: 'electronics-computers-components', name: 'Комплектующие', count: 67 }
          ]
        },
        {
          id: 'electronics-audio-video',
          name: 'Аудио и видео',
          count: 92,
          subcategories: [
            { id: 'electronics-audio-headphones', name: 'Наушники', count: 38 },
            { id: 'electronics-audio-speakers', name: 'Колонки', count: 22 },
            { id: 'electronics-video-tvs', name: 'Телевизоры', count: 15 },
            { id: 'electronics-video-cameras', name: 'Видеокамеры', count: 17 }
          ]
        }
      ],
      brands: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Sony', 'LG']
    },
    clothing: {
      id: 'clothing',
      name: 'Одежда и обувь',
      icon: '👕',
      description: 'Мужская и женская одежда, обувь, аксессуары',
      subcategories: [
        { id: 'mens-clothing', name: 'Мужская одежда', count: 234 },
        { id: 'womens-clothing', name: 'Женская одежда', count: 345 },
        { id: 'shoes', name: 'Обувь', count: 189 },
        { id: 'accessories', name: 'Аксессуары', count: 124 }
      ],
      brands: ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Puma']
    },
    home: {
      id: 'home',
      name: 'Дом и сад',
      icon: '🏠',
      description: 'Товары для дома, сада, мебель, декор',
      subcategories: [
        { id: 'furniture', name: 'Мебель', count: 156 },
        { id: 'decor', name: 'Декор', count: 89 },
        { id: 'kitchen', name: 'Кухня', count: 123 },
        { id: 'garden', name: 'Сад', count: 88 }
      ],
      brands: ['IKEA', 'HomeStore', 'Garden Pro', 'Kitchen Master']
    }
  }

  // Загрузка товаров из API
  const loadProductsFromAPI = async (categoryId) => {
    try {
      // Попытка загрузить товары через API
      const response = await api.products.getByCategory(categoryId)
      if (response.success && response.data && response.data.length > 0) {
        return response.data
      }
    } catch (error) {
      console.log('API недоступен, показываем пустое состояние:', error)
    }
    return []
  }

  // Демо товары с поддержкой иерархических категорий (только для разработки)
  const generateDemoProducts = (categoryId) => {
    // Возвращаем пустой массив - больше не показываем fake товары
    return []
    
    const baseProducts = {
      'electronics': [
        { title: 'iPhone 15 Pro Max 256GB', price: 15990000, oldPrice: 17500000, brand: 'Apple', subcategory: 'electronics-smartphones-phones', rating: 4.8, reviews: 156, isNew: true },
        { title: 'Samsung Galaxy S24 Ultra', price: 14500000, brand: 'Samsung', subcategory: 'electronics-smartphones-phones', rating: 4.7, reviews: 98 },
        { title: 'MacBook Pro 16" M3', price: 25000000, brand: 'Apple', subcategory: 'electronics-computers-laptops', rating: 4.9, reviews: 67 },
        { title: 'iPad Air 5th Gen', price: 7800000, oldPrice: 8500000, brand: 'Apple', subcategory: 'electronics-smartphones-tablets', rating: 4.6, reviews: 143 },
        { title: 'Dell XPS 13', price: 18900000, brand: 'Dell', subcategory: 'electronics-computers-laptops', rating: 4.7, reviews: 89 },
        { title: 'Sony WH-1000XM5', price: 4500000, brand: 'Sony', subcategory: 'electronics-audio-headphones', rating: 4.8, reviews: 234 }
      ],
      'electronics-smartphones': [
        { title: 'iPhone 15 Pro Max 256GB', price: 15990000, oldPrice: 17500000, brand: 'Apple', subcategory: 'electronics-smartphones-phones', rating: 4.8, reviews: 156, isNew: true },
        { title: 'Samsung Galaxy S24 Ultra', price: 14500000, brand: 'Samsung', subcategory: 'electronics-smartphones-phones', rating: 4.7, reviews: 98 },
        { title: 'Xiaomi 14 Pro', price: 9800000, brand: 'Xiaomi', subcategory: 'electronics-smartphones-phones', rating: 4.6, reviews: 67 },
        { title: 'iPad Air 5th Gen', price: 7800000, oldPrice: 8500000, brand: 'Apple', subcategory: 'electronics-smartphones-tablets', rating: 4.6, reviews: 143 }
      ],
      'electronics-computers': [
        { title: 'MacBook Pro 16" M3', price: 25000000, brand: 'Apple', subcategory: 'electronics-computers-laptops', rating: 4.9, reviews: 67 },
        { title: 'Dell XPS 13', price: 18900000, brand: 'Dell', subcategory: 'electronics-computers-laptops', rating: 4.7, reviews: 89 },
        { title: 'ASUS ROG Gaming PC', price: 32000000, brand: 'ASUS', subcategory: 'electronics-computers-desktops', rating: 4.8, reviews: 45 },
        { title: 'Samsung 32" 4K Monitor', price: 5800000, brand: 'Samsung', subcategory: 'electronics-computers-monitors', rating: 4.5, reviews: 123 }
      ],
      'clothing': [
        { title: 'Nike Air Max 270', price: 1250000, oldPrice: 1500000, brand: 'Nike', subcategory: 'clothing-shoes', rating: 4.6, reviews: 234 },
        { title: 'Adidas Ultraboost 22', price: 1800000, brand: 'Adidas', subcategory: 'clothing-shoes', rating: 4.7, reviews: 189 },
        { title: 'Zara классическая рубашка', price: 450000, brand: 'Zara', subcategory: 'clothing-men-shirts', rating: 4.3, reviews: 89 },
        { title: 'H&M летнее платье', price: 380000, oldPrice: 450000, brand: 'H&M', subcategory: 'clothing-women-dresses', rating: 4.4, reviews: 156 }
      ]
    }

    // Если точного совпадения нет, пробуем найти по префиксу
    let products = baseProducts[categoryId] || []

    if (products.length === 0) {
      // Ищем продукты по префиксу категории
      for (const [key, value] of Object.entries(baseProducts)) {
        if (categoryId.startsWith(key)) {
          products = value.filter(product =>
            product.subcategory && product.subcategory.startsWith(categoryId)
          )
          if (products.length > 0) break
        }
      }
    }

    return products
  }

  useEffect(() => {
    loadCategoryData()
  }, [categoryId, filters, sortBy])

  // Функция для поиска категории по slug в иерархической структуре
  const findCategoryBySlug = (slug, categories = Object.values(categoryData)) => {
    for (const category of categories) {
      if (category.slug === slug || category.id === slug) {
        return category
      }
      if (category.subcategories) {
        const found = findCategoryBySlug(slug, category.subcategories)
        if (found) return found
      }
    }
    return null
  }

  // Функция для построения breadcrumbs
  const buildBreadcrumbs = (slug) => {
    const breadcrumbs = []
    let currentSlug = slug

    while (currentSlug) {
      const category = findCategoryBySlug(currentSlug)
      if (category) {
        breadcrumbs.unshift(category)
        // Если есть родительская категория, продолжаем поиск
        const parentSlug = currentSlug.includes('-') ? currentSlug.split('-').slice(0, -1).join('-') : null
        currentSlug = parentSlug
      } else {
        break
      }
    }

    return breadcrumbs
  }

  const loadCategoryData = async () => {
    setLoading(true)
    try {
      // TODO: Заменить на реальные API вызовы
      await new Promise(resolve => setTimeout(resolve, 500))

      let catData = categoryData[categoryId]
      if (!catData) {
        // Ищем в иерархической структуре
        catData = findCategoryBySlug(categoryId)
      }

      if (!catData) {
        throw new Error('Категория не найдена')
      }

      setCategory(catData)

      // Функция для получения всех подкатегорий рекурсивно
      const getAllSubcategories = (category, allSubs = []) => {
        if (category.subcategories) {
          category.subcategories.forEach(sub => {
            allSubs.push(sub)
            getAllSubcategories(sub, allSubs)
          })
        }
        return allSubs
      }

      // Если категория имеет подкатегории, показываем их
      if (catData.subcategories && catData.subcategories.length > 0) {
        setSubcategories(catData.subcategories)
      } else {
        // Если подкатегорий нет, ищем родительскую категорию
        const breadcrumbs = buildBreadcrumbs(categoryId)
        if (breadcrumbs.length > 1) {
          const parentCategory = breadcrumbs[breadcrumbs.length - 2]
          setSubcategories(parentCategory.subcategories || [])
        } else {
          setSubcategories([])
        }
      }

      setBrands(catData.brands || [])

      // Загружаем товары из API
      const apiProducts = await loadProductsFromAPI(categoryId)
      
      if (apiProducts.length === 0) {
        // Если нет товаров, показываем пустое состояние
        setProducts([])
        return
      }

      // Применяем фильтры
      let filteredProducts = applyFilters(apiProducts)
      
      // Сортировка
      filteredProducts = applySorting(filteredProducts)

      setProducts(filteredProducts)
    } catch (error) {
      console.error('Ошибка загрузки категории:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (products) => {
    return products.filter(product => {
      // Фильтр по подкатегории (включая вложенные)
      if (filters.subcategory) {
        if (product.subcategory !== filters.subcategory) {
          // Проверяем, является ли подкатегория потомком выбранной
          if (!product.subcategory || !product.subcategory.startsWith(filters.subcategory)) {
            return false
          }
        }
      }

      if (filters.brand && product.brand !== filters.brand) return false
      if (filters.priceMin && product.price < parseInt(filters.priceMin)) return false
      if (filters.priceMax && product.price > parseInt(filters.priceMax)) return false
      if (filters.rating && product.rating < parseFloat(filters.rating)) return false
      if (filters.discount && !product.oldPrice) return false
      return true
    })
  }

  const applySorting = (products) => {
    const sorted = [...products]
    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price)
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price)
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating)
      case 'new':
        return sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
      default: // popularity
        return sorted.sort((a, b) => b.reviews - a.reviews)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' сум'
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Обновляем URL
    const newSearchParams = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== false) newSearchParams.set(k, v.toString())
    })
    setSearchParams(newSearchParams)
  }

  const clearFilters = () => {
    setFilters({
      subcategory: '', priceMin: '', priceMax: '', brand: '', rating: '', inStock: false, discount: false
    })
    setSearchParams(new URLSearchParams())
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Категория не найдена</h1>
          <Link to="/catalog" className="text-blue-600 hover:text-blue-700">
            ← Вернуться в каталог
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        
        {/* Хлебные крошки */}
        <nav className="text-sm text-gray-500" style={{ marginBottom: '20px' }}>
          <Link to="/" className="hover:text-blue-600">Главная</Link>
          <FiChevronRight className="inline mx-2" />
          <Link to="/catalog" className="hover:text-blue-600">Каталог</Link>
          {(() => {
            const breadcrumbs = buildBreadcrumbs(categoryId)
            return breadcrumbs.slice(1).map((crumb, index) => (
              <span key={crumb.id}>
                <FiChevronRight className="inline mx-2" />
                {index === breadcrumbs.slice(1).length - 1 ? (
                  <span>{crumb.name}</span>
                ) : (
                  <Link to={`/category/${crumb.slug || crumb.id}`} className="hover:text-blue-600">
                    {crumb.name}
                  </Link>
                )}
              </span>
            ))
          })()}
        </nav>

        {/* Современный заголовок категории */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden">
            {/* Декоративные элементы */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-2xl">📱</span>
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-2">
                    {category.name}
                  </h1>
                  {(() => {
                    const breadcrumbs = buildBreadcrumbs(categoryId)
                    const parentCategory = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null
                    return parentCategory ? (
                      <p className="text-blue-200 text-lg">
                        Раздел <span className="font-semibold">{parentCategory.name}</span>
                      </p>
                    ) : (
                      <p className="text-blue-200 text-lg max-w-2xl">
            {category.description}
            {categoryId.includes('-') && (
              <span className="block text-sm text-blue-300 mt-2">
                Иерархическая категория • {categoryId.split('-').length - 1} уровень глубины
              </span>
            )}
          </p>
                    )
                  })()}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <p className="text-blue-200 font-medium">
                    <span className="text-2xl font-bold text-white">{products.length}</span> товаров
                  </p>
                  {subcategories.length > 0 && (
                    <p className="text-blue-200 text-sm">
                      {subcategories.length} подкатегорий
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 text-sm font-medium">Онлайн</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Современные фильтры */}
          <div className="lg:col-span-1">
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 py-3 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <span className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <FiFilter className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">Фильтры товаров</span>
                </span>
                <FiChevronDown className={`h-5 w-5 transform transition-all duration-300 ${showFilters ? 'rotate-180 scale-110' : ''}`} />
              </button>
          </div>

            <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              
              {/* Подкатегории с иерархической структурой */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
                    <FiGrid className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">Подкатегории</h3>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleFilterChange('subcategory', '')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      !filters.subcategory
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]'
                        : 'hover:bg-gray-50 hover:scale-[1.01] text-gray-700'
                    }`}
                  >
                    Все категории
                  </button>
                  {subcategories.map(sub => (
                    <CategoryFilterItem
                      key={sub.id}
                      category={sub}
                      level={0}
                      selectedSubcategory={filters.subcategory}
                      onSelect={(id) => handleFilterChange('subcategory', id)}
                    />
                  ))}
                </div>
              </div>

              {/* Бренды */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-md flex items-center justify-center">
                    <FiTag className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">Бренды</h3>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleFilterChange('brand', '')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      !filters.brand 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-[1.02]' 
                        : 'hover:bg-gray-50 hover:scale-[1.01] text-gray-700'
                    }`}
                  >
                    Все бренды
                  </button>
                  {brands.map(brand => (
                    <button
                      key={brand}
                      onClick={() => handleFilterChange('brand', brand)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                        filters.brand === brand 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-[1.02]' 
                          : 'hover:bg-gray-50 hover:scale-[1.01] text-gray-700'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Цена */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-md flex items-center justify-center">
                    <span className="text-white text-xs font-bold">₽</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Цена (сум)</h3>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Минимальная цена"
                      value={filters.priceMin}
                      onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-300 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Максимальная цена"
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-300 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Дополнительные фильтры */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-600 rounded-md flex items-center justify-center">
                    <FiStar className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">Дополнительно</h3>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center group cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={filters.discount}
                        onChange={(e) => handleFilterChange('discount', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 border-2 rounded-lg transition-all duration-300 flex items-center justify-center ${
                        filters.discount 
                          ? 'bg-gradient-to-br from-orange-500 to-red-600 border-orange-500 scale-110' 
                          : 'border-gray-300 group-hover:border-orange-400'
                      }`}>
                        {filters.discount && <span className="text-white text-xs">✓</span>}
                      </div>
                    </div>
                    <span className="ml-3 font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                      Со скидкой
                    </span>
                  </label>
                  <label className="flex items-center group cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 border-2 rounded-lg transition-all duration-300 flex items-center justify-center ${
                        filters.inStock 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-500 scale-110' 
                          : 'border-gray-300 group-hover:border-green-400'
                      }`}>
                        {filters.inStock && <span className="text-white text-xs">✓</span>}
                      </div>
                    </div>
                    <span className="ml-3 font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                      В наличии
                    </span>
                  </label>
                </div>
              </div>

              {/* Современная кнопка сброса фильтров */}
              <button
                onClick={clearFilters}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                <FiRefreshCw className="h-4 w-4" />
                <span>Сбросить фильтры</span>
              </button>
          </div>
        </div>

          {/* Товары */}
        <div className="lg:col-span-3">
            
            {/* Современная панель управления */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <FiFilter className="h-4 w-4 text-white" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Сортировать:</label>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300 cursor-pointer"
                  >
                    <option value="popularity">По популярности</option>
                    <option value="price_asc">Цена: по возрастанию</option>
                    <option value="price_desc">Цена: по убыванию</option>
                    <option value="rating">По рейтингу</option>
                    <option value="new">Сначала новые</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-gray-700">Вид:</span>
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-3 rounded-lg transition-all duration-300 ${
                        viewMode === 'grid' 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105' 
                          : 'text-gray-500 hover:text-blue-600 hover:bg-white'
                      }`}
                    >
                      <FiGrid className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3 rounded-lg transition-all duration-300 ${
                        viewMode === 'list' 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105' 
                          : 'text-gray-500 hover:text-blue-600 hover:bg-white'
                      }`}
                    >
                      <FiList className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Сетка товаров */}
            {products.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {products.map((product, index) => (
                  <div key={product._id || product.id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    
                    <div className="relative">
                      <img
                        src={product.images?.[0] || product.image || '/images/placeholder-product.jpg'}
                        alt={product.name?.ru || product.title || 'Товар'}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
                        }}
                      />
                      {product.isNew && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Новинка
                        </div>
                      )}
                      {product.originalPrice && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </div>
                      )}
                      </div>

                    <div className="p-4">
                      <div className="text-xs text-blue-600 mb-1">{product.brand}</div>
                      <Link
                        to={`/product/${product.id || index}`}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 block mb-2"
                      >
                        {product.title}
                      </Link>
                      
                      <div className="flex items-center mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                              className={`text-sm ${
                                i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                        <span className="text-sm text-gray-500 ml-2">
                          {product.rating.toFixed(1)} ({product.reviews})
                        </span>
                        </div>
                        
                      <div className="mb-4">
                            {product.oldPrice && (
                          <span className="text-sm text-gray-500 line-through mr-2">
                                {formatPrice(product.oldPrice)}
                              </span>
                            )}
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                          </div>
                          
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            В корзину
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FiShoppingBag className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">В данной категории пока нет товаров</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Мы работаем над наполнением каталога. Попробуйте другие категории или вернитесь позже.
                  </p>
                  <Link 
                    to="/" 
                    className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105 space-x-2"
                  >
                    <FiArrowLeft className="h-5 w-5" />
                    <span>На главную</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
      </div>
      </div>
    </div>
  )
}

export default CategoryPage