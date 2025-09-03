import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { useSampleData } from '@/hooks/useSampleData'
import { useSampleProjectData } from '@/hooks/useSampleProjectData'
import { useSampleTeamData } from '@/hooks/useSampleTeamData'
import { useSampleEarningsData } from '@/hooks/useSampleEarningsData'
import { useUserInvitations } from '@/hooks/useUserInvitations'
import { useSampleMarketplaceData } from '@/hooks/useSampleMarketplaceData'
import { useBugBountyPlatforms } from '@/hooks/useBugBountyPlatforms'
import { useBugBountyIntegration } from '@/hooks/useBugBountyIntegration'
import { useTeamHunts } from '@/hooks/useTeamHunts'
import { useSamplePartnerRequests } from '@/hooks/useSamplePartnerRequests'
import { useSampleStatusData } from '@/hooks/useSampleStatusData'
import { useTheme } from '@/hooks/useTheme'
import { useVirtualLab } from '@/hooks/useVirtualLab'
import { useRealMessaging } from '@/hooks/useRealMessaging'
import { useRealCodeCollaboration } from '@/hooks/useRealCodeCollaboration'
import { 
  webSocketService
} from '@/lib/production-services'
import { initializeProductionServices, useServiceStatus } from '@/lib/production-init'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { AuthModal } from '@/components/auth/AuthModal'
import { NeuralNetwork } from '@/components/ui/NeuralNetwork'
import { FloatingParticles } from '@/components/ui/FloatingParticles'
import { Toaster } from '@/components/ui/sonner'
import { User } from '@/types/user'
import ProductionErrorBoundary, { performanceMonitor, usePerformanceMonitor } from '@/lib/production-monitoring'

function App() {
  const [currentUser, setCurrentUser] = useKV<User | null>('currentUser', null as User | null)
  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace' | 'bug-bounty' | 'team-hunts' | 'partner-requests' | 'virtual-lab' | 'red-team' | 'integrations' | 'api-status'>('feed')
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Performance monitoring for the main App component
  usePerformanceMonitor('App')

  // Initialize production services with comprehensive error handling
  const { statuses: serviceStatuses, overallHealth } = useServiceStatus()

  // Initialize sample data
  useSampleData()
  useSampleProjectData()
  useSampleTeamData()
  useSampleEarningsData()
  useSampleMarketplaceData()
  useBugBountyPlatforms()
  useBugBountyIntegration()
  useTeamHunts()
  useSamplePartnerRequests()
  useSampleStatusData()
  useUserInvitations(currentUser ?? null)
  
  // Initialize theme system
  useTheme()

  // Initialize performance monitoring
  useEffect(() => {
    performanceMonitor.initialize()
    
    return () => {
      performanceMonitor.cleanup()
    }
  }, [])

  // Initialize production services
  useEffect(() => {
    setupProductionServices()
  }, [currentUser])

  const setupProductionServices = async () => {
    if (!currentUser) return

    try {
      // Use the production initialization system
      await initializeProductionServices(currentUser.id)
      
      console.log('Production services initialized successfully')
      console.log('Service statuses:', serviceStatuses)
      console.log('Overall health:', overallHealth)
    } catch (error) {
      console.error('Failed to initialize production services:', error)
      // Continue with fallback mode - the app should still work with local data
    }
  }

  // Cleanup production services on unmount
  useEffect(() => {
    return () => {
      webSocketService.disconnect()
    }
  }, [])

  // Initialize real production services
  const virtualLab = useVirtualLab(currentUser?.id || '')
  const messaging = useRealMessaging(currentUser?.id || '')
  const codeCollaboration = useRealCodeCollaboration(currentUser?.id || '')

  // Use the services to avoid unused variable warnings
  React.useEffect(() => {
    console.log('Production services initialized:', { virtualLab, messaging, codeCollaboration })
  }, [virtualLab, messaging, codeCollaboration])

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

// Wrap the main App component with production error boundary
function WrappedApp() {
  return (
    <ProductionErrorBoundary>
      <App />
    </ProductionErrorBoundary>
  )
}

export default WrappedApp