import { cn } from '@/lib/utils'

interface LoadingProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

// Hexagonal spinner with cyberpunk red glow
export function HexSpinner({ className, size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  return (
    <div className={cn('hex-spinner', sizeClasses[size], className)}>
      <div className="hex-inner">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="hex-side" />
        ))}
      </div>
    </div>
  )
}

// Matrix-style dots loading animation
export function MatrixDots({ className, size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3'
  }

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  return (
    <div className={cn('flex items-center justify-center', sizeClasses[size], className)}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-primary rounded-full matrix-pulse',
            dotSizes[size]
          )}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  )
}

// Cyberpunk progress bar with hexagonal indicators
export function CyberProgress({ 
  progress = 0, 
  className,
  showPercentage = true 
}: { 
  progress?: number
  className?: string
  showPercentage?: boolean
}) {
  return (
    <div className={cn('cyber-progress-container', className)}>
      <div className="cyber-progress-track">
        <div 
          className="cyber-progress-fill"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
        <div className="cyber-progress-hexes">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'cyber-hex',
                progress > (i + 1) * 10 ? 'active' : ''
              )}
            />
          ))}
        </div>
      </div>
      {showPercentage && (
        <span className="text-xs text-muted-foreground font-mono ml-3">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  )
}

// Hexagonal grid loading overlay
export function HexGrid({ className }: { className?: string }) {
  return (
    <div className={cn('hex-grid-overlay', className)}>
      <div className="hex-grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="hex-cell"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  )
}

// Scanning line effect for data loading
export function ScanLine({ className }: { className?: string }) {
  return (
    <div className={cn('scan-line-container', className)}>
      <div className="scan-line" />
    </div>
  )
}

// Binary rain loading effect
export function BinaryRain({ className }: { className?: string }) {
  return (
    <div className={cn('binary-rain-container', className)}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="binary-column"
          style={{ animationDelay: `${i * 0.3}s` }}
        >
          {Array.from({ length: 10 }).map((_, j) => (
            <span
              key={j}
              className="binary-char"
              style={{ animationDelay: `${j * 0.1}s` }}
            >
              {Math.random() > 0.5 ? '1' : '0'}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

// Full screen cyberpunk loading overlay
export function CyberpunkLoader({ 
  isVisible = false,
  message = "Establishing secure connection..."
}: {
  isVisible?: boolean
  message?: string
}) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="relative">
          <HexSpinner size="lg" />
          <div className="absolute inset-0 animate-ping">
            <HexSpinner size="lg" className="opacity-20" />
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-foreground font-mono text-lg terminal-cursor">
            {message}
          </p>
          <CyberProgress progress={65} />
        </div>
        
        <ScanLine />
      </div>
    </div>
  )
}