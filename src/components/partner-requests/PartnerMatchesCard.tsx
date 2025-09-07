import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PartnerMatch, User } from '@/types';
import { Star, Target, ArrowRight, TrendUp } from '@/lib/phosphor-icons-wrapper';

interface PartnerMatchesCardProps {
  matches: PartnerMatch[]
  currentUser: User
  onViewRequest: (requestId: string) => void
}

export function PartnerMatchesCard({ matches, currentUser, onViewRequest }: PartnerMatchesCardProps) {
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) {return 'text-green-400';}
    if (score >= 60) {return 'text-yellow-400';}
    if (score >= 40) {return 'text-orange-400';}
    return 'text-red-400';
  };

  const getMatchScoreBackground = (score: number) => {
    if (score >= 80) {return 'bg-green-500/20';}
    if (score >= 60) {return 'bg-yellow-500/20';}
    if (score >= 40) {return 'bg-orange-500/20';}
    return 'bg-red-500/20';
  };

  if (matches.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-lg font-semibold mb-2">No Matches Found</h3>
        <p className="text-muted-foreground mb-4">
          We'll find partner requests that match your skills as they become available.
        </p>
        <div className="text-sm text-muted-foreground">
          <p>Your skills: {currentUser.skills?.join(', ') || 'None specified'}</p>
          <p className="mt-2">
            Update your profile skills to get better match recommendations
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Smart Matches for You</h3>
        <Badge variant="secondary">{matches.length} found</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {matches.map(match => (
          <Card key={match.id} className="hover-border-flow transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={match.partnerAvatar} />
                    <AvatarFallback>{match.partnerName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{match.partnerName}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Partner Request
                    </div>
                  </div>
                </div>
                <div className={`text-center p-2 rounded-lg ${getMatchScoreBackground(match.matchScore)}`}>
                  <div className={`text-lg font-bold ${getMatchScoreColor(match.matchScore)}`}>
                    {match.matchScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">match</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Match Score</span>
                </div>
                <Progress 
                  value={match.matchScore} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Why you're a good match:
                </h4>
                <ul className="space-y-1">
                  {match.compatibilityReasons.map((reason, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={() => onViewRequest(match.requestId)}
                  className="w-full hover-red-glow"
                  size="sm"
                >
                  View Request
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Suggested {new Date(match.suggestedAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/20 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold mb-2">Improve Your Matches</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Get better match recommendations by:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Adding more skills to your profile</li>
                <li>• Participating in projects to build your reputation</li>
                <li>• Creating your own partner requests</li>
                <li>• Staying active in the community</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}