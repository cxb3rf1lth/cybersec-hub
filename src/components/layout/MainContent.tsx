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
import { LiveAPIIntegration } from '@/components/bug-bounty/LiveAPIIntegration'
import { LiveVulnerabilityFeed } from '@/components/bug-bounty/LiveVulnerabilityFeed'
import { RealTimeBugBountyDashboard } from '@/components/bug-bounty/RealTimeBugBountyDashboard'
import { PartnerRequests } from '@/components/partner-requests/PartnerRequests'
import { RedTeamDashboard } from '@/components/red-team/RedTeamDashboard'
import { EnhancedVirtualLabView } from '@/components/virtual-lab/EnhancedVirtualLabView'
import { PlatformConnectionManager } from '@/components/integrations/PlatformConnectionManager'
import { IntegrationStatusDashboard } from '@/components/integrations/IntegrationStatusDashboard'
import { User } from '@/types/user'

interface MainContentProps {
  currentUser: User
  activeTab: 'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace' | 'bug-bounty' | 'team-hunts' | 'partner-requests' | 'virtual-lab' | 'red-team' | 'integrations' | 'api-status' | 'live-feed' | 'live-api'
  onUserUpdate: (user: User) => void
  onTabChange?: (tab: 'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace' | 'bug-bounty' | 'team-hunts' | 'partner-requests' | 'virtual-lab' | 'red-team' | 'integrations' | 'api-status' | 'live-feed' | 'live-api') => void
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
          <RealTimeBugBountyDashboard />
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
      {activeTab === 'integrations' && (
        <div className="p-6">
          <PlatformConnectionManager />
        </div>
      )}
      {activeTab === 'api-status' && (
        <div className="p-6">
          <IntegrationStatusDashboard />
        </div>
      )}
      {activeTab === 'live-api' && (
        <div className="p-6">
          <LiveAPIIntegration />
        </div>
      )}
      {activeTab === 'live-feed' && (
        <div className="p-6">
          <LiveVulnerabilityFeed />
        </div>
      )}
      {activeTab === 'profile' && (
        <ProfileView currentUser={currentUser} onUserUpdate={onUserUpdate} />
      )}
    </div>
  )
}