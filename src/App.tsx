import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { useSampleData } from '@/hooks/useSampleData'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { AuthModal } from '@/components/auth/AuthModal'
import { Toaster } from '@/components/ui/sonner'
import { User } from '@/types/user'

function App() {
  const [currentUser, setCurrentUser] = useKV<User | null>('currentUser', null)
  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'profile' | 'messages'>('feed')
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Initialize sample data
  useSampleData()

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">CyberConnect</h1>
            <p className="text-muted-foreground">
              The professional network for cybersecurity experts
            </p>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
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
    <div className="min-h-screen bg-background">
      <div className="flex">
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