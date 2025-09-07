import { useState } from 'react';
import { Star, Clock, DollarSign, Users, Award, CheckCircle } from '@/lib/phosphor-icons-wrapper';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MarketplaceListing } from '@/types/marketplace';
import type { Team } from '@/types/teams';
import { CreateProposalModal } from './CreateProposalModal';
import { User } from '@/types/user';
import { useKVWithFallback } from '@/lib/kv-fallback';

interface MarketplaceListingCardProps {
  listing: MarketplaceListing
  team?: Team
  featured?: boolean
}

export function MarketplaceListingCard({ listing, team, featured = false }: MarketplaceListingCardProps) {
  const [currentUser] = useKVWithFallback<User>('currentUser', undefined);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const getCategoryColor = (category: string) => {
    const colors = {
      'penetration-testing': 'bg-red-500/10 text-red-400 border-red-500/20',
      'bug-bounty': 'bg-green-500/10 text-green-400 border-green-500/20',
      'red-team': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      'blue-team': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'security-audit': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'consultation': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      'training': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'other': 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getAvailabilityColor = (availability: string) => {
    const colors = {
      'immediate': 'text-green-400',
      'within-week': 'text-yellow-400',
      'within-month': 'text-orange-400',
      'future': 'text-gray-400'
    };
    return colors[availability as keyof typeof colors] || colors.future;
  };

  const formatPrice = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${featured ? 'ring-2 ring-accent/20' : ''}`}>
      {featured && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-accent text-accent-foreground">
            Featured
          </Badge>
        </div>
      )}
      
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge className={getCategoryColor(listing.category)}>
                {listing.category.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Badge>
              {listing.rating >= 4.8 && (
                <Badge variant="outline" className="gap-1">
                  <Award className="w-3 h-3" />
                  Top Rated
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground line-clamp-2">
              {listing.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Team Info */}
        {team && (
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={team?.members?.[0]?.avatar ?? ''} />
              <AvatarFallback>{team.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{team.name}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {team.members.length} members
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {listing.rating} ({listing.reviewCount})
                </div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {listing.skills.slice(0, 5).map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {listing.skills.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{listing.skills.length - 5} more
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>Price Range</span>
            </div>
            <p className="font-semibold text-foreground">
              {formatPrice(listing.priceRange.min, listing.priceRange.max, listing.priceRange.currency)}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Timeline</span>
            </div>
            <p className="font-semibold text-foreground">{listing.duration}</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-muted-foreground">
              {listing.completedProjects} projects completed
            </span>
          </div>
          <div className={`font-medium ${getAvailabilityColor(listing.availability)}`}>
            Available: {listing.availability.replace('-', ' ')}
          </div>
        </div>

        {/* Response Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Responds in {listing.responseTime}</span>
        </div>

        {/* Certifications */}
        {listing.certifications.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Certifications</p>
            <div className="flex flex-wrap gap-1">
              {listing.certifications.slice(0, 4).map((cert, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {cert}
                </Badge>
              ))}
              {listing.certifications.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{listing.certifications.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1"
            onClick={() => setShowProposalModal(true)}
          >
            Contact Team
          </Button>
          <Button variant="outline">
            View Profile
          </Button>
        </div>
      </CardContent>
      
      {/* Proposal Modal */}
      {currentUser && (
        <CreateProposalModal
          listing={listing}
          team={team}
          currentUser={currentUser}
          isOpen={showProposalModal}
          onClose={() => setShowProposalModal(false)}
        />
      )}
    </Card>
  );
}