import React from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'

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

              {/* Simplified: image + optional link overlay */}
              {banner.targetUrl && (
                <Link to={banner.targetUrl} className="absolute inset-0" aria-label="banner-link" />
              )}
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







