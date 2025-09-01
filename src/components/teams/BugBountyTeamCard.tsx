import { Star, Trophy, DollarSign, Users, Target, TrendUp } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Team, User } from '@/types'

interface BugBountyTeamCardProps {
  team: Team
  allUsers: User[]
  showJoinButton?: boolean
}

export function BugBountyTeamCard({ team, allUsers, showJoinButton = false }: BugBountyTeamCardProps) {
  const teamMembers = team.members.map(member => 
    allUsers.find(user => user.id === member.userId)
  ).filter(Boolean) as User[]

  const averageReputation = teamMembers.length > 0 
    ? Math.round(teamMembers.reduce((sum, user) => sum + (user.reputation || 0), 0) / teamMembers.length)
    : 0

  const totalFindings = teamMembers.reduce((sum, user) => sum + (user.successfulFindings || 0), 0)

  return (
    <Card className="hover:bg-muted/50 transition-colors border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg truncate">{team.name}</CardTitle>
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                Bug Bounty Team
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {team.description}
            </p>
          </div>
          {showJoinButton && (
            <Button size="sm" className="ml-2">
              Join Team
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Team Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-muted-foreground">Total Earnings</span>
            </div>
            <p className="font-semibold text-green-400">
              ${(team.totalEarnings || 0).toLocaleString()}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-orange-400" />
              <span className="text-muted-foreground">Findings</span>
            </div>
            <p className="font-semibold text-orange-400">
              {totalFindings}
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-muted-foreground">
              {team.reputation} reputation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span className="text-muted-foreground">
              {team.successfulProjects} programs
            </span>
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {team.members.length} hunters
                {team.maxMembers && ` / ${team.maxMembers}`}
              </span>
            </div>
            {averageReputation > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <TrendUp className="w-3 h-3 text-blue-400" />
                <span className="text-blue-400">{averageReputation} avg</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {teamMembers.slice(0, 4).map((member) => (
                <Avatar key={member.id} className="w-6 h-6 border-2 border-background">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs">
                    {member.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {teamMembers.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    +{teamMembers.length - 4}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Specializations */}
        {team.requiredSkills.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Specializations:</p>
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

        {/* Earnings Distribution */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Distribution:</span>
            <span className="capitalize">{team.settings.earningsDistribution.replace('-', ' ')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}