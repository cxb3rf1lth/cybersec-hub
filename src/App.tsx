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
import { useSampleStatusData } from '@/hooks/useSampleStatusData'
import { useTheme } from '@/hooks/useTheme'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { AuthModal } from '@/components/auth/AuthModal'
import { NeuralNetwork } from '@/components/ui/NeuralNetwork'
import { FloatingParticles } from '@/components/ui/FloatingParticles'
import { Toaster } from '@/components/ui/sonner'
import { User } from '@/types/user'

function App() {
  const [currentUser, setCurrentUser] = useKV<User | null>('currentUser', null as User | null)
  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace' | 'threats' | 'bug-bounty' | 'team-hunts' | 'partner-requests' | 'threat-map' | 'virtual-lab'>('feed')
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
  useSampleStatusData()
  useUserInvitations(currentUser ?? null)
  
  // Initialize theme system
  useTheme()

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
        <div className="hex-grid-overlay" aria-hidden="true">
          <div className="hex-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="hex-cell" />
            ))}
          </div>
        </div>
        <NeuralNetwork opacity={0.4} nodeCount={80} />
        <FloatingParticles density="medium" includeDataStreams={true} />
        <div className="text-center space-y-8 max-w-lg mx-auto p-8 relative z-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-foreground tracking-tight">CyberConnect</h1>
            <p className="text-xl text-muted-foreground font-medium">
              The professional network for cybersecurity experts
            </p>
            <p className="text-sm text-muted-foreground/80 max-w-md mx-auto">
              Connect with security professionals, collaborate on bug bounties, and advance your cybersecurity career.
            </p>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover-red-glow transition-all duration-300 transform hover:scale-105 text-lg"
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
      <div className="hex-grid-overlay" aria-hidden>
        <div className="hex-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="hex-cell" />
          ))}
        </div>
      </div>
      <NeuralNetwork opacity={0.2} nodeCount={60} />
      <FloatingParticles density="low" includeDataStreams={true} />
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