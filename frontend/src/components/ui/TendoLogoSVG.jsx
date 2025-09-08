import React from 'react'

const TendoLogoSVG = ({ size = 'default', className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  return (
    <svg 
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle with glow effect */}
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Main background square with rounded corners */}
      <rect 
        x="4" 
        y="4" 
        width="40" 
        height="40" 
        rx="8" 
        fill="#2563EB"
        className="drop-shadow-lg"
      />
      
      {/* Letter T in white */}
      <path 
        d="M16 16h16v4H20v12h-4V20H16V16z" 
        fill="white"
        className="drop-shadow-sm"
      />
      
      {/* Letter T in white */}
      <path 
        d="M16 16h16v4H20v12h-8V20H16V16z" 
        fill="white"
        className="drop-shadow-sm"
      />
      
      {/* Decorative accent dot */}
      <circle 
        cx="36" 
        cy="36" 
        r="3" 
        fill="#F2D024" 
        opacity="0.9"
      />
    </svg>
  )
}

export default TendoLogoSVG
