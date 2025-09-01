import { Shield, Home, Compass, User, Code, LogOut, ChatCircle, FolderOpen, Kanban, Users, CurrencyDollar, EnvelopeSimple, Storefront } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User as UserType, Conversation } from '@/types/user'
import { TeamInvitation } from '@/types/teams'

interface SidebarProps {
  currentUser: UserType
  activeTab: 'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace'
  onTabChange: (tab: 'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace') => void
  onLogout: () => void
}

export function Sidebar({ currentUser, activeTab, onTabChange, onLogout }: SidebarProps) {
  const [conversations] = useKV<Conversation[]>('conversations', [])
  const [teamInvitations] = useKV<TeamInvitation[]>('teamInvitations', [])
  
  // Calculate total unread messages
  const totalUnread = conversations.reduce((total, conv) => {
    if (conv.participants.includes(currentUser.id)) {
      return total + conv.unreadCount
    }
    return total
  }, 0)

  // Calculate pending team invitations
  const pendingInvitations = teamInvitations.filter(inv => 
    inv.targetUserId === currentUser.id && 
    inv.status === 'pending' && 
    new Date(inv.expiresAt) > new Date()
  ).length

  const navigationItems = [
    { id: 'feed' as const, label: 'Feed', icon: Home },
    { id: 'messages' as const, label: 'Messages', icon: ChatCircle, badge: totalUnread },
    { id: 'marketplace' as const, label: 'Marketplace', icon: Storefront },
    { id: 'invitations' as const, label: 'Invitations', icon: EnvelopeSimple, badge: pendingInvitations },
    { id: 'projects' as const, label: 'Projects', icon: Kanban },
    { id: 'teams' as const, label: 'Teams', icon: Users },
    { id: 'earnings' as const, label: 'Earnings', icon: CurrencyDollar },
    { id: 'code' as const, label: 'Code', icon: Code },
    { id: 'templates' as const, label: 'Templates', icon: FolderOpen },
    { id: 'explore' as const, label: 'Explore', icon: Compass },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ]

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-accent" />
          <h1 className="text-xl font-bold text-foreground">CyberConnect</h1>
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar>
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
                className="w-full justify-start relative"
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-auto text-xs min-w-[20px] h-5 flex items-center justify-center"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  )
}