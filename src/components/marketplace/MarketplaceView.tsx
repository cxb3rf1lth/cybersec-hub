import { useState } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { Search, Filter, Star, Clock, DollarSign, Users, Award, TrendingUp } from '@/lib/phosphor-icons-wrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MarketplaceListing, MarketplaceFilters } from '@/types/marketplace'
import { Team } from '@/types/teams'
import { User } from '@/types/user'
import { MarketplaceListingCard } from './MarketplaceListingCard'
import { MarketplaceStats } from './MarketplaceStats'
import { MarketplaceFilters as FiltersPanel } from './MarketplaceFilters'

interface MarketplaceViewProps {
  currentUser: User
  onTabChange: (tab: string) => void
}

export function MarketplaceView({ currentUser, onTabChange }: MarketplaceViewProps) {
  const [listings] = useKVWithFallback<MarketplaceListing[]>('marketplaceListings', [])
  const [teams] = useKVWithFallback<Team[]>('teams', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<MarketplaceFilters>({})
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'recent' | 'popular'>('rating')
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort listings
  const filteredListings = (listings ?? [])
    .filter(listing => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          listing.title.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query) ||
          listing.skills.some(skill => skill.toLowerCase().includes(query))
        if (!matchesSearch) return false
      }

      // Category filter
      if (filters.category && filters.category.length > 0) {
        if (!filters.category.includes(listing.category)) return false
      }

      // Skills filter
      if (filters.skills && filters.skills.length > 0) {
        const hasSkill = filters.skills.some(skill => 
          listing.skills.some(listingSkill => 
            listingSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
        if (!hasSkill) return false
      }

      // Price range filter
      if (filters.priceRange) {
        if (listing.priceRange.min > filters.priceRange.max || 
            listing.priceRange.max < filters.priceRange.min) {
          return false
        }
      }

      // Rating filter
      if (filters.rating && listing.rating < filters.rating) {
        return false
      }

      // Availability filter
      if (filters.availability && filters.availability.length > 0) {
        if (!filters.availability.includes(listing.availability)) return false
      }

      return listing.status === 'active'
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'price':
          return a.priceRange.min - b.priceRange.min
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'popular':
          return b.reviewCount - a.reviewCount
        default:
          return 0
      }
    })

  const featuredListings = (listings ?? []).filter(listing => listing.featured && listing.status === 'active')

  const categories = [
    { value: 'penetration-testing', label: 'Penetration Testing' },
    { value: 'bug-bounty', label: 'Bug Bounty' },
    { value: 'red-team', label: 'Red Team' },
    { value: 'blue-team', label: 'Blue Team' },
    { value: 'security-audit', label: 'Security Audit' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'training', label: 'Training' },
    { value: 'other', label: 'Other' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
          <p className="text-muted-foreground">
            Find expert cybersecurity teams for your projects
          </p>
        </div>
        <Button className="gap-2">
          <TrendingUp className="w-4 h-4" />
          List Your Team
        </Button>
      </div>

      {/* Stats */}
      <MarketplaceStats />

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search teams, skills, or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price">Lowest Price</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <FiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories}
          />
        )}
      </div>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Featured Teams</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredListings.slice(0, 4).map(listing => {
              const team = (teams ?? []).find(t => t.id === listing.teamId)
              return (
                <MarketplaceListingCard
                  key={listing.id}
                  listing={listing}
                  team={team}
                  featured={true}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* All Listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            All Teams ({filteredListings.length})
          </h2>
        </div>

        {filteredListings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">No teams found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredListings.map(listing => {
              const team = (teams ?? []).find(t => t.id === listing.teamId)
              return (
                <MarketplaceListingCard
                  key={listing.id}
                  listing={listing}
                  team={team}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}