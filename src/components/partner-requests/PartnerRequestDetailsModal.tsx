import { useState } from 'react';
import { usePartnerRequests } from '@/hooks/usePartnerRequests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PartnerRequest, PartnerApplication, User } from '@/types';
import { 
  X, Clock, Users, DollarSign, Target, Calendar, 
  Check, X as Reject, User as UserIcon, MessageCircle,
  Portfolio, Skills
} from '@/lib/phosphor-icons-wrapper';
import { toast } from 'sonner';

interface PartnerRequestDetailsModalProps {
  request: PartnerRequest
  currentUser: User
  onClose: () => void
}

export function PartnerRequestDetailsModal({ 
  request, 
  currentUser, 
  onClose 
}: PartnerRequestDetailsModalProps) {
  const { applyToPartnerRequest, updateApplicationStatus } = usePartnerRequests();
  const [activeTab, setActiveTab] = useState<'details' | 'applications'>('details');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  
  const [applicationData, setApplicationData] = useState({
    message: '',
    availability: '',
    portfolioItems: ''
  });

  const isOwner = request.requesterId === currentUser.id;
  const hasApplied = request.applications.some(app => app.applicantId === currentUser.id);
  const userApplication = request.applications.find(app => app.applicantId === currentUser.id);

  const getProjectTypeIcon = (type: PartnerRequest['projectType']) => {
    switch (type) {
      case 'bug-bounty': return '🎯';
      case 'red-team': return '⚔️';
      case 'blue-team': return '🛡️';
      case 'research': return '🔬';
      case 'tool-development': return '🛠️';
      case 'ctf': return '🚩';
      default: return '💼';
    }
  };

  const getCompensationColor = (compensation: PartnerRequest['compensation']) => {
    switch (compensation) {
      case 'revenue-share': return 'bg-green-500/20 text-green-400';
      case 'fixed-payment': return 'bg-blue-500/20 text-blue-400';
      case 'equity': return 'bg-purple-500/20 text-purple-400';
      case 'experience': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleApply = () => {
    if (!applicationData.message.trim()) {
      toast.error('Please provide a message explaining your interest');
      return;
    }

    const portfolioItems = applicationData.portfolioItems
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    applyToPartnerRequest(request.id, {
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      applicantAvatar: currentUser.avatar,
      message: applicationData.message.trim(),
      skillsHighlight: currentUser.skills || [],
      portfolioItems,
      availability: applicationData.availability.trim()
    });

    toast.success('Application submitted successfully!');
    setShowApplicationForm(false);
    setApplicationData({ message: '', availability: '', portfolioItems: '' });
  };

  const handleApplicationAction = (applicationId: string, status: PartnerApplication['status']) => {
    updateApplicationStatus(request.id, applicationId, status);
    const action = status === 'accepted' ? 'accepted' : 'rejected';
    toast.success(`Application ${action} successfully`);
  };

  const getStatusBadgeVariant = (status: PartnerApplication['status']) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getProjectTypeIcon(request.projectType)}</div>
            <div>
              <h2 className="text-xl font-semibold line-clamp-1">{request.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={request.requesterAvatar} />
                  <AvatarFallback>{request.requesterName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">by {request.requesterName}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="details">
                  <Target className="w-4 h-4 mr-2" />
                  Project Details
                </TabsTrigger>
                <TabsTrigger value="applications">
                  <Users className="w-4 h-4 mr-2" />
                  Applications ({request.applications.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                {/* Project Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {request.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{request.estimatedDuration}</div>
                          <div className="text-xs text-muted-foreground">Duration</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{request.compensation.replace('-', ' ')}</div>
                          <div className="text-xs text-muted-foreground">Compensation</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{request.commitment.replace('-', ' ')}</div>
                          <div className="text-xs text-muted-foreground">Commitment</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{request.experienceLevel}</div>
                          <div className="text-xs text-muted-foreground">Experience</div>
                        </div>
                      </div>
                    </div>

                    {request.tags.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {request.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Skills */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Skills className="w-5 h-5" />
                        Skills Offered
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {request.skillsOffered.map(skill => (
                          <Badge key={skill} variant="outline" className="mr-2 mb-2">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Skills Needed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {request.skillsNeeded.map(skill => (
                          <Badge key={skill} variant="secondary" className="mr-2 mb-2">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Application Section */}
                {!isOwner && !hasApplied && !showApplicationForm && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <h3 className="text-lg font-semibold">Interested in this partnership?</h3>
                        <p className="text-muted-foreground">
                          Apply to collaborate with {request.requesterName} on this project
                        </p>
                        <Button onClick={() => setShowApplicationForm(true)} className="hover-red-glow">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Apply for Partnership
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!isOwner && hasApplied && userApplication && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Your Application
                        <Badge variant={getStatusBadgeVariant(userApplication.status)}>
                          {userApplication.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{userApplication.message}</p>
                      <div className="text-sm text-muted-foreground">
                        Applied on {new Date(userApplication.appliedAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {showApplicationForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Apply for Partnership</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="message">Cover Message *</Label>
                        <Textarea
                          id="message"
                          value={applicationData.message}
                          onChange={(e) => setApplicationData({ ...applicationData, message: e.target.value })}
                          placeholder="Explain why you're interested and how you can contribute..."
                          className="mt-1 min-h-[100px]"
                        />
                      </div>

                      <div>
                        <Label htmlFor="availability">Availability</Label>
                        <Input
                          id="availability"
                          value={applicationData.availability}
                          onChange={(e) => setApplicationData({ ...applicationData, availability: e.target.value })}
                          placeholder="e.g., Evenings and weekends, Full-time starting next month"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="portfolio">Portfolio/Experience (optional)</Label>
                        <Textarea
                          id="portfolio"
                          value={applicationData.portfolioItems}
                          onChange={(e) => setApplicationData({ ...applicationData, portfolioItems: e.target.value })}
                          placeholder="List relevant projects, CVEs, tools, or experience (one per line)"
                          className="mt-1"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          Enter each item on a new line
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowApplicationForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleApply} className="hover-red-glow">
                          Submit Application
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="applications" className="space-y-4">
                {request.applications.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="text-4xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                    <p className="text-muted-foreground">
                      Applications will appear here as people apply for this partnership
                    </p>
                  </Card>
                ) : (
                  request.applications.map(application => (
                    <Card key={application.id} className="hover-border-flow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={application.applicantAvatar} />
                              <AvatarFallback>{application.applicantName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{application.applicantName}</h3>
                              <div className="text-sm text-muted-foreground">
                                Applied {new Date(application.appliedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(application.status)}>
                              {application.status}
                            </Badge>
                            {isOwner && application.status === 'pending' && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApplicationAction(application.id, 'accepted')}
                                  className="hover:bg-green-500/20 hover:border-green-500"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApplicationAction(application.id, 'rejected')}
                                  className="hover:bg-red-500/20 hover:border-red-500"
                                >
                                  <Reject className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Cover Message</h4>
                          <p className="text-muted-foreground">{application.message}</p>
                        </div>

                        {application.skillsHighlight.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-1">
                              {application.skillsHighlight.map(skill => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {application.portfolioItems.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Portfolio/Experience</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {application.portfolioItems.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {application.availability && (
                          <div>
                            <h4 className="font-medium mb-2">Availability</h4>
                            <p className="text-sm text-muted-foreground">{application.availability}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}