import { useState } from 'react'
import { usePartnerRequests } from '@/hooks/usePartnerRequests'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { PartnerRequest, User } from '@/types'
import { X, Plus, Tag } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CreatePartnerRequestModalProps {
  currentUser: User
  onClose: () => void
}

export function CreatePartnerRequestModal({ currentUser, onClose }: CreatePartnerRequestModalProps) {
  const { createPartnerRequest, skillCategories } = usePartnerRequests()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectType: '' as PartnerRequest['projectType'],
    experienceLevel: '' as PartnerRequest['experienceLevel'],
    commitment: '' as PartnerRequest['commitment'],
    compensation: '' as PartnerRequest['compensation'],
    estimatedDuration: ''
  })
  
  const [skillsOffered, setSkillsOffered] = useState<string[]>([])
  const [skillsNeeded, setSkillsNeeded] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [activeSkillTab, setActiveSkillTab] = useState<'offered' | 'needed'>('offered')

  const handleSkillToggle = (skill: string, type: 'offered' | 'needed') => {
    if (type === 'offered') {
      setSkillsOffered(current => 
        current.includes(skill) 
          ? current.filter(s => s !== skill)
          : [...current, skill]
      )
    } else {
      setSkillsNeeded(current => 
        current.includes(skill) 
          ? current.filter(s => s !== skill)
          : [...current, skill]
      )
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim().toLowerCase()])
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please provide a title for your partner request')
      return
    }
    
    if (!formData.description.trim()) {
      toast.error('Please provide a description')
      return
    }
    
    if (!formData.projectType) {
      toast.error('Please select a project type')
      return
    }
    
    if (skillsOffered.length === 0) {
      toast.error('Please select at least one skill you can offer')
      return
    }
    
    if (skillsNeeded.length === 0) {
      toast.error('Please select at least one skill you need')
      return
    }

    const newRequest = createPartnerRequest({
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterAvatar: currentUser.avatar,
      title: formData.title.trim(),
      description: formData.description.trim(),
      projectType: formData.projectType,
      skillsOffered,
      skillsNeeded,
      experienceLevel: formData.experienceLevel,
      commitment: formData.commitment,
      compensation: formData.compensation,
      estimatedDuration: formData.estimatedDuration.trim(),
      tags
    })

    toast.success('Partner request created successfully!')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Create Partner Request</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Looking for Red Team Partner for Enterprise Assessment"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the project, goals, and what you're looking for in a partner..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Project Type *</Label>
                    <Select value={formData.projectType} onValueChange={(value) => setFormData({ ...formData, projectType: value as any })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug-bounty">🎯 Bug Bounty</SelectItem>
                        <SelectItem value="red-team">⚔️ Red Team</SelectItem>
                        <SelectItem value="blue-team">🛡️ Blue Team</SelectItem>
                        <SelectItem value="research">🔬 Research</SelectItem>
                        <SelectItem value="tool-development">🛠️ Tool Development</SelectItem>
                        <SelectItem value="ctf">🚩 CTF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Experience Level</Label>
                    <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({ ...formData, experienceLevel: value as any })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Commitment</Label>
                    <Select value={formData.commitment} onValueChange={(value) => setFormData({ ...formData, commitment: value as any })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Time commitment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="project-based">Project-based</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Compensation</Label>
                    <Select value={formData.compensation} onValueChange={(value) => setFormData({ ...formData, compensation: value as any })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Compensation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue-share">Revenue Share</SelectItem>
                        <SelectItem value="fixed-payment">Fixed Payment</SelectItem>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="experience">Experience</SelectItem>
                        <SelectItem value="negotiable">Negotiable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Estimated Duration</Label>
                    <Input
                      id="duration"
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                      placeholder="e.g., 3 months"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeSkillTab} onValueChange={(value) => setActiveSkillTab(value as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="offered">
                      Skills I Offer ({skillsOffered.length})
                    </TabsTrigger>
                    <TabsTrigger value="needed">
                      Skills I Need ({skillsNeeded.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="offered" className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Select skills you can contribute to the partnership
                    </p>
                    {skillCategories.map(category => (
                      <div key={category.id} className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.name}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {category.skills.map(skill => (
                            <div key={skill} className="flex items-center space-x-2">
                              <Checkbox
                                id={`offered-${skill}`}
                                checked={skillsOffered.includes(skill)}
                                onCheckedChange={() => handleSkillToggle(skill, 'offered')}
                              />
                              <Label 
                                htmlFor={`offered-${skill}`} 
                                className="text-sm cursor-pointer"
                              >
                                {skill}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="needed" className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Select skills you're looking for in a partner
                    </p>
                    {skillCategories.map(category => (
                      <div key={category.id} className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.name}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {category.skills.map(skill => (
                            <div key={skill} className="flex items-center space-x-2">
                              <Checkbox
                                id={`needed-${skill}`}
                                checked={skillsNeeded.includes(skill)}
                                onCheckedChange={() => handleSkillToggle(skill, 'needed')}
                              />
                              <Label 
                                htmlFor={`needed-${skill}`} 
                                className="text-sm cursor-pointer"
                              >
                                {skill}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Add tags (e.g., enterprise, automation, competition)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="hover-red-glow">
                Create Partner Request
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}