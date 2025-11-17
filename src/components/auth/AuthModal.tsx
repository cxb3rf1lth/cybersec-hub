import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MatrixDots, CyberProgress } from '@/components/ui/loading-animations'
import { User, Specialization } from '@/types/user'
import { authService } from '@/lib/auth-service'
import { toast } from 'sonner'

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
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }

    if (isSignUp) {
      if (!formData.username) {
        toast.error('Username is required')
        return
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }

      if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters')
        return
      }
    }

    setIsLoading(true)

    try {
      if (isSignUp) {
        // Real user registration
        const result = await authService.register({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          fullName: formData.username
        })

        if (result.success && result.user) {
          // Update user profile with bio and specializations
          const updatedUser = {
            ...result.user,
            bio: formData.bio,
            specializations: formData.specializations
          }

          onLogin(updatedUser)
          toast.success('Account created successfully!')
        } else {
          toast.error(result.error || 'Registration failed')
        }
      } else {
        // Real user login
        const result = await authService.login({
          email: formData.email,
          password: formData.password
        })

        if (result.success && result.user) {
          onLogin(result.user)
          toast.success('Welcome back!')
        } else {
          toast.error(result.error || 'Login failed')
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      toast.error('An error occurred during authentication')
    } finally {
      setIsLoading(false)
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

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter your password"
              className="hover-border-flow"
              required
              minLength={8}
            />
          </div>

          {isSignUp && (
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your password"
                className="hover-border-flow"
                required
                minLength={8}
              />
            </div>
          )}

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
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <MatrixDots size="md" />
                </div>
                <CyberProgress progress={75} showPercentage={false} />
                <p className="text-center text-sm text-muted-foreground font-mono">
                  {isSignUp ? 'Creating secure account...' : 'Authenticating credentials...'}
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}