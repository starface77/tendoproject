import React from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import { FiArrowRight } from 'react-icons/fi'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

const BannerSlider = ({ banners }) => {
  if (!banners || banners.length === 0) return null

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          nextEl: '.banner-next',
          prevEl: '.banner-prev',
        }}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet !bg-white !opacity-60',
          bulletActiveClass: 'swiper-pagination-bullet-active !opacity-100'
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={banners.length > 1}
        className="banner-slider rounded-lg sm:rounded-2xl overflow-hidden"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner._id || index}>
            <div className="relative text-white min-h-[250px] sm:min-h-[300px] md:min-h-[400px] lg:min-h-[450px]">
              {/* Background Image */}
              {banner.imageUrl ? (
                <div className="absolute inset-0">
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.title || 'Banner'}
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('🖼️ Banner image loaded:', banner.imageUrl)}
                    onError={(e) => {
                      console.error('❌ Banner image error:', banner.imageUrl, e);
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700"></div>
              )}

              {/* Content */}
              <div className="relative px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 md:py-16 lg:py-20 h-full flex items-center">
                <div className="max-w-2xl">
                  {banner.title && (
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                      {banner.title}
                    </h1>
                  )}
                  {banner.description && (
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-xl opacity-90 leading-relaxed">
                      {banner.description}
                    </p>
                  )}
                  {banner.targetUrl && (
                    <Link
                      to={banner.targetUrl}
                      className="inline-flex items-center px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white text-gray-900 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <span>Смотреть товары</span>
                      <FiArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <button className="banner-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-110">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="banner-next absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-110">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

export default BannerSlider



