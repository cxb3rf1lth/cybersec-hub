import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { useSampleData } from '@/hooks/useSampleData'
import { useSampleProjectData } from '@/hooks/useSampleProjectData'
import { useSampleTeamData } from '@/hooks/useSampleTeamData'
import { useSampleEarningsData } from '@/hooks/useSampleEarningsData'
import { useUserInvitations } from '@/hooks/useUserInvitations'
import { useSampleMarketplaceData } from '@/hooks/useSampleMarketplaceData'
import { useSampleThreatSources } from '@/hooks/useSampleThreatSources'
import { useBugBountyPlatforms } from '@/hooks/useBugBountyPlatforms'
import { useBugBountyIntegration } from '@/hooks/useBugBountyIntegration'
import { useTeamHunts } from '@/hooks/useTeamHunts'
import { useSamplePartnerRequests } from '@/hooks/useSamplePartnerRequests'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { AuthModal } from '@/components/auth/AuthModal'
import { NeuralNetwork } from '@/components/ui/NeuralNetwork'
import { Toaster } from '@/components/ui/sonner'
import { User } from '@/types/user'

function App() {
  const [currentUser, setCurrentUser] = useKV<User | null>('currentUser', null)
  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace' | 'animations' | 'threats' | 'bug-bounty' | 'team-hunts' | 'partner-requests' | 'threat-map'>('feed')
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Initialize sample data
  useSampleData()
  useSampleProjectData()
  useSampleTeamData()
  useSampleEarningsData()
  useSampleMarketplaceData()
  useSampleThreatSources()
  useBugBountyPlatforms()
  useBugBountyIntegration()
  useTeamHunts()
  useSamplePartnerRequests()
  useUserInvitations(currentUser)

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    setShowAuthModal(false)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setActiveTab('feed')
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background network-pattern flex items-center justify-center relative overflow-hidden">
        <NeuralNetwork opacity={0.4} nodeCount={80} />
        <div className="text-center space-y-6 max-w-md mx-auto p-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground terminal-cursor glitch-effect">CyberConnect</h1>
            <p className="text-muted-foreground">
              The professional network for cybersecurity experts
            </p>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover-red-glow transition-all duration-300 transform hover:scale-105"
          >
            Join the Community
          </button>
        </div>
        
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onLogin={handleLogin}
          />
        )}
        <Toaster />
      </div>
    )
  }

  return (
  <div className="min-h-screen bg-background network-pattern relative overflow-hidden">
      <NeuralNetwork opacity={0.2} nodeCount={60} />
      <div className="flex relative z-10">
        <Sidebar
          currentUser={currentUser}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />
        <MainContent
          currentUser={currentUser}
          activeTab={activeTab}
          onUserUpdate={setCurrentUser}
          onTabChange={setActiveTab}
        />
      </div>
      <Toaster />
    </div>
  )
}

export default App