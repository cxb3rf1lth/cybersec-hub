import { useState } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendUp, 
  CalendarDots, 
  Users, 
  Target,
  ArrowRight,
  Timer,
  Star,
  ShieldCheck
} from '@phosphor-icons/react'
import { User } from '@/types/user'
import { Earning, EarningsGoal } from '@/types/earnings'
import { Team } from '@/types/teams'

interface EarningsOverviewProps {
  currentUser: User
}

export function EarningsOverview({ currentUser }: EarningsOverviewProps) {
  const [earnings] = useKVWithFallback<Earning[]>(`earnings-${currentUser.id}`, [])
  const [goals] = useKVWithFallback<EarningsGoal[]>(`goals-${currentUser.id}`, [])
  const [teams] = useKVWithFallback<Team[]>('teams', [])

  // Get recent earnings (last 5)
  const recentEarnings = [...earnings]
    .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
    .slice(0, 5)

  // Get active goals
  const activeGoals = goals.filter(goal => goal.status === 'active').slice(0, 3)

  // Get user's teams
  const userTeams = teams.filter(team => 
    team.members.some(member => member.userId === currentUser.id)
  ).slice(0, 4)

  // Calculate earnings by type for this month
  const thisMonth = new Date()
  const thisMonthEarnings = earnings.filter(e => {
    const earnedDate = new Date(e.earnedAt)
    return earnedDate.getMonth() === thisMonth.getMonth() && 
           earnedDate.getFullYear() === thisMonth.getFullYear()
  })

  const earningsByType = thisMonthEarnings.reduce((acc, earning) => {
    acc[earning.type] = (acc[earning.type] || 0) + earning.amount
    return acc
  }, {} as Record<string, number>)

  const topEarningTypes = Object.entries(earningsByType)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-accent text-accent-foreground'
      case 'pending': return 'bg-secondary text-secondary-foreground'
      case 'processing': return 'bg-primary text-primary-foreground'
      case 'failed': return 'bg-destructive text-destructive-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const formatEarningType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="space-y-6">
      {/* Top Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* This Month's Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendUp className="h-5 w-5 text-primary" />
              Top Categories This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topEarningTypes.length > 0 ? (
              topEarningTypes.map(([type, amount], index) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-accent' : 
                      index === 1 ? 'bg-primary' : 'bg-secondary'
                    }`} />
                    <span className="text-sm font-medium">{formatEarningType(type)}</span>
                  </div>
                  <span className="text-sm font-semibold">${amount.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No earnings this month yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Active Goals Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeGoals.length > 0 ? (
              activeGoals.map(goal => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{goal.title}</span>
                      <span className="text-xs text-muted-foreground">
                        ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active goals set
              </p>
            )}
          </CardContent>
        </Card>

        {/* Team Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userTeams.length > 0 ? (
              userTeams.map(team => (
                <div key={team.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{team.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {team.members.length} members
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${team.totalEarnings.toLocaleString()}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-accent" />
                      <span className="text-xs text-muted-foreground">
                        {team.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No teams joined yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Earnings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDots className="h-5 w-5 text-primary" />
            Recent Earnings
          </CardTitle>
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {recentEarnings.length > 0 ? (
            <div className="space-y-4">
              {recentEarnings.map(earning => (
                <div key={earning.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Timer className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{earning.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatEarningType(earning.type)} • {earning.teamName || 'Individual'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(earning.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">${earning.amount.toLocaleString()}</p>
                    <Badge className={getStatusColor(earning.status)}>
                      {earning.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No earnings recorded yet</p>
              <p className="text-sm text-muted-foreground">
                Start working on projects to see your earnings here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}