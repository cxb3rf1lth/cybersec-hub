import { SecurityBadge as SecurityBadgeType } from '@/types/user'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Trophy, 
  Target, 
  Shield, 
  Lightning, 
  Crown, 
  Star, 
  Users, 
  Book, 
  Megaphone,
  Code,
  Microphone,
  Certificate,
  HandsClapping,
  Zap,
  FileText,
  ShareNetwork,
  Medal
} from '@phosphor-icons/react'

interface SecurityBadgeProps {
  badge: SecurityBadgeType
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  className?: string
}

export function SecurityBadge({ badge, size = 'md', showTooltip = true, className = '' }: SecurityBadgeProps) {
  const getBadgeConfig = (type: SecurityBadgeType['type']) => {
    switch (type) {
      case 'first-blood':
        return { icon: Target, color: 'text-red-400', bg: 'bg-red-500/10' }
      case 'hall-of-fame':
        return { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10' }
      case 'bug-hunter':
        return { icon: Target, color: 'text-green-400', bg: 'bg-green-500/10' }
      case 'critical-finder':
        return { icon: Lightning, color: 'text-orange-400', bg: 'bg-orange-500/10' }
      case 'bounty-master':
        return { icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10' }
      case 'researcher':
        return { icon: Book, color: 'text-blue-400', bg: 'bg-blue-500/10' }
      case 'collaborator':
        return { icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
      case 'mentor':
        return { icon: HandsClapping, color: 'text-indigo-400', bg: 'bg-indigo-500/10' }
      case 'community-leader':
        return { icon: Megaphone, color: 'text-pink-400', bg: 'bg-pink-500/10' }
      case 'cve-publisher':
        return { icon: Shield, color: 'text-violet-400', bg: 'bg-violet-500/10' }
      case 'zero-day':
        return { icon: Zap, color: 'text-red-400', bg: 'bg-red-500/10' }
      case 'methodology-master':
        return { icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
      case 'tool-creator':
        return { icon: Code, color: 'text-blue-400', bg: 'bg-blue-500/10' }
      case 'conference-speaker':
        return { icon: Microphone, color: 'text-purple-400', bg: 'bg-purple-500/10' }
      case 'certified-expert':
        return { icon: Certificate, color: 'text-yellow-400', bg: 'bg-yellow-500/10' }
      case 'team-player':
        return { icon: Users, color: 'text-green-400', bg: 'bg-green-500/10' }
      case 'rapid-responder':
        return { icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10' }
      case 'documentation-pro':
        return { icon: FileText, color: 'text-slate-400', bg: 'bg-slate-500/10' }
      case 'knowledge-sharer':
        return { icon: ShareNetwork, color: 'text-teal-400', bg: 'bg-teal-500/10' }
      case 'platform-champion':
        return { icon: Medal, color: 'text-amber-400', bg: 'bg-amber-500/10' }
      default:
        return { icon: Star, color: 'text-gray-400', bg: 'bg-gray-500/10' }
    }
  }

  const getRarityConfig = (rarity: SecurityBadgeType['rarity']) => {
    switch (rarity) {
      case 'common':
        return { border: 'border-gray-500/30', glow: '' }
      case 'uncommon':
        return { border: 'border-green-500/40', glow: 'shadow-green-500/20' }
      case 'rare':
        return { border: 'border-blue-500/50', glow: 'shadow-blue-500/30' }
      case 'epic':
        return { border: 'border-purple-500/60', glow: 'shadow-purple-500/40' }
      case 'legendary':
        return { border: 'border-yellow-500/70', glow: 'shadow-yellow-500/50 shadow-lg' }
      default:
        return { border: 'border-gray-500/30', glow: '' }
    }
  }

  const config = getBadgeConfig(badge.type)
  const rarityConfig = getRarityConfig(badge.rarity)
  const Icon = config.icon

  const sizeClasses = {
    sm: { icon: 12, container: 'w-6 h-6 text-xs' },
    md: { icon: 16, container: 'w-8 h-8 text-sm' },
    lg: { icon: 20, container: 'w-10 h-10 text-base' }
  }

  const formatTooltipContent = () => {
    let content = `${badge.name}\n${badge.description}\n\nEarned: ${new Date(badge.earnedAt).toLocaleDateString()}\nRarity: ${badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}`
    
    if (badge.metadata) {
      const { platform, amount, severity, cveId, bountyValue, targetCompany } = badge.metadata
      if (platform) content += `\nPlatform: ${platform}`
      if (amount) content += `\nFindings: ${amount}`
      if (severity) content += `\nSeverity: ${severity.toUpperCase()}`
      if (cveId) content += `\nCVE: ${cveId}`
      if (bountyValue) content += `\nBounty: $${bountyValue.toLocaleString()}`
      if (targetCompany) content += `\nTarget: ${targetCompany}`
    }
    
    return content
  }

  const BadgeElement = (
    <div 
      className={`
        ${sizeClasses[size].container} 
        ${config.bg} 
        ${config.color} 
        ${rarityConfig.border} 
        ${rarityConfig.glow}
        border rounded-lg flex items-center justify-center 
        transition-all duration-300 hover:scale-110 hover:brightness-125
        relative group cursor-pointer
        ${className}
      `}
    >
      <Icon size={sizeClasses[size].icon} weight="duotone" />
      
      {badge.rarity === 'legendary' && (
        <div className="absolute inset-0 rounded-lg">
          <div className="absolute inset-0 rounded-lg animate-pulse bg-gradient-to-r from-yellow-500/20 via-transparent to-yellow-500/20" />
        </div>
      )}
      
      {badge.rarity === 'epic' && (
        <div className="absolute inset-0 rounded-lg">
          <div className="absolute inset-0 rounded-lg animate-pulse bg-gradient-to-r from-purple-500/15 via-transparent to-purple-500/15" />
        </div>
      )}
    </div>
  )

  if (!showTooltip) {
    return BadgeElement
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
  )
}

interface BadgeGridProps {
  badges: SecurityBadgeType[]
  maxDisplay?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function BadgeGrid({ badges, maxDisplay = 6, size = 'md', className = '' }: BadgeGridProps) {
  const displayBadges = badges.slice(0, maxDisplay)
  const remainingCount = badges.length - maxDisplay

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayBadges.map((badge) => (
        <SecurityBadge key={badge.id} badge={badge} size={size} />
      ))}
      {remainingCount > 0 && (
        <div 
          className={`
            ${size === 'sm' ? 'w-6 h-6 text-xs' : size === 'md' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base'}
            bg-muted border border-border rounded-lg flex items-center justify-center
            text-muted-foreground font-medium cursor-pointer
            hover:bg-muted/80 transition-colors
          `}
          title={`+${remainingCount} more badges`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}