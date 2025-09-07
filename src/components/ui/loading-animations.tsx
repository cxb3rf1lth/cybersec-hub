import { cn } from '@/lib/utils';

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
  };

  return (
    <div className={cn('hex-spinner', sizeClasses[size], className)}>
      <div className="hex-inner">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="hex-side" />
        ))}
      </div>
    </div>
  );
}

// Matrix-style dots loading animation
export function MatrixDots({ className, size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3'
  };

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

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
  );
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
  );
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
  );
}

// Scanning line effect for data loading
export function ScanLine({ className }: { className?: string }) {
  return (
    <div className={cn('scan-line-container', className)}>
      <div className="scan-line" />
    </div>
  );
}

// Binary rain loading effect
export function BinaryRain({ 
  className, 
  columns = 10, 
  speed = 'normal',
  density = 'normal',
  variant = 'standard'
}: { 
  className?: string
  columns?: number
  speed?: 'slow' | 'normal' | 'fast'
  density?: 'sparse' | 'normal' | 'dense'
  variant?: 'standard' | 'matrix' | 'cyber' | 'minimal'
}) {
  const getChars = () => {
    switch (variant) {
      case 'matrix':
        return ['0', '1', '|', '/', '\\', '-', '_', '.', ':', ';', '▋', '▌', '▍', '▎'];
      case 'cyber':
        return ['▊', '▋', '▌', '▍', '▎', '│', '┃', '┊', '┆', '╱', '╲', '╳', '※', '◈'];
      case 'minimal':
        return ['0', '1', '•', '·', '‧'];
      default:
        return ['0', '1', '|', '/', '\\', '-', '_', '.', ':', ';'];
    }
  };

  const getAnimationDuration = () => {
    switch (speed) {
      case 'slow': return { column: '5s', char: '1.2s' };
      case 'fast': return { column: '2s', char: '0.6s' };
      default: return { column: '3.5s', char: '0.8s' };
    }
  };

  const getCharCount = () => {
    switch (density) {
      case 'sparse': return 8;
      case 'dense': return 20;
      default: return 15;
    }
  };

  const binaryChars = getChars();
  const { column: columnDuration, char: charDuration } = getAnimationDuration();
  const charCount = getCharCount();
  
  return (
    <div className={cn('binary-rain-container', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          className="binary-column"
          style={{ 
            animationDelay: `${i * 0.4}s`,
            animationDuration: columnDuration
          }}
        >
          {Array.from({ length: charCount }).map((_, j) => (
            <span
              key={j}
              className="binary-char"
              style={{ 
                animationDelay: `${j * 0.15}s`,
                animationDuration: `${parseFloat(charDuration) + Math.random() * 0.4}s`
              }}
            >
              {binaryChars[Math.floor(Math.random() * binaryChars.length)]}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

// Immersive binary rain showcase for special areas
export function ImmersiveBinaryRain({ 
  className,
  message = "Processing...",
  showMessage = true
}: { 
  className?: string
  message?: string
  showMessage?: boolean
}) {
  return (
    <div className={cn('relative w-full h-64 overflow-hidden', className)}>
      {/* Dense matrix rain background */}
      <div className="absolute inset-0">
        <div className="grid grid-cols-12 gap-1 h-full w-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`main-${i}`} className="relative h-full">
              <div className="binary-rain-container immersive h-full">
                <BinaryRain 
                  columns={1} 
                  speed={i % 2 === 0 ? 'normal' : 'fast'} 
                  density="dense" 
                  variant="matrix"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Cyber accent columns */}
      <div className="absolute inset-0 opacity-60">
        <div className="grid grid-cols-8 gap-2 h-full w-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`cyber-${i}`} className="relative h-full">
              <div className="binary-rain-container immersive h-full">
                <BinaryRain 
                  columns={1} 
                  speed="slow" 
                  density="normal" 
                  variant="cyber"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Edge glow streams */}
      <div className="absolute left-0 top-0 h-full w-16 opacity-80">
        <div className="binary-rain-container immersive h-full">
          <BinaryRain 
            columns={4} 
            speed="fast" 
            density="dense" 
            variant="cyber"
          />
        </div>
      </div>
      <div className="absolute right-0 top-0 h-full w-16 opacity-80">
        <div className="binary-rain-container immersive h-full">
          <BinaryRain 
            columns={4} 
            speed="fast" 
            density="dense" 
            variant="cyber"
          />
        </div>
      </div>
      
      {/* Message overlay */}
      {showMessage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background/80 backdrop-blur-sm border border-primary/20 rounded-lg px-6 py-4">
            <p className="text-primary font-mono font-medium terminal-cursor">
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Full screen cyberpunk loading overlay
export function CyberpunkLoader({ 
  isVisible = false,
  message = "Establishing secure connection..."
}: {
  isVisible?: boolean
  message?: string
}) {
  if (!isVisible) {return null;}

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="relative">
          <MatrixDots size="lg" />
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
  );
}