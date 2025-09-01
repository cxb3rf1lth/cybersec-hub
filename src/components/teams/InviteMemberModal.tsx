import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Team, User, TeamInvitation, TeamRole } from '@/types'
import { Search, UserPlus, Send } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface InviteMemberModalProps {
  team: Team
  currentUser: User
  onClose: () => void
  onInvitationSent: () => void
}

export function InviteMemberModal({ team, currentUser, onClose, onInvitationSent }: InviteMemberModalProps) {
  const [users] = useKV<User[]>('users', [])
  const [teamRoles] = useKV<TeamRole[]>('teamRoles', [])
  const [invitations, setInvitations] = useKV<TeamInvitation[]>('teamInvitations', [])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Filter available users (exclude current team members and users with pending invitations)
  const teamMemberIds = team.members.map(m => m.userId)
  const pendingInviteUserIds = invitations
    .filter(inv => inv.teamId === team.id && inv.status === 'pending')
    .map(inv => inv.targetUserId)

  const availableUsers = users.filter(user => 
    !teamMemberIds.includes(user.id) && 
    !pendingInviteUserIds.includes(user.id) &&
    user.id !== currentUser.id &&
    (searchQuery === '' || 
     user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.specializations.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  )

  // Get roles that can be assigned based on current user's permissions
  const currentMember = team.members.find(m => m.userId === currentUser.id)
  const canAssignAllRoles = currentMember?.permissions.includes('manage-roles') || team.leaderId === currentUser.id
  
  const assignableRoles = teamRoles.filter(role => {
    if (canAssignAllRoles) return true
    // Non-managers can only invite to junior roles
    return role.priority <= 40
  })

  const handleSendInvitation = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error('Please select a user and role')
      return
    }

    const selectedRoleData = teamRoles.find(r => r.id === selectedRole)
    if (!selectedRoleData) {
      toast.error('Invalid role selected')
      return
    }

    // Check team capacity
    if (team.members.length >= team.maxMembers) {
      toast.error('Team is at maximum capacity')
      return
    }

    setIsLoading(true)

    try {
      const newInvitation: TeamInvitation = {
        id: `invitation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        teamId: team.id,
        teamName: team.name,
        inviterId: currentUser.id,
        inviterUsername: currentUser.username,
        targetUserId: selectedUser.id,
        targetUsername: selectedUser.username,
        role: selectedRole,
        message: message || `Join our ${team.type.replace('-', ' ')} team!`,
        status: 'pending',
        sentAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }

      await setInvitations(current => [...current, newInvitation])
      
      toast.success(`Invitation sent to ${selectedUser.username}`)
      onInvitationSent()
      onClose()
    } catch (error) {
      toast.error('Failed to send invitation')
    } finally {
      setIsLoading(false)
    }
  }

  const defaultMessage = selectedUser && selectedRole 
    ? `Hi ${selectedUser.username}! We'd love to have you join ${team.name} as a ${teamRoles.find(r => r.id === selectedRole)?.name}. Your expertise would be a great addition to our team!`
    : ''

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Member to {team.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Search */}
          <div className="space-y-3">
            <Label>Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by username, name, or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {searchQuery && (
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                {availableUsers.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No users found matching your search
                  </div>
                ) : (
                  <div className="divide-y">
                    {availableUsers.slice(0, 10).map(user => (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedUser?.id === user.id ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{user.displayName || user.username}</p>
                              <span className="text-sm text-muted-foreground">@{user.username}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {user.specializations.slice(0, 3).map(spec => (
                                <Badge key={spec} variant="outline" className="text-xs">
                                  {spec.replace('-', ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected User */}
          {selectedUser && (
            <div className="p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback>
                    {selectedUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium">{selectedUser.displayName || selectedUser.username}</h4>
                  <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedUser.specializations.map(spec => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}

          {/* Role Selection */}
          {selectedUser && (
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role for this member" />
                </SelectTrigger>
                <SelectContent>
                  {assignableRoles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{role.name}</span>
                        <Badge 
                          variant="outline" 
                          className="ml-2"
                          style={{ borderColor: role.color, color: role.color }}
                        >
                          {role.defaultEarningsPercentage}%
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRole && (
                <div className="text-sm text-muted-foreground">
                  {teamRoles.find(r => r.id === selectedRole)?.description}
                </div>
              )}
            </div>
          )}

          {/* Personal Message */}
          {selectedUser && selectedRole && (
            <div className="space-y-2">
              <Label>Personal Message</Label>
              <Textarea
                placeholder={defaultMessage}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                A personal message helps increase acceptance rates
              </p>
            </div>
          )}

          {/* Team Info */}
          <div className="p-4 border rounded-lg bg-card">
            <h4 className="font-medium mb-2">Team Capacity</h4>
            <div className="flex items-center justify-between text-sm">
              <span>Current Members</span>
              <span className="font-medium">
                {team.members.length} / {team.maxMembers}
              </span>
            </div>
            {team.members.length >= team.maxMembers && (
              <p className="text-sm text-destructive mt-2">
                Team is at maximum capacity. Consider expanding or removing inactive members.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSendInvitation}
            disabled={!selectedUser || !selectedRole || isLoading || team.members.length >= team.maxMembers}
          >
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}