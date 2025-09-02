import { FeedView } from '@/components/views/FeedView'
import { ExploreView } from '@/components/views/ExploreView'
import { ProfileView } from '@/components/views/ProfileView'
import { MessagesView } from '@/components/views/MessagesView'
import { CodeView } from '@/components/views/CodeView'
import { TemplatesView } from '@/components/views/TemplatesView'
import { ProjectsView } from '@/components/views/ProjectsView'
import { EarningsView } from '@/components/views/EarningsView'
import { TeamsView } from '@/components/teams/TeamsView'
import { TeamInvitationsView } from '@/components/teams/TeamInvitationsView'
import { MarketplaceView } from '@/components/marketplace/MarketplaceView'
import { BugBountyDashboard } from '@/components/bug-bounty/BugBountyDashboard'
import { BugBountyPlatform } from '@/components/features/BugBountyPlatform'
import { PartnerRequests } from '@/components/partner-requests/PartnerRequests'
import { RedTeamDashboard } from '@/components/red-team/RedTeamDashboard'
import { EnhancedVirtualLabView } from '@/components/virtual-lab/EnhancedVirtualLabView'
import { User } from '@/types/user'

interface MainContentProps {
  currentUser: User
  activeTab: 'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace' | 'bug-bounty' | 'team-hunts' | 'partner-requests' | 'virtual-lab' | 'red-team'
  onUserUpdate: (user: User) => void
  onTabChange?: (tab: 'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace' | 'bug-bounty' | 'team-hunts' | 'partner-requests' | 'virtual-lab' | 'red-team') => void
}

export function MainContent({ currentUser, activeTab, onUserUpdate, onTabChange }: MainContentProps) {
  const handleNavigateToMessages = (userId: string) => {
    if (onTabChange) {
      onTabChange('messages')
    }
  }

  return (
    <div className="flex-1 overflow-hidden">
      {activeTab === 'feed' && (
        <FeedView currentUser={currentUser} />
      )}
      {activeTab === 'red-team' && (
        <div className="p-6">
          <RedTeamDashboard currentUser={currentUser} />
        </div>
      )}
      {(activeTab === 'bug-bounty' || activeTab === 'team-hunts') && (
        <div className="p-6">
          <BugBountyPlatform currentUserId={currentUser.id} />
        </div>
      )}
      {activeTab === 'messages' && (
        <MessagesView currentUser={currentUser} />
      )}
      {activeTab === 'code' && (
        <CodeView currentUser={currentUser} />
      )}
      {activeTab === 'templates' && (
        <TemplatesView currentUser={currentUser} />
      )}
      {activeTab === 'projects' && (
        <ProjectsView currentUser={currentUser} />
      )}
      {activeTab === 'teams' && (
        <TeamsView currentUser={currentUser} />
      )}
      {activeTab === 'invitations' && (
        <TeamInvitationsView currentUser={currentUser} />
      )}
      {activeTab === 'earnings' && (
        <EarningsView currentUser={currentUser} />
      )}
      {activeTab === 'marketplace' && (
        <MarketplaceView 
          currentUser={currentUser} 
          onTabChange={(tab) => onTabChange && onTabChange(tab as any)}
        />
      )}
      {activeTab === 'virtual-lab' && (
        <EnhancedVirtualLabView currentUser={currentUser} />
      )}
      {activeTab === 'explore' && (
        <ExploreView 
          currentUser={currentUser} 
          onNavigateToMessages={handleNavigateToMessages}
        />
      )}
      {activeTab === 'partner-requests' && (
        <div className="p-6">
          <PartnerRequests currentUser={currentUser} />
        </div>
      )}
      {activeTab === 'profile' && (
        <ProfileView currentUser={currentUser} onUserUpdate={onUserUpdate} />
      )}
    </div>
  )
}