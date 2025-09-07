import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Team, User, TeamType, TeamMember } from '@/types';
import { useSampleTeamData } from '@/hooks/useSampleTeamData';
import { X } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface CreateTeamModalProps {
  currentUser: User
  onClose: () => void
}

export function CreateTeamModal({ currentUser, onClose }: CreateTeamModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'red-team' as TeamType,
    maxMembers: 8,
    privacy: 'public' as 'public' | 'private' | 'invite-only',
    specialization: [] as string[],
    applicationRequired: true,
    minExperience: 1,
    requiredCertifications: [] as string[],
    location: ''
  });
  const [specializationInput, setSpecializationInput] = useState('');
  const [certificationInput, setCertificationInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { teamRoles } = useSampleTeamData();
  const [teams, setTeams] = useKVWithFallback<Team[]>('teams', []);

  const teamTypes: { value: TeamType; label: string; description: string }[] = [
    { value: 'red-team', label: 'Red Team', description: 'Offensive security and penetration testing' },
    { value: 'blue-team', label: 'Blue Team', description: 'Defensive security and incident response' },
    { value: 'purple-team', label: 'Purple Team', description: 'Combined offensive and defensive operations' },
    { value: 'bug-bounty', label: 'Bug Bounty Team', description: 'Collaborative vulnerability research' },
    { value: 'research', label: 'Security Research', description: 'Research and analysis focused' },
    { value: 'incident-response', label: 'Incident Response', description: 'Emergency response and forensics' },
    { value: 'forensics', label: 'Digital Forensics', description: 'Investigation and evidence analysis' },
    { value: 'compliance', label: 'Compliance Team', description: 'Security compliance and auditing' },
    { value: 'education', label: 'Education Team', description: 'Training and knowledge sharing' }
  ];

  const commonSpecializations = [
    'penetration-testing', 'vulnerability-assessment', 'network-security', 'web-application-security',
    'mobile-security', 'cloud-security', 'incident-response', 'digital-forensics', 'malware-analysis',
    'reverse-engineering', 'social-engineering', 'cryptography', 'osint', 'threat-hunting',
    'security-monitoring', 'compliance-auditing', 'risk-assessment', 'security-training'
  ];

  const commonCertifications = [
    'CISSP', 'CISM', 'CISA', 'CEH', 'OSCP', 'GSEC', 'GCIH', 'GIAC', 'Security+', 'CySA+',
    'SANS', 'OWASP', 'PMP', 'ITIL', 'ISO 27001'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {return;}

    setIsSubmitting(true);
    
    try {
      const leaderRole = teamRoles.find(role => role.id === 'team-leader');
      
      if (!leaderRole) {
        toast.error('Team leader role not found. Please try again.');
        return;
      }
      
      const currentUserMember: TeamMember = {
        id: `member-${Date.now()}`,
        userId: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
        role: leaderRole,
        permissions: leaderRole.permissions,
        earningsPercentage: leaderRole.defaultEarningsPercentage,
        joinedAt: new Date().toISOString(),
        status: 'active',
        specializations: formData.specialization,
        contribution: 100
      };

      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        specialization: formData.specialization,
        status: 'active',
        privacy: formData.privacy,
        members: [currentUserMember],
        maxMembers: formData.maxMembers,
        requiredRoles: ['team-leader'],
        leaderId: currentUser.id,
        moderators: [],
        totalEarnings: 0,
        activeContracts: 0,
        completedBounties: 0,
        averageRating: 0,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        verified: false,
        tags: [],
        location: formData.location || undefined,
        minExperience: formData.minExperience,
        requiredCertifications: formData.requiredCertifications,
        applicationRequired: formData.applicationRequired
      };

      setTeams(prev => [...prev, newTeam]);
      
      toast.success(`Team "${formData.name}" created successfully!`);
      onClose();
    } catch (error) {
      toast.error('Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSpecialization = (spec: string) => {
    if (spec.trim() && !formData.specialization.includes(spec.trim())) {
      setFormData(prev => ({
        ...prev,
        specialization: [...prev.specialization, spec.trim()]
      }));
      setSpecializationInput('');
    }
  };

  const removeSpecialization = (specToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.filter(spec => spec !== specToRemove)
    }));
  };

  const addCertification = (cert: string) => {
    if (cert.trim() && !formData.requiredCertifications.includes(cert.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredCertifications: [...prev.requiredCertifications, cert.trim()]
      }));
      setCertificationInput('');
    }
  };

  const removeCertification = (certToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requiredCertifications: prev.requiredCertifications.filter(cert => cert !== certToRemove)
    }));
  };

  const selectedTeamType = teamTypes.find(type => type.value === formData.type);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              <Select value={formData.type} onValueChange={(value: TeamType) => 
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
              <Label>Team Privacy</Label>
              <Select value={formData.privacy} onValueChange={(value: any) => 
                setFormData(prev => ({ ...prev, privacy: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Anyone can discover and apply</SelectItem>
                  <SelectItem value="private">Private - Hidden from public view</SelectItem>
                  <SelectItem value="invite-only">Invite Only - Members can only join by invitation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maxMembers">Maximum Members</Label>
              <div className="space-y-2">
                <Slider
                  value={[formData.maxMembers]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, maxMembers: value[0] }))}
                  max={20}
                  min={2}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>2 members</span>
                  <span className="font-medium">{formData.maxMembers} members</span>
                  <span>20 members</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Remote, New York, Global"
              />
            </div>

            <div>
              <Label htmlFor="specializations">Specializations</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="specializations"
                    value={specializationInput}
                    onChange={(e) => setSpecializationInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization(specializationInput))}
                    placeholder="Add a specialization"
                  />
                  <Button type="button" variant="outline" onClick={() => addSpecialization(specializationInput)}>
                    Add
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {commonSpecializations.map((spec) => (
                    <Button
                      key={spec}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSpecialization(spec)}
                      disabled={formData.specialization.includes(spec)}
                      className="justify-start text-xs"
                    >
                      + {spec.replace('-', ' ')}
                    </Button>
                  ))}
                </div>

                {formData.specialization.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.specialization.map((spec) => (
                      <Badge key={spec} variant="secondary" className="cursor-pointer" onClick={() => removeSpecialization(spec)}>
                        {spec.replace('-', ' ')} <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <h3 className="font-semibold text-foreground">Requirements</h3>
              
              <div>
                <Label htmlFor="minExperience">Minimum Experience (Years)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[formData.minExperience]}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, minExperience: value[0] }))}
                    max={10}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>No requirement</span>
                    <span className="font-medium">{formData.minExperience} years</span>
                    <span>10+ years</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="certifications">Required Certifications</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      id="certifications"
                      value={certificationInput}
                      onChange={(e) => setCertificationInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification(certificationInput))}
                      placeholder="Add a certification"
                    />
                    <Button type="button" variant="outline" onClick={() => addCertification(certificationInput)}>
                      Add
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {commonCertifications.map((cert) => (
                      <Button
                        key={cert}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCertification(cert)}
                        disabled={formData.requiredCertifications.includes(cert)}
                        className="justify-start text-xs"
                      >
                        + {cert}
                      </Button>
                    ))}
                  </div>

                  {formData.requiredCertifications.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.requiredCertifications.map((cert) => (
                        <Badge key={cert} variant="secondary" className="cursor-pointer" onClick={() => removeCertification(cert)}>
                          {cert} <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="applicationRequired">Application Required</Label>
                  <p className="text-sm text-muted-foreground">Require applications instead of automatic join</p>
                </div>
                <Switch
                  id="applicationRequired"
                  checked={formData.applicationRequired}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, applicationRequired: checked }))}
                />
              </div>
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
      </DialogContent>
    </Dialog>
  );
}