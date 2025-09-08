import React from 'react'

const Logo = ({ size = 'default', showText = true, className = '', variant = 'default' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  const textSizes = {
    small: 'text-lg',
    default: 'text-2xl',
    large: 'text-3xl',
    xl: 'text-4xl'
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Real Logo from Images */}
      <img 
        src="/images/logogo.jpg" 
        alt="Marketplace Logo" 
        className={`${sizeClasses[size]} object-cover rounded-2xl shadow-lg`}
        onError={(e) => {
          // Fallback to erasedlogo.png if logogo.jpg fails
          e.target.src = '/images/erasedlogo.png'
        }}
      />
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold ${variant === 'white' ? 'text-white' : 'text-blue-600'} ${size === 'small' ? 'text-lg' : size === 'default' ? 'text-2xl' : size === 'large' ? 'text-3xl' : 'text-4xl'}`}>
            Your Market
          </h1>
          <p className={`${variant === 'white' ? 'text-gray-300' : 'text-gray-500'} ${size === 'small' ? 'text-xs' : size === 'default' ? 'text-xs' : size === 'large' ? 'text-sm' : 'text-base'} -mt-1`}>
            Лучший маркетплейс Узбекистана
          </p>
        </div>
      )}
    </div>
  )
}

export default Logo
