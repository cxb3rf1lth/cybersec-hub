import { useEffect, useState } from 'react';

interface EnhancedParticle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: 'primary' | 'accent' | 'blue'
  trail: boolean
}

interface ParticleFieldProps {
  width?: number
  height?: number
  particleCount?: number
  interactive?: boolean
  className?: string
}

export function ParticleField({ 
  width = 300, 
  height = 200, 
  particleCount = 15,
  interactive = false,
  className = ""
}: ParticleFieldProps) {
  const [particles, setParticles] = useState<EnhancedParticle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const initialParticles: EnhancedParticle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.4,
      color: ['primary', 'accent', 'blue'][Math.floor(Math.random() * 3)] as EnhancedParticle['color'],
      trail: Math.random() > 0.7
    }));

    setParticles(initialParticles);
  }, [particleCount, width, height]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(function animate() {
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          let newX = particle.x + particle.vx;
          let newY = particle.y + particle.vy;
          let newVx = particle.vx;
          let newVy = particle.vy;

          // Boundary bouncing
          if (newX <= 0 || newX >= width) {
            newVx = -newVx;
            newX = Math.max(0, Math.min(width, newX));
          }
          if (newY <= 0 || newY >= height) {
            newVy = -newVy;
            newY = Math.max(0, Math.min(height, newY));
          }

          // Mouse interaction
          if (interactive) {
            const dx = mousePos.x - newX;
            const dy = mousePos.y - newY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 50) {
              const force = (50 - distance) / 50;
              newVx += (dx / distance) * force * 0.1;
              newVy += (dy / distance) * force * 0.1;
            }
          }

          // Damping
          newVx *= 0.99;
          newVy *= 0.99;

          return {
            ...particle,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy
          };
        })
      );

      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [width, height, mousePos, interactive]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive) {return;}
    
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const getParticleColor = (color: EnhancedParticle['color']) => {
    switch (color) {
      case 'primary':
        return 'oklch(0.72 0.28 15)';
      case 'accent':
        return 'oklch(0.85 0.32 15)';
      case 'blue':
        return 'oklch(0.45 0.3 200)';
      default:
        return 'oklch(0.72 0.28 15)';
    }
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
    >
      <svg 
        width={width} 
        height={height} 
        className="absolute inset-0"
        style={{ pointerEvents: interactive ? 'auto' : 'none' }}
      >
        {/* Connection lines between nearby particles */}
        {particles.map((particle, i) => 
          particles.slice(i + 1).map((otherParticle, j) => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 80) {
              const opacity = (80 - distance) / 80 * 0.3;
              return (
                <line
                  key={`connection-${i}-${j}`}
                  x1={particle.x}
                  y1={particle.y}
                  x2={otherParticle.x}
                  y2={otherParticle.y}
                  stroke={getParticleColor(particle.color)}
                  strokeWidth="0.5"
                  opacity={opacity}
                  filter="url(#glow)"
                />
              );
            }
            return null;
          })
        )}

        {/* Particles */}
        {particles.map(particle => (
          <g key={particle.id}>
            {particle.trail && (
              <circle
                cx={particle.x - particle.vx * 10}
                cy={particle.y - particle.vy * 10}
                r={particle.size * 0.5}
                fill={getParticleColor(particle.color)}
                opacity={particle.opacity * 0.3}
                filter="url(#glow)"
              />
            )}
            <circle
              cx={particle.x}
              cy={particle.y}
              r={particle.size}
              fill={getParticleColor(particle.color)}
              opacity={particle.opacity}
              filter="url(#glow)"
            />
          </g>
        ))}

        {/* SVG Filters for glow effect */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}