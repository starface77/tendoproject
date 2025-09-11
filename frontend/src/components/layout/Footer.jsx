
import { Link } from 'react-router-dom'
import {
  FiMail, FiMapPin, FiFacebook,
  FiInstagram, FiTwitter, FiYoutube
} from 'react-icons/fi'
import { HiOutlineShoppingBag } from 'react-icons/hi'
import { useLanguage } from '../../contexts/LanguageContext'
import LanguageSwitcher from '../ui/LanguageSwitcher'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { t } = useLanguage()

  const footerLinks = {
    company: [
      { name: 'О нас', href: '/about' },
      { name: 'Вакансии', href: '/catalog?filter=careers' },
      { name: 'Новости', href: '/catalog?filter=news' },
      { name: 'Инвесторы', href: '/catalog?filter=investors' },
    ],
    help: [
      { name: 'Помощь', href: '/faq' },
      { name: 'Доставка', href: '/catalog?filter=delivery' },
      { name: 'Возврат товара', href: '/catalog?filter=returns' },
      { name: 'Гарантия', href: '/catalog?filter=warranty' },
    ],
    sellers: [
      { name: 'Стать продавцом', href: '/become-seller' },
      { name: 'Услуги для бизнеса', href: '/catalog?filter=business' },
      { name: 'Реклама', href: '/catalog?filter=advertising' },
      { name: 'API для разработчиков', href: '/catalog?filter=api' },
    ],
    legal: [
      { name: 'Пользовательское соглашение', href: '/catalog?filter=terms' },
      { name: 'Политика конфиденциальности', href: '/catalog?filter=privacy' },
      { name: 'Правила продажи', href: '/catalog?filter=selling-rules' },
      { name: 'Защита покупателей', href: '/catalog?filter=buyer-protection' },
    ]
  }

  // упрощено, не используется

  return (
    <footer className="bg-white text-gray-700 border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" height="34" viewBox="0 0 34 34" width="34" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.8571 0.428467C16.8571 0.428467 27.2142 5.09513 29.8571 7.28561C32.5 9.47608 33.5714 14.5713 33.5714 17.1427C33.5714 19.7142 32.5 25.238 29.8571 27.4284C27.2142 29.6189 16.8571 33.857 16.8571 33.857C16.8571 33.857 6.49995 29.2856 3.85709 27.0951C1.21423 24.9046 0.428522 19.8094 0.428522 17.238C0.428522 14.6665 1.21423 9.14275 3.85709 6.95227C6.49995 4.7618 16.8571 0.428467 16.8571 0.428467Z" fill="url(#paint0_linear_101_2)"></path>
                <path d="M13.235 11.2352L16.8571 17.1428L20.4791 11.2352H13.235Z" fill="white"></path>
                <defs>
                  <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_101_2" x1="16.9999" x2="16.9999" y1="0.428467" y2="33.857">
                    <stop stopColor="#2563EB"></stop>
                    <stop offset="1" stopColor="#1D4ED8"></stop>
                  </linearGradient>
                </defs>
              </svg>  
              <div className="flex flex-col">
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">tendo</h2>
                <p className="text-gray-500 text-sm">{t('nav.support', 'Ваш надежный партнер')}</p>
              </div>
            </div>

            <p className="text-gray-500 mb-6 leading-relaxed text-sm">
              {t('homepage.trust_quality_desc', 'Мы гарантируем высокое качество товаров и отличное обслуживание для каждого клиента')}
            </p>

            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-2">
                <FiMail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-gray-600 text-sm">support@tendo.uz</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiMapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-gray-600 text-sm">Самарканд, Узбекистан</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors border border-gray-200">
                <FiFacebook className="h-4 w-4 text-gray-600" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors border border-gray-200">
                <FiInstagram className="h-4 w-4 text-gray-600" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors border border-gray-200">
                <FiTwitter className="h-4 w-4 text-gray-600" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors border border-gray-200">
                <FiYoutube className="h-4 w-4 text-gray-600" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">{t('footer.company', 'Компания')}</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">{t('footer.help', 'Помощь')}</h3>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sellers Links */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">{t('footer.for_sellers', 'Продавцам')}</h3>
            <ul className="space-y-2">
              {footerLinks.sellers.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup - Mobile optimized */}
    

        {/* Bottom Footer - Mobile optimized */}
        <div className="border-t border-gray-200 pt-6 sm:pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">

            {/* Copyright */}
            <div className="text-center lg:text-left">
              <div className="text-gray-500 text-xs sm:text-sm mb-2">
                © {currentYear} tendo. {t('all_rights_reserved', 'Все права защищены.')} 
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-3 sm:space-x-4 text-xs text-gray-400">
                <span>❤️ Сделано в Узбекистане</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">🚀 Разработано для вас</span>
              </div>
            </div>

            {/* Legal Links & Language */}
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6">
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {footerLinks.legal.slice(0, 2).map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-xs sm:text-sm hover:underline"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              <div className="border-l border-gray-200 pl-4 sm:pl-6 hidden sm:block">
                <LanguageSwitcher className="text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
