import { useState } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { CheckCircle, X, Eye, DollarSign, Calendar, Clock, Filter } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { MarketplaceProposal } from '@/types/marketplace'
import { User } from '@/types/user'
import { Team } from '@/types/teams'

interface ProposalManagementViewProps {
  currentUser: User
  userTeams: Team[]
}

export function ProposalManagementView({ currentUser, userTeams }: ProposalManagementViewProps) {
  const [proposals, setProposals] = useKVWithFallback<MarketplaceProposal[]>('marketplaceProposals', [])
  const [allUsers] = useKVWithFallback<User[]>('allUsers', [])
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'in-progress' | 'completed'>('all')
  const [selectedProposal, setSelectedProposal] = useState<MarketplaceProposal | null>(null)
  const [response, setResponse] = useState('')

  // Get team IDs where current user is a member
  const teamIds = userTeams
    .filter(team => team.members.some(member => member.userId === currentUser.id))
    .map(team => team.id)

  // Filter proposals for user's teams
  const teamProposals = proposals.filter(proposal => teamIds.includes(proposal.teamId))

  const filteredProposals = teamProposals.filter(proposal => {
    if (statusFilter === 'all') return true
    return proposal.status === statusFilter
  })

  const handleUpdateProposalStatus = (
    proposalId: string, 
    newStatus: 'accepted' | 'rejected' | 'in-progress' | 'completed',
    responseMessage?: string
  ) => {
    setProposals(current => 
      current.map(proposal => 
        proposal.id === proposalId 
          ? { 
              ...proposal, 
              status: newStatus, 
              updatedAt: new Date().toISOString() 
            }
          : proposal
      )
    )

    const statusMessages = {
      accepted: 'Proposal accepted successfully!',
      rejected: 'Proposal rejected',
      'in-progress': 'Project marked as in progress',
      completed: 'Project marked as completed'
    }

    toast.success(statusMessages[newStatus])
    setSelectedProposal(null)
    setResponse('')
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      accepted: 'bg-green-500/10 text-green-400 border-green-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
      'in-progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      completed: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const getClient = (clientId: string) => {
    return allUsers.find(user => user.id === clientId)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const proposalCounts = {
    all: teamProposals.length,
    pending: teamProposals.filter(p => p.status === 'pending').length,
    accepted: teamProposals.filter(p => p.status === 'accepted').length,
    'in-progress': teamProposals.filter(p => p.status === 'in-progress').length,
    completed: teamProposals.filter(p => p.status === 'completed').length
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proposal Management</h1>
          <p className="text-muted-foreground">
            Manage incoming project proposals for your teams
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by status:</span>
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({proposalCounts.all})</SelectItem>
            <SelectItem value="pending">Pending ({proposalCounts.pending})</SelectItem>
            <SelectItem value="accepted">Accepted ({proposalCounts.accepted})</SelectItem>
            <SelectItem value="in-progress">In Progress ({proposalCounts['in-progress']})</SelectItem>
            <SelectItem value="completed">Completed ({proposalCounts.completed})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">No proposals found</h3>
              <p className="text-muted-foreground">
                {statusFilter === 'all' 
                  ? 'No proposals have been submitted to your teams yet'
                  : `No ${statusFilter} proposals found`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map(proposal => {
            const client = getClient(proposal.clientId)
            const team = userTeams.find(t => t.id === proposal.teamId)
            
            return (
              <Card key={proposal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{proposal.projectTitle}</CardTitle>
                        <Badge className={getStatusColor(proposal.status)}>
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(proposal.budget.amount, proposal.budget.currency)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {proposal.timeline}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(proposal.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Client Info */}
                  {client && (
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={client.avatar} />
                        <AvatarFallback>{client.username[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{client.username}</p>
                        <p className="text-sm text-muted-foreground">{client.specializations[0]}</p>
                      </div>
                    </div>
                  )}

                  {/* Team Info */}
                  {team && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">For team: </span>
                      <span className="font-medium text-foreground">{team.name}</span>
                    </div>
                  )}

                  {/* Project Description */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Project Description</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {proposal.projectDescription}
                    </p>
                  </div>

                  {/* Requirements */}
                  {proposal.requirements.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Requirements</p>
                      <div className="flex flex-wrap gap-1">
                        {proposal.requirements.slice(0, 3).map((req, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                        {proposal.requirements.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{proposal.requirements.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProposal(proposal)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    
                    {proposal.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateProposalStatus(proposal.id, 'accepted')}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleUpdateProposalStatus(proposal.id, 'rejected')}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {proposal.status === 'accepted' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateProposalStatus(proposal.id, 'in-progress')}
                      >
                        Start Project
                      </Button>
                    )}
                    
                    {proposal.status === 'in-progress' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateProposalStatus(proposal.id, 'completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <Dialog open={!!selectedProposal} onOpenChange={() => setSelectedProposal(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProposal.projectTitle}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Budget: </span>
                  <span className="font-medium">
                    {formatCurrency(selectedProposal.budget.amount, selectedProposal.budget.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Timeline: </span>
                  <span className="font-medium">{selectedProposal.timeline}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status: </span>
                  <Badge className={getStatusColor(selectedProposal.status)}>
                    {selectedProposal.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted: </span>
                  <span className="font-medium">
                    {new Date(selectedProposal.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Project Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedProposal.projectDescription}
                </p>
              </div>

              {selectedProposal.requirements.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <ul className="space-y-1">
                    {selectedProposal.requirements.map((req, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <span className="mr-2">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedProposal(null)}>
                  Close
                </Button>
                {selectedProposal.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleUpdateProposalStatus(selectedProposal.id, 'accepted')}
                    >
                      Accept Proposal
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleUpdateProposalStatus(selectedProposal.id, 'rejected')}
                    >
                      Reject Proposal
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}