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
  ShoppingBag,
  Monitor,
  BookOpen,
  Music,
  Gamepad,
  Camera,
  Watch,
  Coffee,
  Dumbbell
} from 'lucide-react'

const CategoryCard = ({ category }) => {
  const { getLocalizedName } = useLanguage()

  // Маппинг иконок категорий на профессиональные SVG
  const getIconComponent = (iconName, categoryName) => {
    const name = (categoryName || '').toLowerCase()
    
    if (name.includes('электрон') || name.includes('electronics') || iconName === '📱') {
      return <Smartphone className="w-6 h-6 text-blue-600" />
    }
    if (name.includes('одежд') || name.includes('cloth') || iconName === '👕') {
      return <Shirt className="w-6 h-6 text-blue-600" />
    }
    if (name.includes('аксессуар') || name.includes('accessories') || iconName === '👜') {
      return <Briefcase className="w-6 h-6 text-blue-600" />
    }
    if (name.includes('дом') || name.includes('home') || iconName === '🏠') {
      return <Home className="w-6 h-6 text-blue-600" />
    }
    if (name.includes('спорт') || name.includes('sport') || iconName === '⚽') {
      return <Dumbbell className="w-6 h-6 text-blue-600" />
    }
    if (name.includes('красота') || name.includes('beauty') || iconName === '💄') {
      return <Palette className="w-6 h-6 text-blue-600" />
    }
    if (name.includes('авто') || name.includes('auto') || iconName === '🚗') {
      return <Car className="w-6 h-6 text-blue-600" />
    }
    if (name.includes('игрушк') || name.includes('toys') || iconName === '🧸') {
      return <Gift className="w-6 h-6 text-blue-600" />
    }
    if (name.includes('книг') || name.includes('book') || iconName === '📚') {
      return <BookOpen className="w-6 h-6 text-blue-600" />
    }
    if (name.includes('музык') || name.includes('music') || iconName === '🎵') {
      return <Music className="w-6 h-6 text-blue-600" />
    }
    if (name.includes('игр') || name.includes('game') || iconName === '🎮') {
      return <Gamepad className="w-6 h-6 text-blue-600" />
    }
    if (name.includes('фото') || name.includes('camera') || iconName === '📷') {
      return <Camera className="w-6 h-6 text-blue-600" />
    }
    if (name.includes('часы') || name.includes('watch') || iconName === '⌚') {
      return <Watch className="w-6 h-6 text-blue-600" />
    }
    if (name.includes('кофе') || name.includes('coffee') || name.includes('чай') || iconName === '☕') {
      return <Coffee className="w-6 h-6 text-blue-600" />
    }
    if (name.includes('компьютер') || name.includes('computer') || iconName === '💻') {
      return <Monitor className="w-6 h-6 text-blue-600" />
    }
    
    return <ShoppingBag className="w-6 h-6 text-blue-600" />
  }

  return (
    <Link
      to={`/category/${category.slug || category._id}`}
      className="group bg-white rounded-xl p-5 text-center border border-gray-200 hover:border-blue-300 transition-all duration-200 flex flex-col items-center shadow-sm hover:shadow-md"
    >
      <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
        {getIconComponent(category.icon, getLocalizedName(category.name))}
      </div>

      <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
        {getLocalizedName(category.name, 'Категория')}
      </h3>

      {category.productCount > 0 && (
        <span className="text-xs text-gray-500">
          {category.productCount} {category.productCount === 1 ? 'товар' : category.productCount < 5 ? 'товара' : 'товаров'}
        </span>
      )}
    </Link>
  )
}

export default CategoryCard