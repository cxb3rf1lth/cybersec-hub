import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamInvitation, User, Team, TeamRole } from '@/types';
import { 
  Check, 
  X, 
  Clock, 
  Mail, 
  Users,
  Calendar,
  AlertCircle,
  CheckCircle
} from '@/lib/phosphor-icons-wrapper';
import { toast } from 'sonner';

interface InvitationManagerModalProps {
  team: Team
  currentUser: User
  onClose: () => void
}

export function InvitationManagerModal({ team, currentUser, onClose }: InvitationManagerModalProps) {
  const [invitations, setInvitations] = useKVWithFallback<TeamInvitation[]>('teamInvitations', []);
  const [teamRoles] = useKVWithFallback<TeamRole[]>('teamRoles', []);
  const [users] = useKVWithFallback<User[]>('users', []);
  const [activeTab, setActiveTab] = useState('pending');

  // Filter invitations for this team
  const teamInvitations = invitations.filter(inv => inv.teamId === team.id);
  
  const pendingInvitations = teamInvitations.filter(inv => 
    inv.status === 'pending' && new Date(inv.expiresAt) > new Date()
  );
  
  const expiredInvitations = teamInvitations.filter(inv => 
    inv.status === 'pending' && new Date(inv.expiresAt) <= new Date()
  );
  
  const completedInvitations = teamInvitations.filter(inv => 
    inv.status === 'accepted' || inv.status === 'declined'
  );

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await setInvitations(current => 
        current.filter(inv => inv.id !== invitationId)
      );
      toast.success('Invitation cancelled');
    } catch (error) {
      toast.error('Failed to cancel invitation');
    }
  };

  const handleResendInvitation = async (invitation: TeamInvitation) => {
    try {
      const newInvitation: TeamInvitation = {
        ...invitation,
        id: `invitation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sentAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      };

      await setInvitations(current => [
        ...current.filter(inv => inv.id !== invitation.id),
        newInvitation
      ]);
      
      toast.success('Invitation resent');
    } catch (error) {
      toast.error('Failed to resend invitation');
    }
  };

  const getRoleInfo = (roleId: string) => {
    return teamRoles.find(role => role.id === roleId);
  };

  const getUserInfo = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) {return 'Expired';}
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {return `${days}d ${hours}h remaining`;}
    return `${hours}h remaining`;
  };

  const InvitationCard = ({ invitation, showActions = true }: { invitation: TeamInvitation, showActions?: boolean }) => {
    const role = getRoleInfo(invitation.role);
    const targetUser = getUserInfo(invitation.targetUserId);
    const isExpired = new Date(invitation.expiresAt) <= new Date();

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={targetUser?.avatar} />
                <AvatarFallback>
                  {invitation.targetUsername.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">@{invitation.targetUsername}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline"
                    style={{ borderColor: role?.color, color: role?.color }}
                  >
                    {role?.name || invitation.role}
                  </Badge>
                  <Badge 
                    variant={
                      invitation.status === 'accepted' ? 'default' :
                      invitation.status === 'declined' ? 'destructive' :
                      isExpired ? 'secondary' : 'outline'
                    }
                  >
                    {isExpired && invitation.status === 'pending' ? 'Expired' : invitation.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-2">
                Sent {new Date(invitation.sentAt).toLocaleDateString()}
              </div>
              {invitation.status === 'pending' && !isExpired && (
                <div className="text-sm font-medium text-orange-500">
                  {formatTimeRemaining(invitation.expiresAt)}
                </div>
              )}
              {invitation.respondedAt && (
                <div className="text-sm text-muted-foreground">
                  Responded {new Date(invitation.respondedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {invitation.message && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground italic">
                "{invitation.message}"
              </p>
            </div>
          )}

          {showActions && invitation.status === 'pending' && (
            <div className="flex gap-2 mt-4">
              {isExpired ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResendInvitation(invitation)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Resend
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancelInvitation(invitation.id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Team Invitations - {team.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pendingInvitations.length + expiredInvitations.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed ({completedInvitations.length})
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Pending Invitations</h3>
              <Badge variant="outline">
                {pendingInvitations.length} active, {expiredInvitations.length} expired
              </Badge>
            </div>

            {pendingInvitations.length === 0 && expiredInvitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending invitations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active pending invitations */}
                {pendingInvitations.map(invitation => (
                  <InvitationCard key={invitation.id} invitation={invitation} />
                ))}
                
                {/* Expired invitations */}
                {expiredInvitations.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mt-6">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <h4 className="font-medium text-orange-500">Expired Invitations</h4>
                    </div>
                    {expiredInvitations.map(invitation => (
                      <InvitationCard key={invitation.id} invitation={invitation} />
                    ))}
                  </>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Completed Invitations</h3>
              <div className="flex gap-2">
                <Badge variant="default">
                  {completedInvitations.filter(i => i.status === 'accepted').length} accepted
                </Badge>
                <Badge variant="destructive">
                  {completedInvitations.filter(i => i.status === 'declined').length} declined
                </Badge>
              </div>
            </div>

            {completedInvitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No completed invitations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedInvitations
                  .sort((a, b) => new Date(b.respondedAt || b.sentAt).getTime() - new Date(a.respondedAt || a.sentAt).getTime())
                  .map(invitation => (
                    <InvitationCard key={invitation.id} invitation={invitation} showActions={false} />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Mail className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{teamInvitations.length}</div>
                  <div className="text-sm text-muted-foreground">Total Sent</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{pendingInvitations.length}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {completedInvitations.filter(i => i.status === 'accepted').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Accepted</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <X className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {completedInvitations.filter(i => i.status === 'declined').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Declined</div>
                </CardContent>
              </Card>
            </div>

            {/* Acceptance Rate */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Invitation Statistics</h3>
              </CardHeader>
              <CardContent>
                {completedInvitations.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Acceptance Rate</span>
                        <span className="font-medium">
                          {Math.round((completedInvitations.filter(i => i.status === 'accepted').length / completedInvitations.length) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ 
                            width: `${(completedInvitations.filter(i => i.status === 'accepted').length / completedInvitations.length) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Average Response Time</span>
                        <p className="font-medium">
                          {Math.round(
                            completedInvitations
                              .filter(i => i.respondedAt)
                              .reduce((acc, inv) => {
                                const sent = new Date(inv.sentAt).getTime();
                                const responded = new Date(inv.respondedAt!).getTime();
                                return acc + (responded - sent);
                              }, 0) / (completedInvitations.filter(i => i.respondedAt).length * 24 * 60 * 60 * 1000)
                          )} days
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Most Requested Role</span>
                        <p className="font-medium">
                          {(() => {
                            const roleCounts = teamInvitations.reduce((acc, inv) => {
                              acc[inv.role] = (acc[inv.role] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>);
                            const mostRequested = Object.entries(roleCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);
                            const role = getRoleInfo(mostRequested[0]);
                            return role?.name || 'N/A';
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No completed invitations to analyze yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}