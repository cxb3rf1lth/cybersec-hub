import { useEffect, useState } from 'react'

interface CyberLoadingDotsProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CyberLoadingDots({ size = 'md', className = '' }: CyberLoadingDotsProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3)
    }, 400)

    return () => clearInterval(interval)
  }, [])

  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }

  const dotSize = sizeClasses[size]

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`
            ${dotSize} 
            rounded-full 
            transition-all 
            duration-300 
            matrix-pulse
            ${
              index === activeIndex 
                ? 'bg-primary scale-125 shadow-lg' 
                : 'bg-muted-foreground/50 scale-100'
            }
          `}
          style={{
            animationDelay: `${index * 0.1}s`,
            boxShadow: index === activeIndex 
              ? '0 0 10px oklch(0.55 0.18 15 / 0.7), 0 0 20px oklch(0.55 0.18 15 / 0.3)' 
              : 'none'
          }}
        />
      ))}
    </div>
  )
}