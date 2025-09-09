import React, { Suspense } from 'react'
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
import { BugBountyPlatform } from '@/components/features/BugBountyPlatform'
import { LiveAPIIntegration } from '@/components/bug-bounty/LiveAPIIntegration'
import { LiveVulnerabilityFeed } from '@/components/bug-bounty/LiveVulnerabilityFeed'
import { RealTimeBugBountyDashboard } from '@/components/bug-bounty/RealTimeBugBountyDashboard'
import { PartnerRequests } from '@/components/partner-requests/PartnerRequests'
import { PlatformConnectionManager } from '@/components/integrations/PlatformConnectionManager'
import { IntegrationStatusDashboard } from '@/components/integrations/IntegrationStatusDashboard'
import { LiveSyncStatus } from '@/components/features/LiveSyncStatus'
import { LazyComponents } from '@/lib/performance-optimization'
import { User } from '@/types/user'

// Loading component for lazy-loaded components
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-4 text-gray-600">Loading...</span>
    </div>
  )
}

interface MainContentProps {
  currentUser: User
  activeTab: 'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace' | 'bug-bounty' | 'team-hunts' | 'partner-requests' | 'virtual-lab' | 'red-team' | 'integrations' | 'api-status' | 'live-feed' | 'live-api' | 'sync-status' | 'tui'
  onUserUpdate: (user: User) => void
  onTabChange?: (tab: 'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace' | 'bug-bounty' | 'team-hunts' | 'partner-requests' | 'virtual-lab' | 'red-team' | 'integrations' | 'api-status' | 'live-feed' | 'live-api' | 'sync-status' | 'tui') => void
}

export function MainContent({ currentUser, activeTab, onUserUpdate, onTabChange }: MainContentProps) {
  const handleNavigateToMessages = (userId: string) => {
    if (onTabChange) {
      onTabChange('messages')
    }
  }

  return (
    <div className="flex-1 overflow-hidden">
      {activeTab === 'tui' && (
        <Suspense fallback={<LoadingSpinner />}>
          <LazyComponents.TUIInterface />
        </Suspense>
      )}
      {activeTab === 'feed' && (
        <FeedView currentUser={currentUser} />
      )}
      {activeTab === 'red-team' && (
        <div className="p-6">
          <Suspense fallback={<LoadingSpinner />}>
            <LazyComponents.RedTeamDashboard currentUser={currentUser} />
          </Suspense>
        </div>
      )}
      {(activeTab === 'bug-bounty' || activeTab === 'team-hunts') && (
        <div className="p-6">
          <Suspense fallback={<LoadingSpinner />}>
            <LazyComponents.BugBountyDashboard />
          </Suspense>
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
        <Suspense fallback={<LoadingSpinner />}>
          <LazyComponents.MarketplaceView 
            currentUser={currentUser} 
            onTabChange={(tab) => onTabChange && onTabChange(tab as any)}
          />
        </Suspense>
      )}
      {activeTab === 'virtual-lab' && (
        <div className="p-6">
          <Suspense fallback={<LoadingSpinner />}>
            <LazyComponents.VirtualLabView currentUser={currentUser} />
          </Suspense>
        </div>
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
      {activeTab === 'sync-status' && (
        <div className="p-6">
          <LiveSyncStatus />
        </div>
      )}
      {activeTab === 'profile' && (
        <ProfileView currentUser={currentUser} onUserUpdate={onUserUpdate} />
      )}
    </div>
  )
}