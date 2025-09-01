import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Team, User } from '@/types'
import { 
  Users, 
  Shield, 
  Bug, 
  Eye, 
  Crosshair, 
  FileText, 
  Heart, 
  Book,
  TrendingUp,
  Star,
  Clock,
  MapPin
} from '@phosphor-icons/react'

interface TeamCardProps {
  team: Team
  currentUser: User
  showMemberRole?: boolean
  onClick?: () => void
}

const teamTypeIcons = {
  'red-team': Crosshair,
  'blue-team': Shield,
  'purple-team': Eye,
  'bug-bounty': Bug,
  'research': Book,
  'incident-response': Heart,
  'forensics': FileText,
  'compliance': FileText,
  'education': Book
}

const teamTypeColors = {
  'red-team': 'bg-destructive/10 text-destructive',
  'blue-team': 'bg-primary/10 text-primary',
  'purple-team': 'bg-accent/10 text-accent',
  'bug-bounty': 'bg-orange-500/10 text-orange-500',
  'research': 'bg-green-500/10 text-green-500',
  'incident-response': 'bg-red-500/10 text-red-500',
  'forensics': 'bg-purple-500/10 text-purple-500',
  'compliance': 'bg-blue-500/10 text-blue-500',
  'education': 'bg-emerald-500/10 text-emerald-500'
}

export function TeamCard({ team, currentUser, showMemberRole = false, onClick }: TeamCardProps) {
  const Icon = teamTypeIcons[team.type]
  const isMember = team.members.some(member => member.userId === currentUser.id)
  const memberRole = team.members.find(member => member.userId === currentUser.id)?.role.name
  const memberCount = team.members.length
  const maxMembers = team.maxMembers
  const fillPercentage = (memberCount / maxMembers) * 100

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${teamTypeColors[team.type]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{team.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">
                {team.type.replace('-', ' ')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {team.verified && (
              <Badge variant="secondary" className="text-xs">
                Verified
              </Badge>
            )}
            {isMember && (
              <Badge variant="default" className="text-xs">
                Member
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {team.description}
        </p>

        {showMemberRole && memberRole && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {memberRole}
            </Badge>
          </div>
        )}

        {/* Specializations */}
        <div className="flex flex-wrap gap-1">
          {team.specialization?.slice(0, 3).map(spec => (
            <Badge key={spec} variant="secondary" className="text-xs">
              {spec.replace('-', ' ')}
            </Badge>
          )) || []}
          {team.specialization && team.specialization.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{team.specialization.length - 3} more
            </Badge>
          )}
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">
              ${team.totalEarnings.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-muted-foreground">
              {team.averageRating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Members Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {memberCount}/{maxMembers} members
              </span>
            </div>
            <Badge 
              variant={team.status === 'recruiting' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {team.status}
            </Badge>
          </div>
          <Progress value={fillPercentage} className="h-2" />
        </div>

        {/* Member Avatars */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {team.members.slice(0, 4).map((member, index) => (
              <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                <AvatarImage src={member.avatar} />
                <AvatarFallback>
                  {member.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {team.members.length > 4 && (
              <div className="w-8 h-8 bg-muted border-2 border-background rounded-full flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  +{team.members.length - 4}
                </span>
              </div>
            )}
          </div>

          {team.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {team.location}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}