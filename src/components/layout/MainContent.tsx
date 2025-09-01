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
import { User } from '@/types/user'

interface MainContentProps {
  currentUser: User
  activeTab: 'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings'
  onUserUpdate: (user: User) => void
  onTabChange?: (tab: 'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings') => void
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
      {activeTab === 'explore' && (
        <ExploreView 
          currentUser={currentUser} 
          onNavigateToMessages={handleNavigateToMessages}
        />
      )}
      {activeTab === 'profile' && (
        <ProfileView currentUser={currentUser} onUserUpdate={onUserUpdate} />
      )}
    </div>
  )
}