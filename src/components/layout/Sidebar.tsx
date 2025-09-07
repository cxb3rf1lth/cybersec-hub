import { Shield, House, Compass, User, Code, SignOut, ChatCircle, FolderOpen, Kanban, Users, CurrencyDollar, EnvelopeSimple, Storefront, BugBeetle, Handshake, DesktopTower, CaretRight, Target, Terminal, Globe, Activity } from '@phosphor-icons/react'
import { useState } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { User as UserType, Conversation } from '@/types/user'
import { TeamInvitation } from '@/types/teams'

interface SidebarProps {
  currentUser: UserType
  activeTab: 'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace' | 'bug-bounty' | 'team-hunts' | 'partner-requests' | 'virtual-lab' | 'red-team' | 'integrations' | 'api-status' | 'live-feed' | 'live-api' | 'sync-status'
  onTabChange: (tab: 'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace' | 'bug-bounty' | 'team-hunts' | 'partner-requests' | 'virtual-lab' | 'red-team' | 'integrations' | 'api-status' | 'live-feed' | 'live-api' | 'sync-status') => void
  onLogout: () => void
}

export function Sidebar({ currentUser, activeTab, onTabChange, onLogout }: SidebarProps) {
  const [conversations] = useKVWithFallback<Conversation[]>('conversations', [])
  const [teamInvitations] = useKVWithFallback<TeamInvitation[]>('teamInvitations', [])
  const [expandedSections, setExpandedSections] = useState({
    operations: true,
    collaboration: false,
    development: false,
    integrations: false
  })
  
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

  const navigationSections = {
    main: [
      { id: 'feed' as const, label: 'Feed', icon: House },
      { id: 'explore' as const, label: 'Explore', icon: Compass },
      { id: 'profile' as const, label: 'Profile', icon: User },
    ],
    operations: [
      { id: 'red-team' as const, label: 'Red Team Ops', icon: Target },
      { id: 'bug-bounty' as const, label: 'Bug Bounty', icon: BugBeetle },
      { id: 'virtual-lab' as const, label: 'Virtual Lab', icon: DesktopTower },
    ],
    collaboration: [
      { id: 'messages' as const, label: 'Messages', icon: ChatCircle, badge: totalUnread },
      { id: 'teams' as const, label: 'Teams', icon: Users },
      { id: 'invitations' as const, label: 'Invitations', icon: EnvelopeSimple, badge: pendingInvitations },
      { id: 'partner-requests' as const, label: 'Partners', icon: Handshake },
      { id: 'marketplace' as const, label: 'Marketplace', icon: Storefront },
    ],
    development: [
      { id: 'code' as const, label: 'Code Editor', icon: Code },
      { id: 'templates' as const, label: 'Templates', icon: FolderOpen },
      { id: 'projects' as const, label: 'Projects', icon: Kanban },
      { id: 'earnings' as const, label: 'Earnings', icon: CurrencyDollar },
    ],
    integrations: [
      { id: 'live-api' as const, label: 'Live API Integration', icon: Globe },
      { id: 'live-feed' as const, label: 'Live Vulnerability Feed', icon: Activity },
      { id: 'sync-status' as const, label: 'Sync Status', icon: Shield },
      { id: 'integrations' as const, label: 'Platform Connections', icon: Terminal },
      { id: 'api-status' as const, label: 'Status Monitor', icon: Globe },
    ]
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="w-64 glass-card h-screen flex flex-col relative overflow-hidden border-r-2 border-border">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-accent" />
          <h1 className="text-xl font-bold text-foreground tracking-tight">CyberConnect</h1>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-border">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {currentUser.username[0].toUpperCase()}
            </AvatarFallback>
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

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {/* Main Section */}
        <div className="space-y-1 mb-4">
          {navigationSections.main.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'secondary' : 'ghost'}
                size="sm"
                className={`w-full justify-start glass-button hover-border-flow transition-all duration-200 ${
                  activeTab === item.id ? 'bg-secondary/20 border-l-2 border-accent' : 'hover:bg-secondary/10'
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="w-4 h-4 mr-3 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            )
          })}
        </div>

        {/* Red Team Operations */}
        <Collapsible open={expandedSections.operations} onOpenChange={() => toggleSection('operations')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between mb-2 text-muted-foreground hover:text-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Operations</span>
              <CaretRight className={`w-3 h-3 transition-transform ${expandedSections.operations ? 'rotate-90' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mb-4">
            {navigationSections.operations.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`w-full justify-start glass-button hover-border-flow transition-all duration-200 ${
                    activeTab === item.id ? 'bg-secondary/20 border-l-2 border-accent' : 'hover:bg-secondary/10'
                  }`}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className="w-4 h-4 mr-3 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Button>
              )
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Collaboration */}
        <Collapsible open={expandedSections.collaboration} onOpenChange={() => toggleSection('collaboration')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between mb-2 text-muted-foreground hover:text-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Collaboration</span>
              <CaretRight className={`w-3 h-3 transition-transform ${expandedSections.collaboration ? 'rotate-90' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mb-4">
            {navigationSections.collaboration.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`w-full justify-start glass-button hover-border-flow transition-all duration-200 relative ${
                    activeTab === item.id ? 'bg-secondary/20 border-l-2 border-accent' : 'hover:bg-secondary/10'
                  }`}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className="w-4 h-4 mr-3 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-auto text-xs min-w-[18px] h-4 text-[10px] bg-accent/80 text-accent-foreground"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Development */}
        <Collapsible open={expandedSections.development} onOpenChange={() => toggleSection('development')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between mb-2 text-muted-foreground hover:text-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Development</span>
              <CaretRight className={`w-3 h-3 transition-transform ${expandedSections.development ? 'rotate-90' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {navigationSections.development.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`w-full justify-start glass-button hover-border-flow transition-all duration-200 ${
                    activeTab === item.id ? 'bg-secondary/20 border-l-2 border-accent' : 'hover:bg-secondary/10'
                  }`}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className="w-4 h-4 mr-3 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Button>
              )
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Integrations */}
        <Collapsible open={expandedSections.integrations} onOpenChange={() => toggleSection('integrations')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between mb-2 text-muted-foreground hover:text-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Integrations</span>
              <CaretRight className={`w-3 h-3 transition-transform ${expandedSections.integrations ? 'rotate-90' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mb-4">
            {navigationSections.integrations.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`w-full justify-start glass-button hover-border-flow transition-all duration-200 ${
                    activeTab === item.id ? 'bg-secondary/20 border-l-2 border-accent' : 'hover:bg-secondary/10'
                  }`}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className="w-4 h-4 mr-3 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Button>
              )
            })}
          </CollapsibleContent>
        </Collapsible>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive glass-button transition-all duration-200"
          onClick={onLogout}
        >
          <SignOut className="w-4 h-4 mr-3" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  )
}