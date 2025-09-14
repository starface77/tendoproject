import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import ProductCard from '../product/ProductCard'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'

const ProductSlider = ({ products, title, seeAllUrl }) => {
  // Always render the section header, even if there are no products
  return (
    <div className="relative py-2">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {seeAllUrl && (
            <a href={seeAllUrl} className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center">
              Смотреть все
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
      )}
      
      {(!products || products.length === 0) ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-gray-500">Нет товаров для отображения</p>
        </div>
      ) : (
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={2}
          navigation={{
            nextEl: '.product-slider-next',
            prevEl: '.product-slider-prev',
          }}
          breakpoints={{
            // Mobile
            320: {
              spaceBetween: 12,
              slidesPerView: 1.5,
            },
            // Small Mobile
            480: {
              spaceBetween: 14,
              slidesPerView: 2,
            },
            // Tablet
            640: {
              spaceBetween: 16,
              slidesPerView: 2.5,
            },
            768: {
              spaceBetween: 18,
              slidesPerView: 3,
            },
            // Desktop
            1024: {
              spaceBetween: 20,
              slidesPerView: 4,
            },
            // Large Desktop  
            1280: {
              spaceBetween: 22,
              slidesPerView: 4.5,
            },
            1536: {
              spaceBetween: 24,
              slidesPerView: 5,
            }
          }}
          className="product-slider pb-8"
        >
          {products.map((product) => (
            <SwiperSlide key={product._id || product.id} className="h-auto">
              <div className="w-full">
                <ProductCard product={product} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Custom Navigation Buttons */}
      {products && products.length > 3 && (
        <>
          <button className="product-slider-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 bg-white text-gray-600 hover:text-blue-600 rounded-full flex items-center justify-center transition-all duration-200 border border-gray-200 shadow-lg hover:shadow-xl">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="product-slider-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 bg-white text-gray-600 hover:text-blue-600 rounded-full flex items-center justify-center transition-all duration-200 border border-gray-200 shadow-lg hover:shadow-xl">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

export default ProductSlider