import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { 
  Users, 
  Plus, 
  Search, 
  Crown, 
  Shield, 
  Wrench, 
  Code, 
  Eye,
  Settings,
  GitBranch,
  Calendar,
  Activity
} from '@/lib/phosphor-icons-wrapper';
import { TeamInfo, TeamMember, User, TeamProject } from '@/types';
import { CreateTeamModal } from './CreateTeamModal';
import { TeamDetailModal } from './TeamDetailModal';
import { format } from 'date-fns';

interface TeamDashboardProps {
  currentUser: User
}

export function TeamDashboard({ currentUser }: TeamDashboardProps) {
  const [teams] = useKVWithFallback<TeamInfo[]>('teams', []);
  const [teamProjects] = useKVWithFallback<TeamProject[]>('teamProjects', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamInfo | null>(null);
  const [filter, setFilter] = useState<'all' | 'my-teams' | 'public'>('all');

  // Filter teams based on search and user membership
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) {return false;}

    switch (filter) {
      case 'my-teams':
        return team.members.some(member => member.id === currentUser.id);
      case 'public':
        return team.isPublic;
      default:
        return true;
    }
  });

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'maintainer':
        return <Wrench className="w-4 h-4 text-green-500" />;
      case 'developer':
        return <Code className="w-4 h-4 text-purple-500" />;
      default:
        return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTeamProjects = (teamId: string) => {
    return teamProjects.filter(project => project.team.id === teamId);
  };

  const isUserMember = (team: TeamInfo) => {
    return team.members.some(member => member.id === currentUser.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Collaboration</h1>
          <p className="text-muted-foreground">
            Work together on cybersecurity templates and projects
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Team
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'my-teams', 'public'] as const).map(filterType => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType)}
              className="whitespace-nowrap"
            >
              {filterType === 'my-teams' ? 'My Teams' : 
               filterType === 'public' ? 'Public' : 'All Teams'}
            </Button>
          ))}
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map(team => {
          const userMembership = team.members.find(member => member.id === currentUser.id);
          const projects = getTeamProjects(team.id);
          
          return (
            <Card 
              key={team.id} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedTeam(team)}
            >
              <div className="space-y-3">
                {/* Team Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{team.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {team.description}
                    </p>
                  </div>
                  {!team.isPublic && (
                    <Shield className="w-4 h-4 text-muted-foreground mt-1" />
                  )}
                </div>

                {/* Member Avatars */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {team.members.slice(0, 4).map(member => (
                      <div key={member.id} className="relative">
                        <Avatar className="w-8 h-8 border-2 border-background">
                          <img src={member.avatar} alt={member.username} />
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1">
                          {getRoleIcon(member.role)}
                        </div>
                      </div>
                    ))}
                    {team.members.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          +{team.members.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <GitBranch className="w-4 h-4" />
                    <span>{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(team.createdAt, 'MMM yyyy')}</span>
                  </div>
                </div>

                {/* User Status */}
                <div className="flex items-center justify-between">
                  {userMembership ? (
                    <div className="flex items-center gap-2">
                      {getRoleIcon(userMembership.role)}
                      <Badge variant="secondary" className="text-xs">
                        {userMembership.role}
                      </Badge>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      {team.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  )}
                  
                  {userMembership?.permissions.canManagePermissions && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Settings className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                {/* Recent Activity */}
                {team.members.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <Activity className="w-3 h-3" />
                    <span>
                      Last active {format(
                        Math.max(...team.members.map(m => m.lastActive.getTime())), 
                        'MMM d'
                      )}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No teams found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search terms' : 'Create a team to start collaborating'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Team
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateTeamModal
          currentUser={currentUser}
          onClose={() => setShowCreateModal(false)}
          onTeamCreated={(team) => {
            setSelectedTeam(team);
            setShowCreateModal(false);
          }}
        />
      )}

      {selectedTeam && (
        <TeamDetailModal
          team={selectedTeam}
          currentUser={currentUser}
          onClose={() => setSelectedTeam(null)}
          onTeamUpdated={setSelectedTeam}
        />
      )}
    </div>
  );
}