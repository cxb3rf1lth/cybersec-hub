import { useEffect, useRef } from 'react';

interface BinaryRainProps {
  className?: string
  immersive?: boolean
  speed?: number
  density?: number
}

export function BinaryRain({ 
  className = '', 
  immersive = false, 
  speed = 1,
  density = 0.8 
}: BinaryRainProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {return;}

    const columns = Math.floor(container.offsetWidth / 12); // 12px per column
    const rows = Math.floor(container.offsetHeight / 16); // 16px per row

    // Clear existing content
    container.innerHTML = '';

    // Create columns
    for (let i = 0; i < columns; i++) {
      const column = document.createElement('div');
      column.className = 'binary-column';
      column.style.cssText = `
        position: absolute;
        left: ${i * 12}px;
        top: 0;
        width: 12px;
        height: 100%;
        display: flex;
        flex-direction: column;
        animation: binary-fall ${4 + Math.random() * 2}s linear infinite;
        animation-delay: ${Math.random() * 2}s;
      `;

      // Generate binary characters for this column
      const charCount = rows + 10; // Extra chars for smooth animation
      for (let j = 0; j < charCount; j++) {
        const char = document.createElement('span');
        const isOne = Math.random() > 0.5;
        char.textContent = isOne ? '1' : '0';
        char.className = 'binary-char';
        
        // Add special effects for certain characters
        if (immersive && Math.random() < 0.1) {
          char.classList.add('binary-highlight');
        }
        
        char.style.cssText = `
          font-family: 'Fira Code', monospace;
          font-size: ${immersive ? '12px' : '11px'};
          color: ${immersive && Math.random() < 0.15 ? 
            'oklch(0.85 0.28 15)' : 
            'oklch(0.55 0.18 15 / 0.8)'};
          line-height: 1.1;
          animation: binary-fade ${1 + Math.random() * 0.5}s ease-in-out infinite;
          animation-delay: ${Math.random() * 1}s;
          text-shadow: ${immersive && Math.random() < 0.2 ? 
            '0 0 8px oklch(0.65 0.22 15 / 0.7)' : 
            '0 0 5px oklch(0.55 0.18 15 / 0.4)'};
          font-weight: ${immersive ? '600' : '500'};
        `;

        column.appendChild(char);
      }

      container.appendChild(column);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      .binary-column {
        animation-duration: ${4 / speed}s !important;
      }
      
      @keyframes binary-fall {
        0% { transform: translateY(-120%); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(120%); opacity: 0; }
      }
      
      @keyframes binary-fade {
        0%, 100% { 
          opacity: ${density * 0.4}; 
          color: oklch(0.45 0.15 15 / ${density * 0.6}); 
        }
        50% { 
          opacity: ${density}; 
          color: oklch(0.65 0.22 15 / ${density * 0.9}); 
        }
      }
      
      .binary-highlight {
        color: oklch(0.95 0.3 15) !important;
        text-shadow: 
          0 0 5px oklch(0.85 0.28 15),
          0 0 10px oklch(0.75 0.25 15 / 0.8),
          0 0 15px oklch(0.65 0.22 15 / 0.4) !important;
        animation: binary-glow 0.6s ease-in-out infinite !important;
      }
      
      @keyframes binary-glow {
        0%, 100% { 
          opacity: 0.8; 
          transform: scale(1);
        }
        50% { 
          opacity: 1; 
          transform: scale(1.1);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [immersive, speed, density]);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
    />
  );
}