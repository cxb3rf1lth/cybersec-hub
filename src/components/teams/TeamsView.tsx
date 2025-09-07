import { useState } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateTeamModal } from './CreateTeamModal'
import { TeamCard } from './TeamCard'
import { TeamDetailsModal } from './TeamDetailsModal'
import { JoinTeamModal } from './JoinTeamModal'
import { ProposalManagementView } from '@/components/marketplace/ProposalManagementView'
import { MatrixDots, BinaryRain } from '@/components/ui/loading-animations'
import { Team } from '@/types/teams'
import { User } from '@/types/user'
import { useSampleTeamData } from '@/hooks/useSampleTeamData'
import { Plus, Users, TrendingUp, Star, Filter } from '@phosphor-icons/react'

interface TeamsViewProps {
  currentUser: User
}

export function TeamsView({ currentUser }: TeamsViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [filter, setFilter] = useState<'all' | 'my-teams' | 'recruiting' | 'proposals'>('all')
  
  const { teams } = useSampleTeamData()
  const [myTeams] = useKVWithFallback<string[]>('userTeams', [])

  const userTeams = teams.filter(team => 
    team.members.some(member => member.userId === currentUser.id)
  )

  const filteredTeams = teams.filter(team => {
    switch (filter) {
      case 'my-teams':
        return userTeams.includes(team)
      case 'recruiting':
        return team.status === 'recruiting'
      default:
        return true
    }
  })

  const stats = {
    totalTeams: teams.length,
    myTeams: userTeams.length,
    totalEarnings: userTeams.reduce((sum, team) => sum + team.totalEarnings, 0),
    activeContracts: userTeams.reduce((sum, team) => sum + team.activeContracts, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teams</h1>
          <p className="text-muted-foreground">
            Join specialized cybersecurity teams or create your own
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => setShowJoinModal(true)}
          >
            <Users className="w-4 h-4 mr-2" />
            Browse Teams
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">My Teams</p>
                <p className="text-2xl font-bold">{stats.myTeams}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">${stats.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Star className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Contracts</p>
                <p className="text-2xl font-bold">{stats.activeContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Users className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Teams</p>
                <p className="text-2xl font-bold">{stats.totalTeams}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Teams Section */}
      {userTeams.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">My Teams</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {userTeams.map(team => (
              <TeamCard
                key={team.id}
                team={team}
                currentUser={currentUser}
                showMemberRole={true}
                onClick={() => setSelectedTeam(team)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Teams */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {filter === 'my-teams' ? 'My Teams' : 
             filter === 'recruiting' ? 'Recruiting Teams' : 
             filter === 'proposals' ? 'Team Proposals' :
             'All Teams'}
          </h2>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="my-teams">My Teams</TabsTrigger>
              <TabsTrigger value="recruiting">Recruiting</TabsTrigger>
              <TabsTrigger value="proposals">Proposals</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filter === 'proposals' ? (
          <ProposalManagementView currentUser={currentUser} userTeams={userTeams} />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTeams.map(team => (
                <TeamCard
                  key={team.id}
                  team={team}
                  currentUser={currentUser}
                  onClick={() => setSelectedTeam(team)}
                />
              ))}
            </div>

            {filteredTeams.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {filter === 'my-teams' ? 'No teams yet' : 'No teams found'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {filter === 'my-teams' 
                      ? 'Join or create a team to get started with collaborative cybersecurity work.'
                      : 'Try adjusting your filters or create a new team.'}
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Team
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          currentUser={currentUser}
        />
      )}

      {showJoinModal && (
        <JoinTeamModal
          onClose={() => setShowJoinModal(false)}
          currentUser={currentUser}
        />
      )}

      {selectedTeam && (
        <TeamDetailsModal
          team={selectedTeam}
          currentUser={currentUser}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </div>
  )
}