import { Shield, Home, Compass, User, Code, LogOut } from '@phosphor-icons/react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { User as UserType } from '@/types/user'

interface SidebarProps {
  currentUser: UserType
  activeTab: 'feed' | 'explore' | 'profile'
  onTabChange: (tab: 'feed' | 'explore' | 'profile') => void
  onLogout: () => void
}

export function Sidebar({ currentUser, activeTab, onTabChange, onLogout }: SidebarProps) {
  const navigationItems = [
    { id: 'feed' as const, label: 'Feed', icon: Home },
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
                className="w-full justify-start"
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
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