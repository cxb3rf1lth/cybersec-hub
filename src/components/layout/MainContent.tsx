import { FeedView } from '@/components/views/FeedView'
import { ExploreView } from '@/components/views/ExploreView'
import { ProfileView } from '@/components/views/ProfileView'
import { User } from '@/types/user'

interface MainContentProps {
  currentUser: User
  activeTab: 'feed' | 'explore' | 'profile'
  onUserUpdate: (user: User) => void
}

export function MainContent({ currentUser, activeTab, onUserUpdate }: MainContentProps) {
  return (
    <div className="flex-1 overflow-hidden">
      {activeTab === 'feed' && (
        <FeedView currentUser={currentUser} />
      )}
      {activeTab === 'explore' && (
        <ExploreView currentUser={currentUser} />
      )}
      {activeTab === 'profile' && (
        <ProfileView currentUser={currentUser} onUserUpdate={onUserUpdate} />
      )}
    </div>
  )
}