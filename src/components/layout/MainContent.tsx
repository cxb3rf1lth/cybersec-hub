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
import { ThreatIntelligenceFeed } from '@/components/feeds/ThreatIntelligenceFeed'
import { BugBountyDashboard } from '@/components/bug-bounty/BugBountyDashboard'
import { BugBountyPlatform } from '@/components/features/BugBountyPlatform'
import { PartnerRequests } from '@/components/partner-requests/PartnerRequests'
import { LiveThreatMap } from '@/components/threats/LiveThreatMap'
import { User } from '@/types/user'
import { VirtualLabView } from '@/components/views/VirtualLabView'

interface MainContentProps {
  currentUser: User
  activeTab: 'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace' | 'threats' | 'bug-bounty' | 'team-hunts' | 'partner-requests' | 'threat-map' | 'virtual-lab'
  onUserUpdate: (user: User) => void
  onTabChange?: (tab: 'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace' | 'threats' | 'bug-bounty' | 'team-hunts' | 'partner-requests' | 'threat-map' | 'virtual-lab') => void
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
      {activeTab === 'threats' && (
        <div className="p-6">
          <ThreatIntelligenceFeed />
        </div>
      )}
      {activeTab === 'threat-map' && (
        <div className="p-6">
          <LiveThreatMap />
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
        <VirtualLabView currentUser={currentUser} />
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