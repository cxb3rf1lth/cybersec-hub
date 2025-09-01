import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  const [isSignUp, setIsSignUp] = useState(false)
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

    const user: User = {
      id: Date.now().toString(),
      username: formData.username,
      email: formData.email,
      bio: formData.bio,
      specializations: formData.specializations,
      followers: [],
      following: [],
      joinedAt: new Date().toISOString()
    }

    onLogin(user)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
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
                      className="cursor-pointer"
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
            <Button type="submit" className="w-full">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm"
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