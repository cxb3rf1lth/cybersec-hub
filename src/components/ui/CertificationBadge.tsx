import { SecurityCertification } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Certificate, Link, Calendar, CheckCircle, WarningCircle } from '@/lib/phosphor-icons-wrapper';

interface CertificationBadgeProps {
  certification: SecurityCertification
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  className?: string
}

export function CertificationBadge({ 
  certification, 
  size = 'md', 
  showTooltip = true, 
  className = '' 
}: CertificationBadgeProps) {
  
  const getLevelConfig = (level: SecurityCertification['level']) => {
    switch (level) {
      case 'entry':
        return { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
      case 'intermediate':
        return { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
      case 'expert':
        return { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
      case 'master':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' };
    }
  };

  const getCategoryIcon = (category: SecurityCertification['category']) => {
    // For simplicity, using Certificate icon for all categories
    // Could be expanded with specific icons per category
    return Certificate;
  };

  const isExpired = certification.expiryDate && new Date(certification.expiryDate) < new Date();
  const isExpiringSoon = certification.expiryDate && 
    new Date(certification.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const config = getLevelConfig(certification.level);
  const Icon = getCategoryIcon(certification.category);

  const sizeClasses = {
    sm: { icon: 12, container: 'px-2 py-1 text-xs' },
    md: { icon: 14, container: 'px-3 py-1.5 text-sm' },
    lg: { icon: 16, container: 'px-4 py-2 text-base' }
  };

  const formatTooltipContent = () => {
    let content = `${certification.name}\n${certification.organization}\n\nEarned: ${new Date(certification.dateEarned).toLocaleDateString()}`;
    
    if (certification.expiryDate) {
      content += `\nExpires: ${new Date(certification.expiryDate).toLocaleDateString()}`;
      if (isExpired) {
        content += ' (EXPIRED)';
      } else if (isExpiringSoon) {
        content += ' (Expiring Soon)';
      }
    } else {
      content += '\nNo Expiration';
    }
    
    if (certification.credentialId) {
      content += `\nCredential ID: ${certification.credentialId}`;
    }
    
    content += `\nLevel: ${certification.level.charAt(0).toUpperCase() + certification.level.slice(1)}`;
    content += `\nCategory: ${certification.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
    
    return content;
  };

  const BadgeElement = (
    <div 
      className={`
        ${sizeClasses[size].container}
        ${config.bg} 
        ${config.border}
        border rounded-lg flex items-center gap-2
        transition-all duration-300 hover:scale-105 hover:brightness-110
        relative group cursor-pointer
        ${isExpired ? 'opacity-50 grayscale' : ''}
        ${className}
      `}
    >
      <Icon size={sizeClasses[size].icon} className={config.color} weight="duotone" />
      
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={`font-medium ${config.color}`}>
            {certification.name}
          </span>
          {certification.verificationUrl && (
            <Link size={10} className="text-muted-foreground hover:text-accent" />
          )}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{certification.organization}</span>
          {isExpired && (
            <WarningCircle size={10} className="text-red-400" />
          )}
          {isExpiringSoon && !isExpired && (
            <WarningCircle size={10} className="text-yellow-400" />
          )}
          {!isExpired && !isExpiringSoon && (
            <CheckCircle size={10} className="text-green-400" />
          )}
        </div>
      </div>

      {certification.level === 'master' && (
        <div className="absolute inset-0 rounded-lg">
          <div className="absolute inset-0 rounded-lg animate-pulse bg-gradient-to-r from-yellow-500/10 via-transparent to-yellow-500/10" />
        </div>
      )}
    </div>
  );

  if (!showTooltip) {
    return BadgeElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {BadgeElement}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs whitespace-pre-line text-xs">
          {formatTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface CertificationListProps {
  certifications: SecurityCertification[]
  maxDisplay?: number
  size?: 'sm' | 'md' | 'lg'
  layout?: 'grid' | 'list'
  className?: string
}

export function CertificationList({ 
  certifications, 
  maxDisplay, 
  size = 'md', 
  layout = 'list',
  className = '' 
}: CertificationListProps) {
  const displayCertifications = maxDisplay ? certifications.slice(0, maxDisplay) : certifications;
  const remainingCount = maxDisplay ? certifications.length - maxDisplay : 0;

  const containerClass = layout === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 gap-2' 
    : 'space-y-2';

  return (
    <div className={`${containerClass} ${className}`}>
      {displayCertifications.map((cert) => (
        <CertificationBadge key={cert.id} certification={cert} size={size} />
      ))}
      {remainingCount > 0 && (
        <div className="text-sm text-muted-foreground font-medium">
          +{remainingCount} more certifications
        </div>
      )}
    </div>
  );
}