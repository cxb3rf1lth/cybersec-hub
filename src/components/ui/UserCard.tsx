import { User } from '@/types/user';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { BadgeGrid } from '@/components/ui/SecurityBadge';
import { CertificationList } from '@/components/ui/CertificationBadge';
import { Users, Star, Target, Calendar, MapPin, Shield } from '@phosphor-icons/react';

interface UserCardProps {
  user: User
  variant?: 'compact' | 'detailed' | 'minimal'
  showBadges?: boolean
  showCertifications?: boolean
  showStatus?: boolean
  className?: string
  onClick?: () => void
}

export function UserCard({ 
  user, 
  variant = 'compact', 
  showBadges = true, 
  showCertifications = false,
  showStatus = true,
  className = '',
  onClick 
}: UserCardProps) {
  
  const getSecurityClearanceColor = (level: string) => {
    switch (level) {
      case 'confidential': return 'text-blue-400';
      case 'secret': return 'text-yellow-400';
      case 'top-secret': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (variant === 'minimal') {
    return (
      <div 
        className={`flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${className}`}
        onClick={onClick}
      >
        <div className="relative">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.displayName || user.username} />
            <AvatarFallback className="text-xs">
              {(user.displayName || user.username).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {showStatus && user.status && (
            <StatusIndicator 
              status={user.status} 
              size="sm" 
              className="absolute -bottom-0.5 -right-0.5" 
            />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">
              {user.displayName || user.username}
            </span>
            {user.badges && user.badges.length > 0 && showBadges && (
              <BadgeGrid badges={user.badges} maxDisplay={2} size="sm" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{user.reputation || 0} rep</span>
            {user.specializations.length > 0 && (
              <Badge variant="outline" className="text-xs py-0">
                {user.specializations[0]}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card 
        className={`p-4 hover:shadow-lg transition-all duration-300 cursor-pointer hover-border-flow glass-card ${className}`}
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} alt={user.displayName || user.username} />
              <AvatarFallback>
                {(user.displayName || user.username).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {showStatus && user.status && (
              <StatusIndicator 
                status={user.status} 
                size="md" 
                className="absolute -bottom-1 -right-1" 
              />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">
                {user.displayName || user.username}
              </h3>
              {user.securityClearance && user.securityClearance.level !== 'none' && (
                <Shield 
                  size={16} 
                  className={getSecurityClearanceColor(user.securityClearance.level)}
                  title={`${user.securityClearance.level.replace('-', ' ').toUpperCase()} Clearance`}
                />
              )}
            </div>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Star size={14} />
                <span>{user.reputation || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target size={14} />
                <span>{user.successfulFindings || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{user.followers?.length || 0}</span>
              </div>
            </div>

            {user.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {user.specializations.slice(0, 3).map((spec) => (
                  <Badge key={spec} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
                {user.specializations.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{user.specializations.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {user.badges && user.badges.length > 0 && showBadges && (
              <BadgeGrid badges={user.badges} maxDisplay={4} size="sm" />
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Detailed variant
  return (
    <Card 
      className={`p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover-border-flow glass-card ${className}`}
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.displayName || user.username} />
              <AvatarFallback className="text-lg">
                {(user.displayName || user.username).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {showStatus && user.status && (
              <StatusIndicator 
                status={user.status} 
                size="lg" 
                className="absolute -bottom-1 -right-1" 
              />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold">
                {user.displayName || user.username}
              </h3>
              {user.securityClearance && user.securityClearance.level !== 'none' && (
                <div className="flex items-center gap-1">
                  <Shield 
                    size={18} 
                    className={getSecurityClearanceColor(user.securityClearance.level)}
                  />
                  <span className={`text-xs font-medium ${getSecurityClearanceColor(user.securityClearance.level)}`}>
                    {user.securityClearance.level.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              @{user.username}
            </p>

            {showStatus && user.status && (
              <StatusIndicator status={user.status} showMessage />
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 py-3 border-t border-border">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-semibold">
              <Star size={16} className="text-yellow-400" />
              {user.reputation || 0}
            </div>
            <p className="text-xs text-muted-foreground">Reputation</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-semibold">
              <Target size={16} className="text-accent" />
              {user.successfulFindings || 0}
            </div>
            <p className="text-xs text-muted-foreground">Findings</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-semibold">
              <Users size={16} className="text-blue-400" />
              {user.followers?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
        </div>

        {/* Specializations */}
        {user.specializations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Specializations</h4>
            <div className="flex flex-wrap gap-1">
              {user.specializations.map((spec) => (
                <Badge key={spec} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {user.badges && user.badges.length > 0 && showBadges && (
          <div>
            <h4 className="text-sm font-medium mb-2">Achievements</h4>
            <BadgeGrid badges={user.badges} maxDisplay={8} size="md" />
          </div>
        )}

        {/* Certifications */}
        {user.certifications && user.certifications.length > 0 && showCertifications && (
          <div>
            <h4 className="text-sm font-medium mb-2">Certifications</h4>
            <CertificationList certifications={user.certifications} maxDisplay={3} size="sm" />
          </div>
        )}

        {/* Join date */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t border-border">
          <Calendar size={12} />
          <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
}