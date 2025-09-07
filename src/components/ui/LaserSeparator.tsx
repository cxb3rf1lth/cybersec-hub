interface LaserSeparatorProps {
  className?: string
}

export function LaserSeparator({ className = '' }: LaserSeparatorProps) {
  return <div className={`laser-separator ${className}`} />;
}