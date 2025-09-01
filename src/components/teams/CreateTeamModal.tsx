import { useState } from 'react'
import { X, Users, Target, DollarSign } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Team, User, TeamSettings } from '@/types'

interface CreateTeamModalProps {
  currentUser: User
  onClose: () => void
  onCreateTeam: (team: Omit<Team, 'id' | 'createdAt'>) => void
}

export function CreateTeamModal({ currentUser, onClose, onCreateTeam }: CreateTeamModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'general' as Team['type'],
    maxMembers: 10,
    isPublic: true,
    requiredSkills: [] as string[],
    autoAcceptMembers: false,
    requireSkillVerification: false,
    earningsDistribution: 'equal' as TeamSettings['earningsDistribution'],
    projectApprovalRequired: true,
    maxProjectsPerMember: 3
  })
  const [skillInput, setSkillInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const teamTypes = [
    { value: 'general', label: 'General Security Team', description: 'Multi-purpose cybersecurity team' },
    { value: 'bug-bounty', label: 'Bug Bounty Team', description: 'Specialized in vulnerability research' },
    { value: 'research', label: 'Research Team', description: 'Security research and analysis' },
    { value: 'development', label: 'Development Team', description: 'Security tool and application development' },
    { value: 'red-team', label: 'Red Team', description: 'Offensive security and penetration testing' },
    { value: 'blue-team', label: 'Blue Team', description: 'Defensive security and incident response' }
  ]

  const commonSkills = [
    'Penetration Testing', 'Vulnerability Assessment', 'Network Security', 'Web Application Security',
    'Mobile Security', 'Cloud Security', 'Incident Response', 'Digital Forensics', 'Malware Analysis',
    'Reverse Engineering', 'Social Engineering', 'Cryptography', 'OSINT', 'Bug Bounty',
    'Python', 'JavaScript', 'Go', 'Rust', 'C/C++', 'PowerShell', 'Bash'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    
    const teamSettings: TeamSettings = {
      autoAcceptMembers: formData.autoAcceptMembers,
      requireSkillVerification: formData.requireSkillVerification,
      earningsDistribution: formData.earningsDistribution,
      projectApprovalRequired: formData.projectApprovalRequired,
      maxProjectsPerMember: formData.maxProjectsPerMember
    }

    const teamData: Omit<Team, 'id' | 'createdAt'> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      type: formData.type,
      ownerId: currentUser.id,
      members: [], // Will be populated with owner in parent
      projects: [],
      requiredSkills: formData.requiredSkills,
      maxMembers: formData.maxMembers || undefined,
      isPublic: formData.isPublic,
      reputation: 0,
      totalEarnings: formData.type === 'bug-bounty' ? 0 : undefined,
      successfulProjects: 0,
      settings: teamSettings
    }

    onCreateTeam(teamData)
    setIsSubmitting(false)
  }

  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.requiredSkills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skill.trim()]
      }))
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSkillInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill(skillInput)
    }
  }

  const selectedTeamType = teamTypes.find(type => type.value === formData.type)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Create New Team</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter team name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your team's focus and goals"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="type">Team Type</Label>
              <Select value={formData.type} onValueChange={(value: Team['type']) => 
                setFormData(prev => ({ ...prev, type: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTeamType && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTeamType.description}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="maxMembers">Maximum Members</Label>
              <div className="space-y-2">
                <Slider
                  value={[formData.maxMembers]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, maxMembers: value[0] }))}
                  max={50}
                  min={2}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>2 members</span>
                  <span className="font-medium">{formData.maxMembers} members</span>
                  <span>50 members</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="skills">Required Skills</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleSkillInputKeyPress}
                    placeholder="Add a required skill"
                  />
                  <Button type="button" variant="outline" onClick={() => addSkill(skillInput)}>
                    Add
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {commonSkills.map((skill) => (
                    <Button
                      key={skill}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSkill(skill)}
                      disabled={formData.requiredSkills.includes(skill)}
                      className="justify-start text-xs"
                    >
                      + {skill}
                    </Button>
                  ))}
                </div>

                {formData.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.requiredSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                        {skill} <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <h3 className="font-semibold text-foreground">Team Settings</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isPublic">Public Team</Label>
                  <p className="text-sm text-muted-foreground">Allow others to discover and request to join</p>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoAccept">Auto-accept Members</Label>
                  <p className="text-sm text-muted-foreground">Automatically accept join requests</p>
                </div>
                <Switch
                  id="autoAccept"
                  checked={formData.autoAcceptMembers}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoAcceptMembers: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="skillVerification">Skill Verification</Label>
                  <p className="text-sm text-muted-foreground">Require skill verification for new members</p>
                </div>
                <Switch
                  id="skillVerification"
                  checked={formData.requireSkillVerification}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requireSkillVerification: checked }))}
                />
              </div>

              {formData.type === 'bug-bounty' && (
                <div>
                  <Label htmlFor="earnings">Earnings Distribution</Label>
                  <Select value={formData.earningsDistribution} onValueChange={(value: TeamSettings['earningsDistribution']) => 
                    setFormData(prev => ({ ...prev, earningsDistribution: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equal">Equal Split</SelectItem>
                      <SelectItem value="contribution-based">Contribution Based</SelectItem>
                      <SelectItem value="manual">Manual Distribution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim() || isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}