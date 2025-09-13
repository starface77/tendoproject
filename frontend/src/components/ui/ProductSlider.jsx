import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Scrollbar, FreeMode } from 'swiper/modules'
import ProductCard from '../product/ProductCard'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/scrollbar'
import 'swiper/css/free-mode'

const ProductSlider = ({ products, title, seeAllUrl }) => {
  if (!products || products.length === 0) return null

  return (
    <div className="relative">
      {title && (
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
          {seeAllUrl && (
            <a href={seeAllUrl} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Смотреть все
            </a>
          )}
        </div>
      )}
      <Swiper
        modules={[Navigation, Scrollbar, FreeMode]}
        spaceBetween={16}
        slidesPerView={2.2}
        freeMode={true}
        navigation={{
          nextEl: '.product-slider-next',
          prevEl: '.product-slider-prev',
        }}
        scrollbar={{
          draggable: true,
          hide: false,
          el: '.product-slider-scrollbar'
        }}
        breakpoints={{
          // Mobile
          320: {
            spaceBetween: 8,
            slidesPerView: 2.1,
          },
          // Small Mobile
          480: {
            spaceBetween: 12,
            slidesPerView: 2.3,
          },
          // Tablet
          640: {
            spaceBetween: 16,
            slidesPerView: 3.2,
          },
          768: {
            spaceBetween: 16,
            slidesPerView: 3.5,
          },
          // Desktop
          1024: {
            spaceBetween: 20,
            slidesPerView: 4.2,
          },
          // Large Desktop  
          1280: {
            spaceBetween: 20,
            slidesPerView: 4.8,
          },
          1536: {
            spaceBetween: 24,
            slidesPerView: 5.5,
          }
        }}
        className="product-slider !pb-8"
      >
        {products.map((product) => (
          <SwiperSlide key={product._id || product.id} className="h-auto">
            <div className="w-full">
              <ProductCard product={product} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      {products.length > 4 && (
        <>
          <button className="product-slider-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white shadow-lg hover:shadow-xl text-gray-700 hover:text-blue-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-200">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="product-slider-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white shadow-lg hover:shadow-xl text-gray-700 hover:text-blue-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-200">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Custom Scrollbar */}
      <div className="product-slider-scrollbar mt-4 mx-auto max-w-xs"></div>
    </div>
  )
}

export default ProductSlider
