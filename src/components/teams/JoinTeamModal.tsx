import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TeamCard } from './TeamCard';
import { Team, User, TeamApplication } from '@/types';
import { useSampleTeamData } from '@/hooks/useSampleTeamData';
import { Search, Filter, Users, Star, TrendingUp } from '@/lib/phosphor-icons-wrapper';
import { toast } from 'sonner';

interface JoinTeamModalProps {
  onClose: () => void
  currentUser: User
}

export function JoinTeamModal({ onClose, currentUser }: JoinTeamModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [application, setApplication] = useState({
    motivation: '',
    experience: '',
    desiredRole: 'security-engineer'
  });
  const [submitting, setSubmitting] = useState(false);

  const { teams, teamRoles } = useSampleTeamData();
  const [applications, setApplications] = useKVWithFallback<TeamApplication[]>('teamApplications', []);

  // Filter teams where user is not already a member
  const availableTeams = teams.filter(team => 
    !team.members.some(member => member.userId === currentUser.id) &&
    team.status !== 'inactive' &&
    team.members.length < team.maxMembers
  );

  const filteredTeams = availableTeams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.specialization.some(spec => 
      spec.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleApply = async (team: Team) => {
    if (!application.motivation.trim()) {
      toast.error('Please provide motivation for joining');
      return;
    }

    setSubmitting(true);

    try {
      const newApplication: TeamApplication = {
        id: `app-${Date.now()}`,
        teamId: team.id,
        applicantId: currentUser.id,
        applicantUsername: currentUser.username,
        applicantAvatar: currentUser.avatar,
        desiredRole: application.desiredRole,
        motivation: application.motivation,
        experience: application.experience,
        certifications: [], // TODO: Get from user profile
        portfolio: [], // TODO: Get from user profile
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      setApplications(prev => [...prev, newApplication]);
      
      toast.success(`Application submitted to ${team.name}`);
      onClose();
    } catch (error) {
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (selectedTeam) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply to {selectedTeam.name}</DialogTitle>
            <DialogDescription>
              Submit your application to join this cybersecurity team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Team Preview */}
            <TeamCard 
              team={selectedTeam} 
              currentUser={currentUser}
            />

            {/* Application Form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Desired Role
                </label>
                <select
                  value={application.desiredRole}
                  onChange={(e) => setApplication(prev => ({ ...prev, desiredRole: e.target.value }))}
                  className="w-full mt-1 p-2 border border-input rounded-md bg-background text-foreground"
                >
                  {teamRoles
                    .filter(role => role.id !== 'team-leader')
                    .map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Why do you want to join this team? *
                </label>
                <Textarea
                  value={application.motivation}
                  onChange={(e) => setApplication(prev => ({ ...prev, motivation: e.target.value }))}
                  placeholder="Explain your motivation and what you can contribute..."
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Relevant Experience
                </label>
                <Textarea
                  value={application.experience}
                  onChange={(e) => setApplication(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="Describe your cybersecurity experience, projects, and achievements..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setSelectedTeam(null)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => handleApply(selectedTeam)}
                disabled={submitting || !application.motivation.trim()}
                className="flex-1"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Browse Teams</DialogTitle>
          <DialogDescription>
            Discover and join cybersecurity teams that match your interests
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search teams by name, description, or specialization..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{availableTeams.length}</div>
                <div className="text-sm text-muted-foreground">Available Teams</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {availableTeams.filter(t => t.status === 'recruiting').length}
                </div>
                <div className="text-sm text-muted-foreground">Recruiting</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {(availableTeams.reduce((sum, t) => sum + t.averageRating, 0) / availableTeams.length).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </CardContent>
            </Card>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTeams.map(team => (
              <div key={team.id} className="relative">
                <TeamCard 
                  team={team} 
                  currentUser={currentUser}
                  onClick={() => setSelectedTeam(team)}
                />
                <div className="absolute top-4 right-4">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTeam(team);
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredTeams.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No teams found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or check back later for new teams.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}