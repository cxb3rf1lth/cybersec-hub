import { useState } from 'react'
import { usePartnerRequests } from '@/hooks/usePartnerRequests'
import { useSamplePartnerRequests } from '@/hooks/useSamplePartnerRequests'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreatePartnerRequestModal } from './CreatePartnerRequestModal'
import { PartnerRequestDetailsModal } from './PartnerRequestDetailsModal'
import { PartnerMatchesCard } from './PartnerMatchesCard'
import { PartnerRequest, User } from '@/types'
import { Plus, Users, Target, Clock, DollarSign, Star } from '@phosphor-icons/react'

interface PartnerRequestsProps {
  currentUser: User
}

export function PartnerRequests({ currentUser }: PartnerRequestsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<PartnerRequest | null>(null)
  const [activeTab, setActiveTab] = useState<'browse' | 'my-requests' | 'my-applications' | 'matches'>('browse')

  const {
    partnerRequests,
    getMyRequests,
    getMyApplications,
    findMatches
  } = usePartnerRequests()

  // Initialize sample data
  useSamplePartnerRequests()

  const myRequests = getMyRequests(currentUser.id)
  const myApplications = getMyApplications(currentUser.id)
  const matches = findMatches(currentUser.id, currentUser.skills || [])

  const getProjectTypeIcon = (type: PartnerRequest['projectType']) => {
    switch (type) {
      case 'bug-bounty': return '🎯'
      case 'red-team': return '⚔️'
      case 'blue-team': return '🛡️'
      case 'research': return '🔬'
      case 'tool-development': return '🛠️'
      case 'ctf': return '🚩'
      default: return '💼'
    }
  }

  const getCompensationColor = (compensation: PartnerRequest['compensation']) => {
    switch (compensation) {
      case 'revenue-share': return 'bg-green-500/20 text-green-400'
      case 'fixed-payment': return 'bg-blue-500/20 text-blue-400'
      case 'equity': return 'bg-purple-500/20 text-purple-400'
      case 'experience': return 'bg-orange-500/20 text-orange-400'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const PartnerRequestCard = ({ request }: { request: PartnerRequest }) => (
    <Card 
      className="hover-border-flow cursor-pointer transition-all duration-300 hover:shadow-lg"
      onClick={() => setSelectedRequest(request)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getProjectTypeIcon(request.projectType)}</div>
            <div>
              <CardTitle className="text-lg line-clamp-2">{request.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <img 
                  src={request.requesterAvatar} 
                  alt={request.requesterName}
                  className="w-5 h-5 rounded-full"
                />
                <span className="text-sm text-muted-foreground">{request.requesterName}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className={getCompensationColor(request.compensation)}>
            {request.compensation.replace('-', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {request.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{request.estimatedDuration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{request.applications.length} applications</span>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground">Skills Needed:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {request.skillsNeeded.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {request.skillsNeeded.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{request.skillsNeeded.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <span className="text-xs text-muted-foreground">Skills Offered:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {request.skillsOffered.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {request.skillsOffered.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{request.skillsOffered.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {request.tags.slice(0, 4).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs opacity-70">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Partner Requests</h1>
          <p className="text-muted-foreground">
            Find collaboration opportunities with complementary skills
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="hover-red-glow">
          <Plus className="w-4 h-4 mr-2" />
          Create Request
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">
            <Target className="w-4 h-4 mr-2" />
            Browse ({partnerRequests.filter(r => r.status === 'open' && r.requesterId !== currentUser.id).length})
          </TabsTrigger>
          <TabsTrigger value="my-requests">
            <Users className="w-4 h-4 mr-2" />
            My Requests ({myRequests.length})
          </TabsTrigger>
          <TabsTrigger value="my-applications">
            <DollarSign className="w-4 h-4 mr-2" />
            Applications ({myApplications.length})
          </TabsTrigger>
          <TabsTrigger value="matches">
            <Star className="w-4 h-4 mr-2" />
            Matches ({matches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {partnerRequests
              .filter(request => request.status === 'open' && request.requesterId !== currentUser.id)
              .map(request => (
                <PartnerRequestCard key={request.id} request={request} />
              ))}
          </div>
          {partnerRequests.filter(r => r.status === 'open' && r.requesterId !== currentUser.id).length === 0 && (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No Partner Requests</h3>
              <p className="text-muted-foreground">
                Be the first to create a partner request and start collaborating!
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-requests" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myRequests.map(request => (
              <PartnerRequestCard key={request.id} request={request} />
            ))}
          </div>
          {myRequests.length === 0 && (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2">No Requests Created</h3>
              <p className="text-muted-foreground mb-4">
                Create your first partner request to find collaborators
              </p>
              <Button onClick={() => setShowCreateModal(true)} className="hover-red-glow">
                <Plus className="w-4 h-4 mr-2" />
                Create Request
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-applications" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myApplications.map(({ request, application }) => (
              <Card key={`${request.id}-${application.id}`} className="hover-border-flow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getProjectTypeIcon(request.projectType)}</div>
                      <div>
                        <CardTitle className="text-lg line-clamp-1">{request.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">by {request.requesterName}</span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={application.status === 'accepted' ? 'default' : 
                              application.status === 'rejected' ? 'destructive' : 'secondary'}
                    >
                      {application.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Applied {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedRequest(request)}
                    className="w-full"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {myApplications.length === 0 && (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">No Applications</h3>
              <p className="text-muted-foreground">
                Browse partner requests and apply to start collaborating
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <PartnerMatchesCard 
            matches={matches} 
            currentUser={currentUser}
            onViewRequest={(requestId) => {
              const request = partnerRequests.find(r => r.id === requestId)
              if (request) setSelectedRequest(request)
            }}
          />
        </TabsContent>
      </Tabs>

      {showCreateModal && (
        <CreatePartnerRequestModal
          currentUser={currentUser}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {selectedRequest && (
        <PartnerRequestDetailsModal
          request={selectedRequest}
          currentUser={currentUser}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  )
}