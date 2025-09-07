import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe, 
  Key, 
  Settings, 
  Bell, 
  Shield, 
  Sync, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Activity,
  Clock,
  DollarSign
} from '@/lib/phosphor-icons-wrapper';
import { BugBountyPlatform, PlatformConfiguration } from '@/types/bug-bounty';
import { User } from '@/types/user';
import { toast } from 'sonner';

interface PlatformConfigurationProps {
  platforms: BugBountyPlatform[]
  configurations: PlatformConfiguration[]
  currentUser: User
  onUpdateConfiguration: (config: PlatformConfiguration) => void
}

export function PlatformConfigurationView({ 
  platforms, 
  configurations, 
  currentUser, 
  onUpdateConfiguration 
}: PlatformConfigurationProps) {
  const [activeTab, setActiveTab] = useState('platforms');
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PlatformConfiguration>>({});

  const getConfigForPlatform = (platformId: string) => {
    return configurations.find(c => c.platformId === platformId && c.userId === currentUser.id);
  };

  const handleConfigureClick = (platform: BugBountyPlatform) => {
    const existingConfig = getConfigForPlatform(platform.id);
    setEditingPlatform(platform.id);
    setFormData(existingConfig || {
      platformId: platform.id,
      userId: currentUser.id,
      credentials: {},
      syncSettings: {
        autoSync: true,
        syncInterval: 30,
        syncPrograms: true,
        syncReports: true,
        syncEarnings: true,
        syncLeaderboard: false
      },
      notifications: {
        newPrograms: true,
        programUpdates: true,
        bountyAwards: true,
        teamInvitations: true,
        partnerRequests: true
      },
      privacy: {
        showEarnings: false,
        showRanking: true,
        allowTeamInvitations: true,
        allowPartnerRequests: true
      },
      isConfigured: false,
      lastConfigured: new Date().toISOString(),
      configuredBy: currentUser.id
    });
  };

  const handleSaveConfiguration = () => {
    if (!editingPlatform || !formData) {return;}

    const config: PlatformConfiguration = {
      ...formData,
      platformId: editingPlatform,
      userId: currentUser.id,
      isConfigured: true,
      lastConfigured: new Date().toISOString(),
      configuredBy: currentUser.id
    } as PlatformConfiguration;

    onUpdateConfiguration(config);
    setEditingPlatform(null);
    setFormData({});
    toast.success('Platform configuration saved successfully!');
  };

  const handleTestConnection = async (platform: BugBountyPlatform) => {
    toast.info('Testing connection...');
    // Simulate API test
    setTimeout(() => {
      toast.success(`Successfully connected to ${platform.displayName}!`);
    }, 2000);
  };

  const platformStats = platforms.map(platform => {
    const config = getConfigForPlatform(platform.id);
    return {
      platform,
      config,
      isConfigured: config?.isConfigured || false,
      lastSync: platform.integration.lastSync,
      status: platform.integration.status
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Configuration</h1>
          <p className="text-muted-foreground">
            Connect and configure bug bounty platforms for seamless integration
          </p>
        </div>
        <Button variant="outline" className="hover-red-glow">
          <Sync className="h-4 w-4 mr-2" />
          Sync All Platforms
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="sync-settings">Sync Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {platformStats.map(({ platform, config, isConfigured, status }) => (
              <Card key={platform.id} className="hover-border-flow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Globe className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{platform.displayName}</CardTitle>
                        <p className="text-sm text-muted-foreground">{platform.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isConfigured ? "default" : "secondary"}>
                        {isConfigured ? "Configured" : "Not Configured"}
                      </Badge>
                      <Badge variant={status === 'connected' ? "default" : "destructive"}>
                        {status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{platform.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Active Programs:</span>
                      <span className="font-medium">{platform.stats.activeProgramsCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Bounty:</span>
                      <span className="font-medium">${platform.averagePayout.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Response Time:</span>
                      <span className="font-medium">{platform.stats.averageResponseTime}h</span>
                    </div>
                    {config?.lastConfigured && (
                      <div className="flex justify-between text-sm">
                        <span>Last Sync:</span>
                        <span className="font-medium">
                          {new Date(platform.integration.lastSync).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      className="flex-1 hover-red-glow" 
                      variant={isConfigured ? "outline" : "default"}
                      onClick={() => handleConfigureClick(platform)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {isConfigured ? "Reconfigure" : "Configure"}
                    </Button>
                    {isConfigured && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleTestConnection(platform)}
                        className="hover-red-glow"
                      >
                        <Activity className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Configuration Modal/Form */}
          {editingPlatform && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Configure {platforms.find(p => p.id === editingPlatform)?.displayName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Enter your API key"
                      value={formData.credentials?.apiKey || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        credentials: { ...prev.credentials, apiKey: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username (Optional)</Label>
                    <Input
                      id="username"
                      placeholder="Platform username"
                      value={formData.credentials?.username || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        credentials: { ...prev.credentials, username: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Sync Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoSync" className="text-sm">Auto Sync</Label>
                      <Switch
                        id="autoSync"
                        checked={formData.syncSettings?.autoSync || false}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          syncSettings: { ...prev.syncSettings!, autoSync: checked }
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="syncPrograms" className="text-sm">Sync Programs</Label>
                      <Switch
                        id="syncPrograms"
                        checked={formData.syncSettings?.syncPrograms || false}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          syncSettings: { ...prev.syncSettings!, syncPrograms: checked }
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="syncReports" className="text-sm">Sync Reports</Label>
                      <Switch
                        id="syncReports"
                        checked={formData.syncSettings?.syncReports || false}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          syncSettings: { ...prev.syncSettings!, syncReports: checked }
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="syncEarnings" className="text-sm">Sync Earnings</Label>
                      <Switch
                        id="syncEarnings"
                        checked={formData.syncSettings?.syncEarnings || false}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          syncSettings: { ...prev.syncSettings!, syncEarnings: checked }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveConfiguration} className="hover-red-glow">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                  <Button variant="outline" onClick={() => setEditingPlatform(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sync-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sync className="h-5 w-5" />
                Global Sync Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Sync Frequency</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Real-time Updates</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Hourly Sync</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Daily Reports</Label>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Data Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">New Programs</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Bounty Updates</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Leaderboards</Label>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Sync History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {platforms.map((platform) => (
                    <div key={platform.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          platform.integration.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-medium">{platform.displayName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(platform.integration.lastSync).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Platform Updates</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">New Programs</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Program Updates</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Bounty Awards</Label>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Team & Social</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Team Invitations</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Partner Requests</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Hunt Updates</Label>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Profile Visibility</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm">Show Earnings</Label>
                      <p className="text-xs text-muted-foreground">Display your bounty earnings on your profile</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm">Show Ranking</Label>
                      <p className="text-xs text-muted-foreground">Display your platform rankings publicly</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm">Show Active Programs</Label>
                      <p className="text-xs text-muted-foreground">Let others see which programs you're active in</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Communication</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm">Allow Team Invitations</Label>
                      <p className="text-xs text-muted-foreground">Let others invite you to team hunts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm">Allow Partner Requests</Label>
                      <p className="text-xs text-muted-foreground">Receive collaboration partner requests</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm">Public Contact Info</Label>
                      <p className="text-xs text-muted-foreground">Show contact information on your profile</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}