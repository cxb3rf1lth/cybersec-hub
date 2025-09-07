import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Team, User, TeamContract, EarningsDistribution } from '@/types';
import { useSampleTeamData } from '@/hooks/useSampleTeamData';
import { 
  DollarSign, 
  Plus, 
  Users, 
  TrendingUp, 
  Calendar,
  Eye,
  Settings,
  Download
} from '@/lib/phosphor-icons-wrapper';
import { toast } from 'sonner';

interface EarningsManagementModalProps {
  team: Team
  currentUser: User
  onClose: () => void
}

export function EarningsManagementModal({ team, currentUser, onClose }: EarningsManagementModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [contracts] = useKVWithFallback<TeamContract[]>('teamContracts', []);
  const [distributions] = useKVWithFallback<EarningsDistribution[]>('earningsDistributions', []);
  const [newContract, setNewContract] = useState({
    title: '',
    description: '',
    client: '',
    type: 'bug-bounty' as TeamContract['type'],
    budget: 0,
    deadline: '',
    assignedMembers: [] as string[]
  });
  const [showCreateContract, setShowCreateContract] = useState(false);

  const teamContracts = contracts.filter(contract => contract.teamId === team.id);
  const teamDistributions = distributions.filter(dist => dist.teamId === team.id);
  
  const activeContracts = teamContracts.filter(c => c.status === 'active');
  const completedContracts = teamContracts.filter(c => c.status === 'completed');
  
  const totalPending = teamDistributions
    .filter(d => d.distributions.some(dist => dist.status === 'pending'))
    .reduce((sum, d) => sum + d.amount, 0);

  const handleCreateContract = () => {
    if (!newContract.title.trim() || !newContract.client.trim() || newContract.budget <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const contract: TeamContract = {
      id: `contract-${Date.now()}`,
      teamId: team.id,
      title: newContract.title,
      description: newContract.description,
      client: newContract.client,
      type: newContract.type,
      budget: newContract.budget,
      deadline: newContract.deadline,
      status: 'active',
      progress: 0,
      assignedMembers: newContract.assignedMembers,
      earningsDistribution: team.members.map(member => ({
        memberId: member.id,
        percentage: member.earningsPercentage,
        amount: (newContract.budget * member.earningsPercentage) / 100,
        role: member.role.name
      })),
      createdAt: new Date().toISOString()
    };

    // TODO: Save contract
    toast.success('Contract created successfully');
    setShowCreateContract(false);
    setNewContract({
      title: '',
      description: '',
      client: '',
      type: 'bug-bounty',
      budget: 0,
      deadline: '',
      assignedMembers: []
    });
  };

  const handleDistributeEarnings = (contractId: string) => {
    const contract = teamContracts.find(c => c.id === contractId);
    if (!contract) {return;}

    const distribution: EarningsDistribution = {
      id: `dist-${Date.now()}`,
      teamId: team.id,
      contractId: contract.id,
      amount: contract.budget,
      currency: 'USD',
      distributionMethod: 'role-based',
      distributions: contract.earningsDistribution.map(dist => ({
        memberId: dist.memberId,
        username: team.members.find(m => m.id === dist.memberId)?.username || '',
        role: dist.role,
        percentage: dist.percentage,
        amount: dist.amount,
        contribution: team.members.find(m => m.id === dist.memberId)?.contribution || 0,
        status: 'pending'
      })),
      createdAt: new Date().toISOString()
    };

    // TODO: Save distribution
    toast.success('Earnings distribution initiated');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Earnings Management - {team.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="distributions">Distributions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-accent mx-auto mb-2" />
                  <div className="text-2xl font-bold">${team.totalEarnings.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Earned</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">${totalPending.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Pending Payment</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{activeContracts.length}</div>
                  <div className="text-sm text-muted-foreground">Active Contracts</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{team.members.length}</div>
                  <div className="text-sm text-muted-foreground">Team Members</div>
                </CardContent>
              </Card>
            </div>

            {/* Current Earnings Distribution */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Current Earnings Distribution</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {team.members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.username}</p>
                          <p className="text-sm text-muted-foreground">{member.role.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{member.earningsPercentage}%</p>
                          <p className="text-sm text-muted-foreground">Share</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${((team.totalEarnings * member.earningsPercentage) / 100).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">Total Earned</p>
                        </div>
                        <Badge variant="outline">{member.contribution} Score</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Recent Activity</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamDistributions.slice(0, 5).map(distribution => (
                    <div key={distribution.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">${distribution.amount.toLocaleString()} Distribution</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(distribution.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={distribution.distributions.every(d => d.status === 'paid') ? 'default' : 'secondary'}
                      >
                        {distribution.distributions.every(d => d.status === 'paid') ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                  {teamDistributions.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No earnings distributions yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Team Contracts</h3>
              <Button onClick={() => setShowCreateContract(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Contract
              </Button>
            </div>

            {/* Active Contracts */}
            {activeContracts.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-green-600">Active Contracts</h4>
                {activeContracts.map(contract => (
                  <Card key={contract.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{contract.title}</h5>
                          <p className="text-sm text-muted-foreground">{contract.client}</p>
                          <p className="text-sm text-muted-foreground mt-1">{contract.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            ${contract.budget.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(contract.deadline).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" onClick={() => handleDistributeEarnings(contract.id)}>
                              <DollarSign className="w-4 h-4 mr-1" />
                              Distribute
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Completed Contracts */}
            {completedContracts.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground">Completed Contracts</h4>
                {completedContracts.map(contract => (
                  <Card key={contract.id} className="opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{contract.title}</h5>
                          <p className="text-sm text-muted-foreground">{contract.client}</p>
                          <Badge variant="secondary" className="mt-1">Completed</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            ${contract.budget.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Completed: {contract.completedAt ? new Date(contract.completedAt).toLocaleDateString() : 'N/A'}
                          </p>
                          {contract.rating && (
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-yellow-500">★</span>
                              <span className="text-sm">{contract.rating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {teamContracts.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No contracts yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first contract to start earning with your team.
                  </p>
                  <Button onClick={() => setShowCreateContract(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Contract
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Create Contract Modal */}
            {showCreateContract && (
              <Dialog open onOpenChange={setShowCreateContract}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Contract</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Contract Title *</label>
                      <Input
                        value={newContract.title}
                        onChange={(e) => setNewContract(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter contract title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Client *</label>
                      <Input
                        value={newContract.client}
                        onChange={(e) => setNewContract(prev => ({ ...prev, client: e.target.value }))}
                        placeholder="Client name or organization"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={newContract.description}
                        onChange={(e) => setNewContract(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the contract scope and requirements"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <Select value={newContract.type} onValueChange={(value: any) => 
                          setNewContract(prev => ({ ...prev, type: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bug-bounty">Bug Bounty</SelectItem>
                            <SelectItem value="penetration-test">Penetration Test</SelectItem>
                            <SelectItem value="security-audit">Security Audit</SelectItem>
                            <SelectItem value="incident-response">Incident Response</SelectItem>
                            <SelectItem value="training">Training</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Budget (USD) *</label>
                        <Input
                          type="number"
                          value={newContract.budget}
                          onChange={(e) => setNewContract(prev => ({ ...prev, budget: Number(e.target.value) }))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Deadline</label>
                      <Input
                        type="date"
                        value={newContract.deadline}
                        onChange={(e) => setNewContract(prev => ({ ...prev, deadline: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCreateContract(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateContract} className="flex-1">
                        Create Contract
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          <TabsContent value="distributions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Earnings Distributions</h3>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            <div className="space-y-4">
              {teamDistributions.map(distribution => (
                <Card key={distribution.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h5 className="font-medium">
                          ${distribution.amount.toLocaleString()} Distribution
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          {new Date(distribution.createdAt).toLocaleDateString()} - 
                          {distribution.distributionMethod.replace('-', ' ')} method
                        </p>
                      </div>
                      <Badge 
                        variant={distribution.distributions.every(d => d.status === 'paid') ? 'default' : 'secondary'}
                      >
                        {distribution.distributions.every(d => d.status === 'paid') ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {distribution.distributions.map((dist, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{dist.username}</span>
                            <span className="text-sm text-muted-foreground">({dist.role})</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span>{dist.percentage}%</span>
                            <span className="font-medium">${dist.amount.toLocaleString()}</span>
                            <Badge 
                              variant={dist.status === 'paid' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {dist.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {teamDistributions.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No distributions yet
                    </h3>
                    <p className="text-muted-foreground">
                      Earnings distributions will appear here once contracts are completed.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Earnings Distribution Settings</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Configure how earnings are distributed among team members.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Distribution Method</label>
                    <Select defaultValue="role-based">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="role-based">Role-based percentages</SelectItem>
                        <SelectItem value="contribution-based">Contribution-based</SelectItem>
                        <SelectItem value="equal">Equal split</SelectItem>
                        <SelectItem value="custom">Custom distribution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Automatic distribution</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically distribute earnings when contracts are completed
                      </p>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Minimum payout threshold</p>
                      <p className="text-sm text-muted-foreground">
                        Hold payments until they reach a minimum amount
                      </p>
                    </div>
                    <Input className="w-32" placeholder="$100" />
                  </div>
                </div>
                
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}