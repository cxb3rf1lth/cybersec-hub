import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { Plus, Users, Star, Trophy, Search, Filter, Crown, Shield } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateTeamModal } from '@/components/teams/CreateTeamModal';
import { TeamDetailsModal } from '@/components/teams/TeamDetailsModal';
import { BugBountyTeamCard } from '@/components/teams/BugBountyTeamCard';
import { Team, User, Project } from '@/types';

interface TeamsViewProps {
  currentUser: User
}

export function TeamsView({ currentUser }: TeamsViewProps) {
  const [teams, setTeams] = useKVWithFallback<Team[]>('teams', []);
  const [allUsers] = useKVWithFallback<User[]>('allUsers', []);
  const [projects] = useKVWithFallback<Project[]>('projects', []);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'my-teams' | 'discover' | 'invitations'>('my-teams');

  // Get user's teams
  const userTeams = teams.filter(team => 
    team.members.some(member => member.userId === currentUser.id)
  );

  // Get public teams for discovery
  const publicTeams = teams.filter(team => 
    team.isPublic && !team.members.some(member => member.userId === currentUser.id)
  );

  // Filter teams based on search and type
  const filterTeams = (teamList: Team[]) => {
    return teamList.filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           team.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || team.type === typeFilter;
      return matchesSearch && matchesType;
    });
  };

  const handleCreateTeam = (teamData: Omit<Team, 'id' | 'createdAt'>) => {
    const newTeam: Team = {
      ...teamData,
      id: `team-${Date.now()}`,
      ownerId: currentUser.id,
      members: [{
        userId: currentUser.id,
        role: 'owner',
        permissions: [
          { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'assign'] },
          { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'assign'] },
          { resource: 'members', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'settings', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'repositories', actions: ['create', 'read', 'update', 'delete', 'assign'] }
        ],
        joinedAt: new Date().toISOString(),
        contribution: 100,
        isActive: true
      }],
      projects: [],
      reputation: 0,
      successfulProjects: 0,
      createdAt: new Date().toISOString()
    };
    setTeams(current => [...current, newTeam]);
    setShowCreateModal(false);
  };

  const getTypeColor = (type: Team['type']) => {
    switch (type) {
      case 'bug-bounty': return 'bg-orange-500/20 text-orange-300';
      case 'research': return 'bg-cyan-500/20 text-cyan-300';
      case 'development': return 'bg-blue-500/20 text-blue-300';
      case 'red-team': return 'bg-red-500/20 text-red-300';
      case 'blue-team': return 'bg-blue-600/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getRoleIcon = (role: Team['members'][0]['role']) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'admin': return <Shield className="w-4 h-4 text-blue-400" />;
      default: return null;
    }
  };

  const TeamCard = ({ team, showJoinButton = false }: { team: Team; showJoinButton?: boolean }) => {
    const teamProjects = projects.filter(p => p.teamId === team.id);
    const userRole = team.members.find(m => m.userId === currentUser.id)?.role;

    return (
      <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg truncate">{team.name}</CardTitle>
                {userRole && getRoleIcon(userRole)}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {team.description}
              </p>
            </div>
            {showJoinButton && (
              <Button size="sm" onClick={(e) => {
                e.stopPropagation();
                // Handle join team request
              }}>
                Join
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <Badge className={getTypeColor(team.type)}>
              {team.type.replace('-', ' ')}
            </Badge>
            {team.type === 'bug-bounty' && team.totalEarnings && (
              <Badge variant="outline" className="text-green-400">
                ${team.totalEarnings.toLocaleString()}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {team.members.length} members
                {team.maxMembers && ` / ${team.maxMembers}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {team.successfulProjects} projects
              </span>
            </div>
          </div>

          {team.reputation > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-muted-foreground">
                {team.reputation} reputation
              </span>
            </div>
          )}

          {team.requiredSkills.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Required Skills:</p>
              <div className="flex flex-wrap gap-1">
                {team.requiredSkills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {team.requiredSkills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{team.requiredSkills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {team.members.slice(0, 4).map((member) => {
                const user = allUsers.find(u => u.id === member.userId);
                if (!user) {return null;}
                return (
                  <Avatar key={member.userId} className="w-6 h-6 border-2 border-background">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs">
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                );
              })}
              {team.members.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    +{team.members.length - 4}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Teams</h1>
            <p className="text-muted-foreground">Collaborate with security professionals and form specialized teams</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-teams">My Teams ({userTeams.length})</TabsTrigger>
            <TabsTrigger value="discover">Discover Teams</TabsTrigger>
            <TabsTrigger value="invitations">Invitations (0)</TabsTrigger>
          </TabsList>

          <div className="mt-6 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="bug-bounty">Bug Bounty</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="red-team">Red Team</SelectItem>
                <SelectItem value="blue-team">Blue Team</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="my-teams" className="mt-6">
            {userTeams.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No teams yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create or join a team to start collaborating on security projects
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Team
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterTeams(userTeams).map((team) => (
                  <div 
                    key={team.id} 
                    className="cursor-pointer"
                    onClick={() => setSelectedTeam(team)}
                  >
                    {team.type === 'bug-bounty' ? (
                      <BugBountyTeamCard team={team} allUsers={allUsers} />
                    ) : (
                      <TeamCard team={team} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="mt-6">
            {publicTeams.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No public teams available</h3>
                <p className="text-muted-foreground">
                  Check back later for teams looking for new members
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterTeams(publicTeams).map((team) => (
                  <div 
                    key={team.id} 
                    className="cursor-pointer"
                    onClick={() => setSelectedTeam(team)}
                  >
                    {team.type === 'bug-bounty' ? (
                      <BugBountyTeamCard team={team} allUsers={allUsers} showJoinButton />
                    ) : (
                      <TeamCard team={team} showJoinButton />
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invitations" className="mt-6">
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No invitations</h3>
              <p className="text-muted-foreground">
                Team invitations will appear here when you receive them
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {showCreateModal && (
        <CreateTeamModal
          currentUser={currentUser}
          onClose={() => setShowCreateModal(false)}
          onCreateTeam={handleCreateTeam}
        />
      )}

      {selectedTeam && (
        <TeamDetailsModal
          team={selectedTeam}
          currentUser={currentUser}
          allUsers={allUsers}
          onClose={() => setSelectedTeam(null)}
          onUpdateTeam={(updatedTeam) => {
            setTeams(current => 
              current.map(t => t.id === updatedTeam.id ? updatedTeam : t)
            );
            setSelectedTeam(updatedTeam);
          }}
        />
      )}
    </div>
  );
}