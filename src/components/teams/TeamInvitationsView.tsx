import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TeamInvitation, User, Team, TeamRole, TeamMember } from '@/types';
import { 
  Check, 
  X, 
  Clock, 
  Mail,
  Calendar,
  Users,
  AlertTriangle
} from '@/lib/phosphor-icons-wrapper';
import { toast } from 'sonner';

interface InvitationCardProps {
  invitation: TeamInvitation
  currentUser: User
  onResponseSent: () => void
}

export function InvitationCard({ invitation, currentUser, onResponseSent }: InvitationCardProps) {
  const [teams, setTeams] = useKVWithFallback<Team[]>('teams', []);
  const [teamRoles] = useKVWithFallback<TeamRole[]>('teamRoles', []);
  const [invitations, setInvitations] = useKVWithFallback<TeamInvitation[]>('teamInvitations', []);
  const [isLoading, setIsLoading] = useState(false);

  const team = teams.find(t => t.id === invitation.teamId);
  const role = teamRoles.find(r => r.id === invitation.role);
  const isExpired = new Date(invitation.expiresAt) <= new Date();

  const handleAcceptInvitation = async () => {
    if (!team || !role) {
      toast.error('Invalid invitation data');
      return;
    }

    if (team.members.length >= team.maxMembers) {
      toast.error('Team is at maximum capacity');
      return;
    }

    setIsLoading(true);

    try {
      // Create new team member
      const newMember: TeamMember = {
        id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
        role: role,
        permissions: role.permissions,
        earningsPercentage: role.defaultEarningsPercentage,
        joinedAt: new Date().toISOString(),
        status: 'active',
        specializations: currentUser.specializations,
        contribution: 0
      };

      // Update team with new member
      await setTeams(current => 
        current.map(t => 
          t.id === team.id 
            ? { ...t, members: [...t.members, newMember] }
            : t
        )
      );

      // Update invitation status
      await setInvitations(current =>
        current.map(inv =>
          inv.id === invitation.id
            ? {
                ...inv,
                status: 'accepted' as const,
                respondedAt: new Date().toISOString()
              }
            : inv
        )
      );

      toast.success(`Successfully joined ${team.name}!`);
      onResponseSent();
    } catch (error) {
      toast.error('Failed to accept invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineInvitation = async () => {
    setIsLoading(true);

    try {
      await setInvitations(current =>
        current.map(inv =>
          inv.id === invitation.id
            ? {
                ...inv,
                status: 'declined' as const,
                respondedAt: new Date().toISOString()
              }
            : inv
        )
      );

      toast.success('Invitation declined');
      onResponseSent();
    } catch (error) {
      toast.error('Failed to decline invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) {return 'Expired';}
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {return `Expires in ${days}d ${hours}h`;}
    if (hours > 0) {return `Expires in ${hours}h`;}
    return 'Expires soon';
  };

  if (!team || !role) {
    return null;
  }

  return (
    <Card className={`transition-all ${isExpired ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{team.name}</h3>
              <p className="text-sm text-muted-foreground">
                Team Invitation from @{invitation.inviterUsername}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <Badge 
              variant={isExpired ? 'destructive' : 'outline'}
              className="mb-1"
            >
              {isExpired ? 'Expired' : formatTimeRemaining(invitation.expiresAt)}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {new Date(invitation.sentAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Role Information */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline"
                style={{ borderColor: role.color, color: role.color }}
              >
                {role.name}
              </Badge>
              <span className="text-sm font-medium">{role.defaultEarningsPercentage}% earnings share</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {role.description}
            </p>
          </div>
        </div>

        {/* Team Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Type</span>
            <p className="font-medium capitalize">{team.type.replace('-', ' ')}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Members</span>
            <p className="font-medium">{team.members.length} / {team.maxMembers}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Rating</span>
            <p className="font-medium">{team.averageRating.toFixed(1)} ⭐</p>
          </div>
          <div>
            <span className="text-muted-foreground">Earnings</span>
            <p className="font-medium">${team.totalEarnings.toLocaleString()}</p>
          </div>
        </div>

        {/* Specializations */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Team Specializations</p>
          <div className="flex flex-wrap gap-1">
            {team.specialization.map(spec => (
              <Badge key={spec} variant="secondary" className="text-xs">
                {spec.replace('-', ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Personal Message */}
        {invitation.message && (
          <div className="p-3 bg-card border-l-4 border-l-primary">
            <p className="text-sm italic">"{invitation.message}"</p>
          </div>
        )}

        {/* Warnings */}
        {team.members.length >= team.maxMembers && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">
              Team is at maximum capacity. This invitation may no longer be valid.
            </p>
          </div>
        )}

        {/* Actions */}
        {!isExpired && invitation.status === 'pending' && (
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleAcceptInvitation}
              disabled={isLoading || team.members.length >= team.maxMembers}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              {isLoading ? 'Accepting...' : 'Accept'}
            </Button>
            <Button
              variant="outline"
              onClick={handleDeclineInvitation}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              {isLoading ? 'Declining...' : 'Decline'}
            </Button>
          </div>
        )}

        {isExpired && (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              This invitation has expired
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TeamInvitationsViewProps {
  currentUser: User
}

export function TeamInvitationsView({ currentUser }: TeamInvitationsViewProps) {
  const [invitations, setInvitations] = useKVWithFallback<TeamInvitation[]>('teamInvitations', []);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter invitations for current user
  const userInvitations = invitations.filter(inv => 
    inv.targetUserId === currentUser.id
  );

  const pendingInvitations = userInvitations.filter(inv => 
    inv.status === 'pending' && new Date(inv.expiresAt) > new Date()
  );

  const expiredInvitations = userInvitations.filter(inv => 
    inv.status === 'pending' && new Date(inv.expiresAt) <= new Date()
  );

  const handleResponseSent = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleClearExpired = async () => {
    try {
      await setInvitations(current =>
        current.filter(inv => 
          !(inv.targetUserId === currentUser.id && 
            inv.status === 'pending' && 
            new Date(inv.expiresAt) <= new Date())
        )
      );
      toast.success('Expired invitations cleared');
    } catch (error) {
      toast.error('Failed to clear expired invitations');
    }
  };

  if (userInvitations.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Team Invitations</h3>
        <p className="text-muted-foreground">
          When teams invite you to join, your invitations will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Invitations</h2>
          <p className="text-muted-foreground">
            {pendingInvitations.length} pending invitation{pendingInvitations.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {expiredInvitations.length > 0 && (
          <Button variant="outline" onClick={handleClearExpired}>
            Clear Expired ({expiredInvitations.length})
          </Button>
        )}
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Invitations
          </h3>
          <div className="grid gap-4">
            {pendingInvitations.map(invitation => (
              <InvitationCard
                key={`${invitation.id}-${refreshKey}`}
                invitation={invitation}
                currentUser={currentUser}
                onResponseSent={handleResponseSent}
              />
            ))}
          </div>
        </div>
      )}

      {/* Expired Invitations */}
      {expiredInvitations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="w-5 h-5" />
            Expired Invitations
          </h3>
          <div className="grid gap-4">
            {expiredInvitations.map(invitation => (
              <InvitationCard
                key={`${invitation.id}-${refreshKey}`}
                invitation={invitation}
                currentUser={currentUser}
                onResponseSent={handleResponseSent}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}