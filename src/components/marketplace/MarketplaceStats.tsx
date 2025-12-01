import { useKVWithFallback } from '@/lib/kv-fallback'
import { TrendingUp, Users, Star, CheckCircle } from '@/lib/phosphor-icons-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { MarketplaceListing } from '@/types/marketplace'
import { Team } from '@/types/teams'

export function MarketplaceStats() {
  const [listings] = useKVWithFallback<MarketplaceListing[]>('marketplaceListings', [])
  const [teams] = useKVWithFallback<Team[]>('teams', [])

  const activeListings = (listings ?? []).filter(listing => listing.status === 'active')
  const totalProjects = activeListings.reduce((sum, listing) => sum + listing.completedProjects, 0)
  const averageRating = activeListings.length > 0 
    ? activeListings.reduce((sum, listing) => sum + listing.rating, 0) / activeListings.length 
    : 0
  const activeTeams = new Set(activeListings.map(listing => listing.teamId)).size

  const stats = [
    {
      label: 'Active Teams',
      value: activeTeams.toLocaleString(),
      icon: Users,
      color: 'text-blue-400'
    },
    {
      label: 'Projects Completed',
      value: totalProjects.toLocaleString(),
      icon: CheckCircle,
      color: 'text-green-400'
    },
    {
      label: 'Average Rating',
      value: averageRating.toFixed(1),
      icon: Star,
      color: 'text-yellow-400'
    },
    {
      label: 'Service Categories',
      value: '8',
      icon: TrendingUp,
      color: 'text-purple-400'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-background/50 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}