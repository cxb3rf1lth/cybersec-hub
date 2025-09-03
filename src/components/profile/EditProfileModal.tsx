import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApiKeySettings } from '@/components/settings/ApiKeySettings'
import { ApiIntegrationTester } from '@/components/settings/ApiIntegrationTester'
import { ThemeSelector } from '@/components/profile/ThemeSelector'
import { User, Specialization } from '@/types/user'
import { Key, User as UserIcon, Palette } from '@phosphor-icons/react'

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
  const [showApiKeySettings, setShowApiKeySettings] = useState(false)

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
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon size={24} className="text-accent" />
              Profile Settings
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="profile" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            <div className="h-96 overflow-y-auto mt-4">
              <TabsContent value="profile" className="space-y-4">
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
              </TabsContent>

              <TabsContent value="integrations" className="space-y-4">
                <div className="space-y-6">
                  <div className="text-center py-4">
                    <Key size={48} className="mx-auto text-accent/60 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">API Key Management</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Configure API keys for bug bounty platforms, threat intelligence feeds, and security tools
                    </p>
                    <Button 
                      onClick={() => setShowApiKeySettings(true)}
                      className="flex items-center gap-2"
                    >
                      <Key size={16} />
                      Manage API Keys
                    </Button>
                  </div>
                  
                  <ApiIntegrationTester />
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Palette size={20} className="text-accent" />
                      Theme Settings
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Customize the appearance of your interface
                    </p>
                    <ThemeSelector />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ApiKeySettings 
        open={showApiKeySettings} 
        onOpenChange={setShowApiKeySettings} 
      />
    </>
  )
}