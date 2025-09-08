import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  Smartphone, 
  Shirt, 
  Briefcase, 
  Home, 
  Zap,
  Palette,
  Car,
  Gift,
  ShoppingBag
} from 'lucide-react'

const CategoryCard = ({ category }) => {
  const { getLocalizedName, t } = useLanguage()

  // Маппинг иконок категорий на профессиональные SVG
  const getIconComponent = (iconName, categoryName) => {
    const name = (categoryName || '').toLowerCase()
    
    if (name.includes('электрон') || name.includes('electronics') || iconName === '📱') {
      return <Smartphone className="w-6 h-6 text-blue-600" />
    }
    if (name.includes('одежд') || name.includes('cloth') || iconName === '👕') {
      return <Shirt className="w-6 h-6 text-purple-600" />
    }
    if (name.includes('аксессуар') || name.includes('accessories') || iconName === '👜') {
      return <Briefcase className="w-6 h-6 text-amber-600" />
    }
    if (name.includes('дом') || name.includes('home') || iconName === '🏠') {
      return <Home className="w-6 h-6 text-green-600" />
    }
    if (name.includes('спорт') || name.includes('sport') || iconName === '⚽') {
      return <Zap className="w-6 h-6 text-red-600" />
    }
    if (name.includes('красота') || name.includes('beauty') || iconName === '💄') {
      return <Palette className="w-6 h-6 text-pink-600" />
    }
    if (name.includes('авто') || name.includes('auto') || iconName === '🚗') {
      return <Car className="w-6 h-6 text-gray-600" />
    }
    if (name.includes('игрушк') || name.includes('toys') || iconName === '🧸') {
      return <Gift className="w-6 h-6 text-orange-600" />
    }
    
    return <ShoppingBag className="w-6 h-6 text-indigo-600" />
  }

  return (
    <Link
      to={`/category/${category.slug || category._id}`}
      className="group bg-white rounded-xl p-4 sm:p-6 text-center border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-300">
        {getIconComponent(category.icon, getLocalizedName(category.name))}
      </div>

      <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 group-hover:text-blue-600 transition-colors">
        {getLocalizedName(category.name, 'Категория')}
      </h3>

      {category.productCount > 0 && (
        <span className="text-xs sm:text-sm text-gray-500 group-hover:text-gray-600">
          {category.productCount} товаров
        </span>
      )}
    </Link>
  )
}

export default CategoryCard