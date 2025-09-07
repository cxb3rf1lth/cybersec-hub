import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
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
import { useAutoSync } from '@/hooks/useAutoSync'
import { 
  webSocketService
} from '@/lib/production-services'
import { initializeProductionServices, useServiceStatus } from '@/lib/production-init'
import { stabilityChecker, useStabilityMonitor } from '@/lib/stability-checker';
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { AuthModal } from '@/components/auth/AuthModal'
import { ApiKeyManager } from '@/components/ui/ApiKeyManager'
import { NeuralNetwork } from '@/components/ui/NeuralNetwork'
import { FloatingParticles } from '@/components/ui/FloatingParticles'
import { Toaster } from '@/components/ui/sonner'
import { User } from '@/types/user'
import ProductionErrorBoundary, { performanceMonitor, usePerformanceMonitor } from '@/lib/production-monitoring'

function App() {
  // Enable stability monitoring for the main App component
  // useStabilityMonitor('App') // Disabled temporarily
  
  const [currentUser, setCurrentUser] = useKVWithFallback<User | null>('currentUser', null as User | null)
  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'profile' | 'messages' | 'code' | 'templates' | 'projects' | 'teams' | 'invitations' | 'earnings' | 'marketplace' | 'bug-bounty' | 'team-hunts' | 'partner-requests' | 'virtual-lab' | 'red-team' | 'integrations' | 'api-status' | 'live-feed' | 'live-api' | 'sync-status'>('feed')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showApiKeyManager, setShowApiKeyManager] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [servicesInitialized, setServicesInitialized] = useState(false)

  // Performance monitoring for the main App component
  usePerformanceMonitor('App')

  // Initialize production services with comprehensive error handling
  const { statuses: serviceStatuses, overallHealth } = useServiceStatus()

  // Initialize automatic synchronization
  const autoSyncHook = useAutoSync()

  // Memoize sample data initialization to prevent unnecessary re-runs
  const sampleDataInitialized = useMemo(() => {
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
    return true
  }, [])

  // Initialize user-dependent hooks with proper dependency management
  const userInvitations = useUserInvitations(currentUser ?? null)
  
  // Initialize theme system
  useTheme()

  // Initialize performance monitoring - wrapped in useCallback to prevent recreation
  const initializeMonitoring = useCallback(() => {
    performanceMonitor.initialize()
    // stabilityChecker.startMonitoring() // Disabled temporarily
    
    return () => {
      performanceMonitor.cleanup()
      // stabilityChecker.stopMonitoring() // Disabled temporarily
    }
  }, [])

  useEffect(() => {
    const cleanup = initializeMonitoring()
    return cleanup
  }, [initializeMonitoring])

  // Initialize production services with proper cleanup
  const setupProductionServices = useCallback(async () => {
    if (!currentUser || servicesInitialized) return

    try {
      // Use the production initialization system
      await initializeProductionServices(currentUser.id)
      setServicesInitialized(true)
      
      console.log('Production services initialized successfully')
      console.log('Service statuses:', serviceStatuses)
      console.log('Overall health:', overallHealth)
    } catch (error) {
      console.error('Failed to initialize production services:', error)
      // Continue with fallback mode - the app should still work with local data
    }
  }, [currentUser, servicesInitialized, serviceStatuses, overallHealth])

  useEffect(() => {
    setupProductionServices()
  }, [setupProductionServices])

  // Cleanup production services on unmount
  useEffect(() => {
    return () => {
      webSocketService.disconnect()
      setServicesInitialized(false)
    }
  }, [])

  // Initialize real production services with proper dependency management
  const virtualLab = useVirtualLab(currentUser?.id || '')
  const messaging = useRealMessaging(currentUser?.id || '')
  const codeCollaboration = useRealCodeCollaboration(currentUser?.id || '')

  // Use the services to avoid unused variable warnings - wrapped in useCallback
  const logServicesStatus = useCallback(() => {
    console.log('Production services initialized:', { virtualLab, messaging, codeCollaboration })
  }, [virtualLab, messaging, codeCollaboration])

  useEffect(() => {
    logServicesStatus()
  }, [logServicesStatus])

  // Stable callback functions to prevent unnecessary re-renders
  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user)
    setShowAuthModal(false)
  }, [setCurrentUser])

  const handleLogout = useCallback(() => {
    setCurrentUser(null)
    setActiveTab('feed')
    setServicesInitialized(false)
  }, [setCurrentUser])

  const handleTabChange = useCallback((tab: typeof activeTab) => {
    setActiveTab(tab)
  }, [])

  const handleShowAuthModal = useCallback(() => {
    setShowAuthModal(true)
  }, [])

  const handleCloseAuthModal = useCallback(() => {
    setShowAuthModal(false)
  }, [])

  const handleShowApiKeyManager = useCallback(() => {
    setShowApiKeyManager(true)
  }, [])

  const handleCloseApiKeyManager = useCallback(() => {
    setShowApiKeyManager(false)
  }, [])

  const handleApplyApiKey = useCallback((service: import('@/lib/api-keys').ApiServiceKey, key: string) => {
    // Store last used key in local state; persistence handled within ApiKeyManager
    setApiKey(key);
  }, []);

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
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleShowAuthModal}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover-red-glow transition-all duration-300 transform hover:scale-105 text-lg"
            >
              Join the Community
            </button>
            <button
              onClick={handleShowApiKeyManager}
              className="bg-black bg-opacity-70 text-red-500 px-6 py-4 rounded-lg font-semibold border border-red-500 shadow-lg glitch-effect hover:scale-105 transition-all duration-300"
            >
              Enter API Key
            </button>
          </div>
        </div>
        {showAuthModal && (
          <AuthModal
            onClose={handleCloseAuthModal}
            onLogin={handleLogin}
          />
        )}
        {showApiKeyManager && (
          <ApiKeyManager
            visible={showApiKeyManager}
            onClose={handleCloseApiKeyManager}
            onApply={handleApplyApiKey}
          />
        )}
        <Toaster />
      </div>
    );
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
          onTabChange={handleTabChange}
          onLogout={handleLogout}
        />
        <MainContent
          currentUser={currentUser}
          activeTab={activeTab}
          onUserUpdate={setCurrentUser}
          onTabChange={handleTabChange}
        />
      </div>
      <button
        onClick={handleShowApiKeyManager}
        className="fixed bottom-8 right-8 bg-black bg-opacity-70 text-red-500 px-6 py-4 rounded-lg font-semibold border border-red-500 shadow-lg glitch-effect hover:scale-105 transition-all duration-300 z-50"
      >
        Enter API Key
      </button>
      {showApiKeyManager && (
        <ApiKeyManager
          visible={showApiKeyManager}
          onClose={handleCloseApiKeyManager}
          onApply={handleApplyApiKey}
        />
      )}
      <Toaster />
    </div>
  );
}

// Wrap the main App component with production error boundary
function WrappedApp() {
  return (
    <ProductionErrorBoundary>
      <App />
    </ProductionErrorBoundary>
  );
}

export default WrappedApp;