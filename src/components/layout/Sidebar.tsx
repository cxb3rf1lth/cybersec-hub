import { Shield, House, Compass, User, Code, SignOut, ChatCircle, FolderOpen, Kanban, Users, CurrencyDollar, EnvelopeSimple, Storefront, CircleNotch, Eye, Target, BugBeetle, Handshake, Globe, DesktopTower } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User as UserType, Conversation } from '@/types/user'
import { TeamInvitation } from '@/types/teams'

interface SidebarProps {
  currentUser: UserType
  activeTab: 'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace' | 'animations' | 'threats' | 'bug-bounty' | 'team-hunts' | 'partner-requests' | 'threat-map' | 'virtual-lab'
  onTabChange: (tab: 'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace' | 'animations' | 'threats' | 'bug-bounty' | 'team-hunts' | 'partner-requests' | 'threat-map' | 'virtual-lab') => void
  onLogout: () => void
}

export function Sidebar({ currentUser, activeTab, onTabChange, onLogout }: SidebarProps) {
  const [conversations] = useKV<Conversation[]>('conversations', [])
  const [teamInvitations] = useKV<TeamInvitation[]>('teamInvitations', [])
  
  // Calculate total unread messages
  const totalUnread = (conversations ?? []).reduce((total, conv) => {
    if (conv.participants.includes(currentUser.id)) {
      return total + conv.unreadCount
    }
    return total
  }, 0)

  // Calculate pending team invitations
  const pendingInvitations = (teamInvitations ?? []).filter(inv => 
    inv.targetUserId === currentUser.id && 
    inv.status === 'pending' && 
    new Date(inv.expiresAt) > new Date()
  ).length

  const navigationItems = [
  { id: 'feed' as const, label: 'Feed', icon: House },
    { id: 'threats' as const, label: 'Threat Intel', icon: Eye },
    { id: 'threat-map' as const, label: 'Threat Map', icon: Globe },
  { id: 'virtual-lab' as const, label: 'Virtual Lab', icon: DesktopTower },
    { id: 'bug-bounty' as const, label: 'Bug Bounty', icon: BugBeetle },
    { id: 'partner-requests' as const, label: 'Partners', icon: Handshake },
    { id: 'messages' as const, label: 'Messages', icon: ChatCircle, badge: totalUnread },
    { id: 'marketplace' as const, label: 'Marketplace', icon: Storefront },
    { id: 'invitations' as const, label: 'Invitations', icon: EnvelopeSimple, badge: pendingInvitations },
    { id: 'projects' as const, label: 'Projects', icon: Kanban },
    { id: 'teams' as const, label: 'Teams', icon: Users },
    { id: 'earnings' as const, label: 'Earnings', icon: CurrencyDollar },
    { id: 'code' as const, label: 'Code', icon: Code },
    { id: 'templates' as const, label: 'Templates', icon: FolderOpen },
  { id: 'animations' as const, label: 'Animations', icon: CircleNotch },
    { id: 'explore' as const, label: 'Explore', icon: Compass },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ]

  return (
    <div className="w-64 glass-panel h-screen flex flex-col relative overflow-hidden">
      <div className="p-4 border-b border-border electric-border">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-accent hover-red-glow glitch-effect" />
          <h1 className="text-xl font-bold text-foreground terminal-cursor">CyberConnect</h1>
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="electric-glow">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {currentUser.username}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {currentUser.specializations[0] || 'Security Professional'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'secondary' : 'ghost'}
                className={`w-full justify-start relative glass-button hover-red-glow transition-all duration-300 ${
                  activeTab === item.id ? 'border-l-2 border-accent bg-accent/10' : ''
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-auto text-xs min-w-[20px] h-5 flex items-center justify-center glass-card"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-border electric-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive glass-button hover-red-glow transition-all duration-300"
          onClick={onLogout}
        >
          <SignOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  )
}