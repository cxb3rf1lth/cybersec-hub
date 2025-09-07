import { useEffect, useState } from 'react';

interface Particle {
  id: number
  type: 'small' | 'medium' | 'large' | 'accent'
  x: number
  delay: number
  special?: 'pulse'
}

interface DataStream {
  id: number
  type: 'vertical' | 'horizontal'
  position: number
  delay: number
}

interface FloatingParticlesProps {
  density?: 'low' | 'medium' | 'high'
  includeDataStreams?: boolean
}

export function FloatingParticles({ 
  density = 'medium', 
  includeDataStreams = true 
}: FloatingParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dataStreams, setDataStreams] = useState<DataStream[]>([]);

  useEffect(() => {
    const densityConfig = {
      low: { particles: 8, dataStreams: 2 },
      medium: { particles: 12, dataStreams: 3 },
      high: { particles: 18, dataStreams: 4 }
    };

    const config = densityConfig[density];

    // Generate floating particles
    const newParticles: Particle[] = Array.from({ length: config.particles }, (_, i) => {
      const types: Particle['type'][] = ['small', 'small', 'medium', 'large', 'accent'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      return {
        id: i,
        type,
        x: Math.random() * 100,
        delay: Math.random() * 15,
        special: Math.random() > 0.7 ? 'pulse' : undefined
      };
    });

    setParticles(newParticles);

    // Generate data streams if enabled
    if (includeDataStreams) {
      const newDataStreams: DataStream[] = Array.from({ length: config.dataStreams }, (_, i) => ({
        id: i,
        type: Math.random() > 0.6 ? 'horizontal' : 'vertical',
        position: Math.random() * 100,
        delay: Math.random() * 10
      }));

      setDataStreams(newDataStreams);
    }
  }, [density, includeDataStreams]);

  return (
    <div className="floating-particles">
      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={`particle-${particle.id}`}
          className={`particle ${particle.type} ${particle.special || ''}`}
          style={{
            left: `${particle.x}%`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}

      {/* Data stream particles */}
      {includeDataStreams && dataStreams.map((stream) => (
        <div
          key={`stream-${stream.id}`}
          className={`data-stream-particle ${stream.type === 'horizontal' ? 'horizontal' : ''}`}
          style={{
            [stream.type === 'horizontal' ? 'top' : 'left']: `${stream.position}%`,
            animationDelay: `${stream.delay}s`
          }}
        />
      ))}
    </div>
  );
}