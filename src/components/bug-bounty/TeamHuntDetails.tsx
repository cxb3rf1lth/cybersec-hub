import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Calendar, 
  Clock, 
  Target, 
  FileText, 
  MessageCircle, 
  Video, 
  Download,
  CheckCircle,
  Circle,
  Play,
  Award,
  TrendingUp,
  Activity
} from '@phosphor-icons/react';
import { TeamHunt, TeamHuntParticipant } from '@/types/bug-bounty';
import { User } from '@/types/user';
import { toast } from 'sonner';

interface TeamHuntDetailsProps {
  hunt: TeamHunt
  currentUser: User
  onJoinHunt: (huntId: string) => void
  onLeaveHunt: (huntId: string) => void
  onUpdateObjective: (huntId: string, objectiveId: string, status: 'pending' | 'in-progress' | 'completed') => void
}

export function TeamHuntDetails({ 
  hunt, 
  currentUser, 
  onJoinHunt, 
  onLeaveHunt, 
  onUpdateObjective 
}: TeamHuntDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showBinaryRain, setShowBinaryRain] = useState(false);

  const isParticipant = hunt.participants.some(p => p.userId === currentUser.id);
  const canJoin = !isParticipant && hunt.participants.length < hunt.maxParticipants && hunt.status === 'active';
  
  const completedObjectives = hunt.objectives.filter(o => o.status === 'completed').length;
  const progressPercentage = (completedObjectives / hunt.objectives.length) * 100;

  const startDate = new Date(hunt.startDate);
  const endDate = new Date(hunt.endDate);
  const now = new Date();
  const timeLeft = endDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  const handleObjectiveUpdate = (objectiveId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    onUpdateObjective(hunt.id, objectiveId, newStatus);
    toast.success(`Objective updated to ${newStatus}`);
  };

  const renderBinaryRain = () => {
    if (!showBinaryRain) {return null;}
    
    return (
      <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden">
        <div className="binary-rain-container">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="binary-column" style={{
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}>
              {Array.from({ length: 15 }, (_, j) => (
                <div key={j} className="binary-char">
                  {Math.random() > 0.5 ? '1' : '0'}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 relative">
      {renderBinaryRain()}
      
      {/* Header */}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{hunt.name}</h1>
          <p className="text-muted-foreground mt-1">{hunt.description}</p>
          <div className="flex items-center gap-4 mt-3">
            <Badge variant={hunt.status === 'active' ? "default" : "secondary"}>
              {hunt.status}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              {hunt.programName}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {hunt.participants.length}/{hunt.maxParticipants} members
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {daysLeft > 0 ? `${daysLeft} days left` : 'Completed'}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={showBinaryRain ? "default" : "outline"}
            size="sm"
            onClick={() => setShowBinaryRain(!showBinaryRain)}
            className="hover-red-glow"
          >
            <Activity className="h-4 w-4 mr-2" />
            Matrix Mode
          </Button>
          {canJoin && (
            <Button onClick={() => onJoinHunt(hunt.id)} className="hover-red-glow">
              <Users className="h-4 w-4 mr-2" />
              Join Hunt
            </Button>
          )}
          {isParticipant && (
            <Button 
              variant="outline" 
              onClick={() => onLeaveHunt(hunt.id)}
              className="hover-red-glow"
            >
              Leave Hunt
            </Button>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="relative z-10">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">{completedObjectives}/{hunt.objectives.length}</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
            
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Duration</span>
              <p className="text-lg font-semibold">{Math.ceil(hunt.duration / 24)} days</p>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Team</span>
              <p className="text-lg font-semibold">{hunt.teamName}</p>
            </div>
            
            {hunt.results && (
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Bounty Earned</span>
                <p className="text-lg font-semibold text-primary">${hunt.results.totalBounty.toLocaleString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="relative z-10">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hunt Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Hunt Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {hunt.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Circle className="h-4 w-4 mt-0.5 text-primary" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {hunt.objectives.map((objective) => (
                      <div key={objective.id} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                          objective.status === 'completed' ? 'bg-green-500' :
                          objective.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{objective.title}</p>
                          <p className="text-xs text-muted-foreground">{objective.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="objectives" className="space-y-4">
          {hunt.objectives.map((objective) => (
            <Card key={objective.id} className="hover-border-flow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{objective.title}</h3>
                      <Badge variant={
                        objective.priority === 'high' ? 'destructive' :
                        objective.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {objective.priority}
                      </Badge>
                      <Badge variant={
                        objective.status === 'completed' ? 'default' :
                        objective.status === 'in-progress' ? 'secondary' : 'outline'
                      }>
                        {objective.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{objective.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {objective.assignedTo && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {objective.assignedTo.length} assigned
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due {new Date(objective.targetCompletion).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {isParticipant && (
                    <div className="flex gap-2">
                      {objective.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleObjectiveUpdate(objective.id, 'in-progress')}
                          className="hover-red-glow"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {objective.status === 'in-progress' && (
                        <Button 
                          size="sm"
                          onClick={() => handleObjectiveUpdate(objective.id, 'completed')}
                          className="hover-red-glow"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hunt.participants.map((participant) => (
              <Card key={participant.userId} className="hover-border-flow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>{participant.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{participant.username}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {participant.role}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Contribution Score:</span>
                      <span className="font-medium">{participant.contributionScore}/100</span>
                    </div>
                    <Progress value={participant.contributionScore} className="h-2" />
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {participant.specialization.slice(0, 2).map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {participant.specialization.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{participant.specialization.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {hunt.sharedResources.map((resource) => (
            <Card key={resource.id} className="hover-border-flow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">{resource.name}</h3>
                      <p className="text-xs text-muted-foreground">{resource.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          by @{resource.uploadedBy}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {resource.downloadCount} downloads
                    </span>
                    <Button size="sm" variant="outline" className="hover-red-glow">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {isParticipant && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-3">Share a resource with your team</p>
                <Button variant="outline" className="hover-red-glow">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Resource
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          {hunt.meetingSchedule?.map((meeting) => (
            <Card key={meeting.id} className="hover-border-flow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{meeting.title}</h3>
                    <p className="text-muted-foreground">{meeting.type}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(meeting.scheduledTime).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {meeting.duration} minutes
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {meeting.participants.length} participants
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {meeting.meetingUrl && (
                      <Button size="sm" variant="outline" className="hover-red-glow">
                        <Video className="h-4 w-4 mr-1" />
                        Join
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="hover-red-glow">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {meeting.agenda && meeting.agenda.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Agenda:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {meeting.agenda.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Circle className="h-3 w-3 mt-1 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {hunt.results ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{hunt.results.reportsSubmitted}</p>
                      <p className="text-xs text-muted-foreground">Reports Submitted</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{hunt.results.validReports}</p>
                      <p className="text-xs text-muted-foreground">Valid Reports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Award className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">${hunt.results.totalBounty.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Bounty</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">#{hunt.results.teamRanking}</p>
                      <p className="text-xs text-muted-foreground">Team Ranking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Hunt in progress - results will be available upon completion</p>
              </CardContent>
            </Card>
          )}

          {hunt.results?.achievements && hunt.results.achievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {hunt.results.achievements.map((achievement, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      <Award className="h-3 w-3 mr-1" />
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}