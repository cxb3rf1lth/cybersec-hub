import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { User, Specialization } from '@/types/user'

interface EditProfileModalProps {
  user: User
  onClose: () => void
  onSave: (user: User) => void
}

const SPECIALIZATIONS: Specialization[] = [
  'Red Team', 'Blue Team', 'Bug Bounty', 'Penetration Testing',
  'Ethical Hacking', 'Malware Analysis', 'Incident Response',
  'Security Research', 'OSINT', 'Reverse Engineering'
]

export function EditProfileModal({ user, onClose, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    bio: user.bio || '',
    specializations: [...user.specializations]
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
    
    const updatedUser: User = {
      ...user,
      username: formData.username,
      email: formData.email,
      bio: formData.bio,
      specializations: formData.specializations
    }

    onSave(updatedUser)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-username">Username</Label>
            <Input
              id="edit-username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea
              id="edit-bio"
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

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}