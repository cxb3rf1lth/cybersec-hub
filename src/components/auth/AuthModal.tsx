import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { HexSpinner, CyberProgress } from '@/components/ui/loading-animations'
import { User, Specialization } from '@/types/user'

interface AuthModalProps {
  onClose: () => void
  onLogin: (user: User) => void
}

const SPECIALIZATIONS: Specialization[] = [
  'Red Team', 'Blue Team', 'Bug Bounty', 'Penetration Testing',
  'Ethical Hacking', 'Malware Analysis', 'Incident Response',
  'Security Research', 'OSINT', 'Reverse Engineering'
]

export function AuthModal({ onClose, onLogin }: AuthModalProps) {
  const [allUsers, setAllUsers] = useKV<User[]>('allUsers', [])
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    specializations: [] as Specialization[]
  })

  const handleSpecializationToggle = (spec: Specialization) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username || !formData.email) return

    if (isSignUp) {
      // Check if user already exists
      const existingUser = allUsers.find(user => 
        user.username === formData.username || user.email === formData.email
      )
      
      if (existingUser) {
        // User exists, log them in
        onLogin(existingUser)
        return
      }

      // Create new user
      const user: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        specializations: formData.specializations,
        followers: [],
        following: [],
        joinedAt: new Date().toISOString()
      }

      // Add to global users list
      setAllUsers((prevUsers) => [...prevUsers, user])
      onLogin(user)
    } else {
      // Sign in - find existing user
      const existingUser = allUsers.find(user => 
        user.username === formData.username || user.email === formData.email
      )
      
      if (existingUser) {
        onLogin(existingUser)
      } else {
        // If user doesn't exist, switch to sign up
        setIsSignUp(true)
      }
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground terminal-cursor">
            {isSignUp ? 'Join CyberConnect' : 'Welcome Back'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter your username"
              className="hover-border-flow"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
              className="hover-border-flow"
              required
            />
          </div>

          {isSignUp && (
            <>
              <div>
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about your cybersecurity background..."
                  className="hover-border-flow"
                  rows={3}
                />
              </div>

              <div>
                <Label>Specializations</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SPECIALIZATIONS.map((spec) => (
                    <Badge
                      key={spec}
                      variant={formData.specializations.includes(spec) ? 'default' : 'outline'}
                      className="cursor-pointer hover-red-glow transition-all duration-300"
                      onClick={() => handleSpecializationToggle(spec)}
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 pt-4">
            <Button type="submit" className="w-full hover-red-glow">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm hover:text-accent transition-colors duration-300"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}