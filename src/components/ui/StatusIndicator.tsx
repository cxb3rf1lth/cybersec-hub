import { UserStatus } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Circle, Target, Zap, Clock, Coffee, User } from '@phosphor-icons/react';

interface StatusIndicatorProps {
  status: UserStatus
  size?: 'sm' | 'md' | 'lg'
  showMessage?: boolean
  className?: string
}

export function StatusIndicator({ status, size = 'md', showMessage = false, className = '' }: StatusIndicatorProps) {
  const getStatusConfig = (type: UserStatus['type']) => {
    switch (type) {
      case 'available':
        return {
          color: 'bg-green-500',
          label: 'Available',
          icon: Circle,
          variant: 'success' as const
        };
      case 'busy':
        return {
          color: 'bg-red-500',
          label: 'Busy',
          icon: Circle,
          variant: 'destructive' as const
        };
      case 'away':
        return {
          color: 'bg-yellow-500',
          label: 'Away',
          icon: Clock,
          variant: 'warning' as const
        };
      case 'in-meeting':
        return {
          color: 'bg-purple-500',
          label: 'In Meeting',
          icon: User,
          variant: 'secondary' as const
        };
      case 'on-hunt':
        return {
          color: 'bg-accent',
          label: 'Bug Hunting',
          icon: Target,
          variant: 'default' as const
        };
      case 'analyzing':
        return {
          color: 'bg-blue-500',
          label: 'Analyzing',
          icon: Zap,
          variant: 'secondary' as const
        };
      case 'offline':
        return {
          color: 'bg-gray-500',
          label: 'Offline',
          icon: Circle,
          variant: 'outline' as const
        };
      default:
        return {
          color: 'bg-gray-500',
          label: 'Unknown',
          icon: Circle,
          variant: 'outline' as const
        };
    }
  };

  const config = getStatusConfig(status.type);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  if (showMessage) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative">
          <div className={`${sizeClasses[size]} rounded-full ${config.color} shadow-sm`}>
            <div className={`absolute inset-0 ${config.color} rounded-full animate-ping opacity-20`} />
          </div>
        </div>
        <div className="flex flex-col">
          <Badge variant={config.variant} className="text-xs w-fit">
            <Icon size={12} className="mr-1" />
            {config.label}
          </Badge>
          {status.customMessage && (
            <span className="text-xs text-muted-foreground mt-1">
              {status.customMessage}
            </span>
          )}
          {status.isActivelyHunting && (
            <span className="text-xs text-accent font-medium">
              🎯 Actively hunting
            </span>
          )}
          {status.currentProject && (
            <span className="text-xs text-muted-foreground">
              Working on: {status.currentProject}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} title={config.label}>
      <div className={`${sizeClasses[size]} rounded-full ${config.color} shadow-sm border border-background`}>
        {status.type === 'on-hunt' && (
          <div className={`absolute inset-0 ${config.color} rounded-full animate-ping opacity-30`} />
        )}
      </div>
    </div>
  );
}