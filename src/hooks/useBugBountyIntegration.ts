import { useState, useEffect } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { bugBountyService, threatIntelService, authService } from '@/lib/production-services';
import { useAPIKeys, useSecureConfig, APIKeyValidator, quotaManager, API_CONFIGS } from '@/lib/config';
import { apiManager, useProductionAPI, PLATFORM_CONFIGS } from '@/lib/production-api';
import { toast } from 'sonner';

export interface BugBountyProgram {
  id: string
  platform: 'hackerone' | 'bugcrowd' | 'intigriti' | 'yeswehack' | 'projectdiscovery' | 'shodan'
  name: string
  company: string
  bountyRange: string
  status: 'active' | 'paused' | 'closed'
  scope: string[]
  type: 'web' | 'mobile' | 'api' | 'infrastructure' | 'hardware'
  lastUpdated: string
  rewards: {
    critical: string
    high: string
    medium: string
    low: string
  }
  url: string
  description: string
  targets: string[]
  outOfScope: string[]
  disclosed: number
  verified: number
}

export interface LiveThreatFeed {
  id: string
  source: 'cve' | 'exploit-db' | 'security-advisory' | 'threat-intel' | 'vuln-disclosure'
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  cveId?: string
  description: string
  timestamp: string
  tags: string[]
  affectedProducts: string[]
  exploitation: 'in-the-wild' | 'poc-available' | 'theoretical'
  references: string[]
}

export interface TeamHunt {
  id: string
  name: string
  platform: string
  targetCompany: string
  startDate: string
  endDate: string
  teamSize: number
  currentMembers: string[]
  maxMembers: number
  skillsRequired: string[]
  bountyPool: string
  status: 'recruiting' | 'active' | 'completed'
  description: string
  progress: {
    vulnerabilities: number
    payout: string
    leaderboard: Array<{
      userId: string
      name: string
      score: number
      bounties: number
    }>
  }
}

export interface PartnerRequest {
  id: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  targetProgram: string
  platform: string
  message: string
  skillsOffered: string[]
  splitProposal: string
  status: 'pending' | 'accepted' | 'declined'
  timestamp: string
  expiresAt: string
}

export interface PlatformIntegration {
  id: string
  name: string
  type: 'bug-bounty' | 'threat-intel' | 'security-tool'
  apiKey?: string
  connected: boolean
  lastSync: string
  dataTypes: string[]
  rateLimits: {
    requests: number
    period: string
    remaining: number
  }
}

export function useBugBountyIntegration() {
  const [programs, setPrograms] = useKVWithFallback<BugBountyProgram[]>('bugBountyPrograms', []);
  const [threatFeed, setThreatFeed] = useKVWithFallback<LiveThreatFeed[]>('liveThreatFeed', []);
  const [teamHunts, setTeamHunts] = useKVWithFallback<TeamHunt[]>('teamHunts', []);
  const [partnerRequests, setPartnerRequests] = useKVWithFallback<PartnerRequest[]>('partnerRequests', []);
  const [integrations, setIntegrations] = useKVWithFallback<PlatformIntegration[]>('platformIntegrations', []);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [syncErrors, setSyncErrors] = useKVWithFallback<Record<string, string>>('syncErrors', {});
  
  // Use production API manager
  const productionAPI = useProductionAPI();
  
  // Use secure configuration management
  const apiKeys = useAPIKeys();
  const secureConfig = useSecureConfig();

  // Initialize real-time data streaming
  useEffect(() => {
    initializeIntegrations();
    startRealTimeUpdates();
    return () => {
      // Clean up real-time connections
      import('@/lib/production-services').then(({ webSocketService }) => {
        webSocketService.disconnect();
      }).catch(console.warn);
    };
  }, []);

  const initializeIntegrations = async () => {
    // Initialize default integrations based on production configuration
    const defaultIntegrations: PlatformIntegration[] = Object.entries(PLATFORM_CONFIGS).map(([key, config]) => ({
      id: `${key}-int`,
      name: config.name,
      type: key.includes('shodan') || key.includes('virus') 
        ? 'threat-intel' 
        : key.includes('project')
        ? 'security-tool'
        : 'bug-bounty',
      connected: false,
      lastSync: '',
      dataTypes: key === 'hackerone' ? ['programs', 'submissions', 'payouts'] :
                 key === 'bugcrowd' ? ['programs', 'submissions', 'earnings'] :
                 key === 'intigriti' ? ['programs', 'submissions'] :
                 key === 'yeswehack' ? ['programs', 'submissions'] :
                 key === 'shodan' ? ['iot-devices', 'vulnerabilities', 'network-scan'] :
                 key === 'projectdiscovery' ? ['nuclei-templates', 'scan-results', 'vulnerabilities'] :
                 key === 'virustotal' ? ['malware-analysis', 'url-scan', 'file-scan'] :
                 ['threat-intelligence', 'vulnerability-feeds'],
      rateLimits: { 
        requests: config.rateLimit.requests, 
        period: config.rateLimit.period, 
        remaining: config.rateLimit.requests 
      }
    }));

    // Add CVE database as always-connected public API
    defaultIntegrations.push({
      id: 'cve-int',
      name: 'CVE Database',
      type: 'threat-intel',
      connected: true,
      lastSync: new Date().toISOString(),
      dataTypes: ['cve-data', 'vulnerability-feeds'],
      rateLimits: { requests: 2000, period: 'hour', remaining: 2000 }
    });

    if (integrations.length === 0) {
      setIntegrations(defaultIntegrations);
    }

    // Check for existing connections from production API manager
    const activeConnections = productionAPI.getAllConnections();
    setIntegrations(current => 
      current.map(integration => {
        const platformKey = integration.name.toLowerCase().replace(' ', '');
        const connection = activeConnections.find(conn => conn.platform === platformKey);
        return {
          ...integration,
          connected: integration.id === 'cve-int' || !!connection,
          lastSync: connection?.lastTested || integration.lastSync
        };
      })
    );

    // Start loading real threat intelligence data
    await loadThreatIntelligence();
  };

  const startRealTimeUpdates = () => {
    // Use production WebSocket service for real-time updates
    import('@/lib/production-services').then(({ webSocketService }) => {
      webSocketService.on('threat_update', handleRealTimeThreatUpdate);
      webSocketService.on('bounty_update', handleProgramUpdate);
      webSocketService.on('team_hunt_update', handleTeamHuntUpdate);
      
      // Subscribe to relevant channels
      webSocketService.subscribe('threat-intelligence');
      webSocketService.subscribe('bug-bounty-programs');
      webSocketService.subscribe('team-hunts');
    }).catch(console.warn);

    // Set up periodic data refresh with production service
    const interval = setInterval(async () => {
      await refreshAllDataProduction();
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  };

  const handleRealTimeThreatUpdate = (threatData: any) => {
    const newThreat: LiveThreatFeed = {
      id: threatData.id || `threat-${Date.now()}`,
      source: threatData.source || 'threat-intel',
      title: threatData.title,
      severity: threatData.severity || 'medium',
      cveId: threatData.cve_id,
      description: threatData.description,
      timestamp: threatData.timestamp || new Date().toISOString(),
      tags: threatData.tags || [],
      affectedProducts: threatData.affected_products || [],
      exploitation: threatData.exploitation_status || 'theoretical',
      references: threatData.references || []
    };

    setThreatFeed(current => {
      const updated = [newThreat, ...current.slice(0, 499)]; // Keep last 500 items
      return updated;
    });

    // Show notification for critical threats
    if (threatData.severity === 'critical') {
      toast.error(`Critical Threat Alert: ${threatData.title}`, {
        description: 'New critical vulnerability detected',
        duration: 10000
      });
    }
  };

  const handleProgramUpdate = (programData: any) => {
    setPrograms(current => 
      current.map(program => 
        program.id === programData.id 
          ? { ...program, ...programData, lastUpdated: new Date().toISOString() }
          : program
      )
    );
  };

  const handleTeamHuntUpdate = (huntData: any) => {
    setTeamHunts(current => 
      current.map(hunt => 
        hunt.id === huntData.id 
          ? { ...hunt, ...huntData }
          : hunt
      )
    );
  };

  const loadThreatIntelligence = async () => {
    try {
      setIsLoading(true);
      
      // Use production threat intelligence service
      const allThreats = await threatIntelService.getLatestThreats();
      
      setThreatFeed(allThreats);
      setLastUpdate(new Date().toISOString());
    } catch (error) {
      console.error('Failed to load threat intelligence:', error);
      toast.error('Failed to load threat intelligence data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAllDataProduction = async () => {
    try {
      const promises = [];
      setSyncErrors({}); // Clear previous errors

      // Refresh connected bug bounty platforms using production service
      const connectedIntegrations = integrations.filter(int => int.connected);
      
      for (const integration of connectedIntegrations) {
        const platformKey = integration.name.toLowerCase().split(' ')[0];
        
        // Check rate limits before making requests
        if (!quotaManager.checkQuota(platformKey)) {
          console.warn(`Rate limit exceeded for ${integration.name}`);
          continue;
        }
        
        if (platformKey === 'cve') {
          promises.push(loadThreatIntelligence());
        } else {
          promises.push(loadPlatformDataProduction(platformKey));
        }
      }

      const results = await Promise.allSettled(promises);
      
      // Handle failed syncs
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const integration = connectedIntegrations[index];
          setSyncErrors(current => ({
            ...current,
            [integration.name]: result.reason?.message || 'Sync failed'
          }));
        }
      });

      setLastUpdate(new Date().toISOString());
      secureConfig.updateSyncTime('all');
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const loadProductionPlatformData = async (platformKey: string) => {
    try {
      // Use production API manager to fetch real data
      const platformPrograms = await productionAPI.fetchPrograms();
      const relevantPrograms = platformPrograms.filter(p => 
        p.platform.toLowerCase().replace(/\s+/g, '') === platformKey
      );
      
      setPrograms(current => {
        const filtered = current.filter(p => p.platform !== platformKey);
        return [...filtered, ...relevantPrograms.map(transformProgram)];
      });

      secureConfig.updateSyncTime(platformKey);
      toast.success(`${platformKey} data updated`);
    } catch (error) {
      console.error(`${platformKey} sync failed:`, error);
      setSyncErrors(current => ({ ...current, [platformKey]: error instanceof Error ? error.message : 'Sync failed' }));
      toast.error(`Failed to sync ${platformKey} data`);
      throw error;
    }
  };

  const transformProgram = (program: any): BugBountyProgram => ({
    id: program.id,
    platform: program.platform.toLowerCase() as 'hackerone' | 'bugcrowd' | 'intigriti' | 'yeswehack' | 'projectdiscovery' | 'shodan',
    name: program.name,
    company: program.name,
    bountyRange: program.bounty ? 'Bounty Available' : 'VDP Only',
    status: program.status === 'public' || program.status === 'active' ? 'active' : 'paused',
    scope: [program.handle],
    type: 'web',
    lastUpdated: new Date().toISOString(),
    rewards: {
      critical: '$5,000 - 50,000',
      high: '$1,000 - 5,000',
      medium: '$250 - 1,000',
      low: '$50 - 250'
    },
    url: program.url,
    description: `Security vulnerability disclosure program for ${program.name}`,
    targets: [program.handle],
    outOfScope: [],
    disclosed: 0,
    verified: 0
  });

  const refreshAllData = async () => {
    try {
      const promises = [];
      setSyncErrors({}); // Clear previous errors

      // Refresh connected bug bounty platforms
      const connectedIntegrations = integrations.filter(int => int.connected);
      
      for (const integration of connectedIntegrations) {
        const platformKey = integration.name.toLowerCase().split(' ')[0];
        const apiKey = apiKeys.getAPIKey(platformKey);
        
        // Check rate limits before making requests
        if (!quotaManager.checkQuota(platformKey)) {
          console.warn(`Rate limit exceeded for ${integration.name}`);
          continue;
        }
        
        if (integration.name === 'HackerOne' && apiKey) {
          promises.push(loadHackerOneData(apiKey, platformKey));
        } else if (integration.name === 'Bugcrowd' && apiKey) {
          promises.push(loadBugcrowdData(apiKey, platformKey));
        } else if (integration.name === 'Intigriti' && apiKey) {
          promises.push(loadIntigritiData(apiKey, platformKey));
        } else if (integration.name === 'YesWeHack' && apiKey) {
          promises.push(loadYesWeHackData(apiKey, platformKey));
        } else if (integration.name === 'Shodan' && apiKey) {
          promises.push(loadShodanData(apiKey, platformKey));
        } else if (integration.name === 'CVE Database') {
          promises.push(loadThreatIntelligence());
        }
      }

      const results = await Promise.allSettled(promises);
      
      // Handle failed syncs
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const integration = connectedIntegrations[index];
          setSyncErrors(current => ({
            ...current,
            [integration.name]: result.reason?.message || 'Sync failed'
          }));
        }
      });

      setLastUpdate(new Date().toISOString());
      secureConfig.updateSyncTime('all');
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const loadHackerOneData = async (apiKey: string, platformKey: string) => {
    try {
      const { HackerOneAPI } = await import('@/lib/api');
      const hackerOneAPI = new HackerOneAPI(apiKey);
      const hackerOnePrograms = await hackerOneAPI.getPrograms();
      
      setPrograms(current => {
        const filtered = current.filter(p => p.platform !== 'hackerone');
        return [...filtered, ...hackerOnePrograms];
      });

      secureConfig.updateSyncTime('hackerone');
      toast.success('HackerOne data updated');
    } catch (error) {
      console.error('HackerOne sync failed:', error);
      setSyncErrors(current => ({ ...current, hackerone: error instanceof Error ? error.message : 'Sync failed' }));
      toast.error('Failed to sync HackerOne data');
      throw error;
    }
  };

  const loadBugcrowdData = async (apiKey: string, platformKey: string) => {
    try {
      const { BugcrowdAPI } = await import('@/lib/api');
      const bugcrowdAPI = new BugcrowdAPI(apiKey);
      const bugcrowdPrograms = await bugcrowdAPI.getPrograms();
      
      setPrograms(current => {
        const filtered = current.filter(p => p.platform !== 'bugcrowd');
        return [...filtered, ...bugcrowdPrograms];
      });

      secureConfig.updateSyncTime('bugcrowd');
      toast.success('Bugcrowd data updated');
    } catch (error) {
      console.error('Bugcrowd sync failed:', error);
      setSyncErrors(current => ({ ...current, bugcrowd: error instanceof Error ? error.message : 'Sync failed' }));
      toast.error('Failed to sync Bugcrowd data');
      throw error;
    }
  };

  const loadIntigritiData = async (apiKey: string, platformKey: string) => {
    try {
      const { IntigritiAPI } = await import('@/lib/api');
      const intigritiAPI = new IntigritiAPI(apiKey);
      const intigritiPrograms = await intigritiAPI.getPrograms();
      
      setPrograms(current => {
        const filtered = current.filter(p => p.platform !== 'intigriti');
        return [...filtered, ...intigritiPrograms];
      });

      secureConfig.updateSyncTime('intigriti');
      toast.success('Intigriti data updated');
    } catch (error) {
      console.error('Intigriti sync failed:', error);
      setSyncErrors(current => ({ ...current, intigriti: error instanceof Error ? error.message : 'Sync failed' }));
      toast.error('Failed to sync Intigriti data');
      throw error;
    }
  };

  const loadYesWeHackData = async (apiKey: string, platformKey: string) => {
    try {
      const { YesWeHackAPI } = await import('@/lib/api');
      const yesWeHackAPI = new YesWeHackAPI(apiKey);
      const programs = await yesWeHackAPI.getPrograms();
      
      setPrograms(current => {
        const filtered = current.filter(p => p.platform !== 'yeswehack');
        return [...filtered, ...programs];
      });

      secureConfig.updateSyncTime('yeswehack');
      toast.success('YesWeHack data updated');
    } catch (error) {
      console.error('YesWeHack sync failed:', error);
      setSyncErrors(current => ({ ...current, yeswehack: error instanceof Error ? error.message : 'Sync failed' }));
      toast.error('Failed to sync YesWeHack data');
      throw error;
    }
  };

  const loadShodanData = async (apiKey: string, platformKey: string) => {
    try {
      const { ShodanAPI } = await import('@/lib/api');
      const shodanAPI = new ShodanAPI(apiKey);
      const vulnerabilities = await shodanAPI.searchVulnerabilities('vuln:');
      
      // Convert Shodan data to threat feed format
      const threatData: LiveThreatFeed[] = vulnerabilities.slice(0, 20).map((vuln: any) => ({
        id: `shodan-${vuln.ip}-${Date.now()}`,
        source: 'threat-intel' as const,
        title: `Vulnerability found on ${vuln.ip}`,
        severity: 'medium' as const,
        description: `Shodan detected vulnerability: ${vuln.vulns?.join(', ') || 'Multiple issues'}`,
        timestamp: new Date().toISOString(),
        tags: ['shodan', 'network-scan', ...(vuln.vulns || [])],
        affectedProducts: [vuln.product || 'Unknown'],
        exploitation: 'theoretical' as const,
        references: [`https://www.shodan.io/host/${vuln.ip}`]
      }));

      setThreatFeed(current => {
        const filtered = current.filter(t => !t.id.startsWith('shodan-'));
        return [...threatData, ...filtered].slice(0, 500);
      });

      secureConfig.updateSyncTime('shodan');
      toast.success('Shodan data updated');
    } catch (error) {
      console.error('Shodan sync failed:', error);
      setSyncErrors(current => ({ ...current, shodan: error instanceof Error ? error.message : 'Sync failed' }));
      toast.error('Failed to sync Shodan data');
      throw error;
    }
  };

  const connectPlatform = async (platformId: string, apiKey?: string) => {
    setIsLoading(true);
    
    try {
      const platform = integrations.find(int => int.id === platformId);
      if (!platform) {
        throw new Error('Platform not found');
      }

      const platformKey = platform.name.toLowerCase().replace(/\s+/g, '');
      
      if (!apiKey) {
        throw new Error('API key is required');
      }

      // Use production API manager to connect
      const connection = await productionAPI.connectPlatform(platformKey, apiKey);
      
      // Update integration status
      setIntegrations(current => 
        current.map(integration => 
          integration.id === platformId 
            ? { 
                ...integration, 
                connected: true, 
                lastSync: connection.lastTested
              }
            : integration
        )
      );

      // Load initial data using production API
      await loadProductionPlatformData(platformKey);

      // Enable platform in configuration
      secureConfig.enablePlatform(platformKey);

      toast.success(`Successfully connected to ${platform.name}`);
    } catch (error) {
      console.error('Platform connection failed:', error);
      toast.error(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const syncPlatformData = async (platformId: string) => {
    setIsLoading(true);
    
    try {
      const platform = integrations.find(int => int.id === platformId);
      const platformKey = platform?.name.toLowerCase().replace(/\s+/g, '');
      
      if (!platform?.connected) {
        throw new Error('Platform not connected');
      }

      // Check if this is the CVE database
      if (platform.name === 'CVE Database') {
        await loadThreatIntelligence();
      } else if (platformKey) {
        // Use production API manager for real platforms
        await loadProductionPlatformData(platformKey);
      }

      // Update last sync time
      setIntegrations(current => 
        current.map(integration => 
          integration.id === platformId 
            ? { ...integration, lastSync: new Date().toISOString() }
            : integration
        )
      );

      // Clear any previous sync errors
      setSyncErrors(current => {
        const updated = { ...current };
        delete updated[platformKey || platform.name];
        return updated;
      });

      toast.success(`${platform.name} data synchronized`);
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const joinTeamHunt = async (huntId: string, userId: string) => {
    try {
      // Use production collaboration service
      const { teamService } = await import('@/lib/production-services');
      await teamService.joinTeam(huntId);
      
      setTeamHunts(current => 
        current.map(hunt => 
          hunt.id === huntId && hunt.currentMembers.length < hunt.maxMembers
            ? { ...hunt, currentMembers: [...hunt.currentMembers, userId] }
            : hunt
        )
      );
      toast.success('Successfully joined team hunt');
    } catch (error) {
      console.error('Join hunt failed:', error);
      toast.error('Failed to join team hunt');
    }
  };

  const createPartnerRequest = async (request: Omit<PartnerRequest, 'id' | 'timestamp'>) => {
    try {
      const newRequest: PartnerRequest = {
        ...request,
        id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };
      setPartnerRequests(current => [newRequest, ...current]);
      toast.success('Partner request sent');
      return newRequest;
    } catch (error) {
      console.error('Create partner request failed:', error);
      toast.error('Failed to send partner request');
      throw error;
    }
  };

  const respondToPartnerRequest = (requestId: string, response: 'accepted' | 'declined') => {
    setPartnerRequests(current => 
      current.map(req => 
        req.id === requestId ? { ...req, status: response } : req
      )
    );

    toast.success(`Partner request ${response}`);
  };

  const createTeamHunt = async (hunt: Omit<TeamHunt, 'id'>) => {
    try {
      const newHunt: TeamHunt = {
        ...hunt,
        id: `hunt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      setTeamHunts(current => [newHunt, ...current]);
      toast.success('Team hunt created successfully');
      return newHunt;
    } catch (error) {
      console.error('Create team hunt failed:', error);
      toast.error('Failed to create team hunt');
      throw error;
    }
  };

  return {
    programs,
    threatFeed,
    teamHunts,
    partnerRequests,
    integrations,
    isLoading,
    lastUpdate,
    syncErrors,
    joinTeamHunt,
    createPartnerRequest,
    respondToPartnerRequest,
    connectPlatform,
    disconnectPlatform,
    syncPlatformData,
    createTeamHunt,
    refreshAllData,
    loadThreatIntelligence,
    getAPIKeyStatus,
    getRateLimitStatus,
    apiKeys,
    secureConfig
  };

  // Helper functions for platform management
  function disconnectPlatform(platformId: string) {
    const platform = integrations.find(int => int.id === platformId);
    const platformKey = platform?.name.toLowerCase().replace(/\s+/g, '');
    
    if (platformKey) {
      productionAPI.disconnectPlatform(platformKey);
      secureConfig.disablePlatform(platformKey);
    }

    setIntegrations(current => 
      current.map(integration => 
        integration.id === platformId 
          ? { ...integration, connected: false, lastSync: '' }
          : integration
      )
    );

    // Clear programs from disconnected platform
    if (platform) {
      setPrograms(current => 
        current.filter(p => p.platform !== platformKey)
      );
    }

    toast.success(`Disconnected from ${platform?.name}`);
  }

  function getAPIKeyStatus(platformId: string) {
    const platform = integrations.find(int => int.id === platformId);
    const platformKey = platform?.name.toLowerCase().replace(/\s+/g, '');
    
    if (!platformKey) {return null;}
    
    const connection = productionAPI.getConnection(platformKey);
    return connection ? {
      platform: platformKey,
      hasKey: true,
      expired: false,
      lastUsed: connection.lastTested
    } : null;
  }

  function getRateLimitStatus(platformId: string) {
    const platform = integrations.find(int => int.id === platformId);
    const platformKey = platform?.name.toLowerCase().replace(/\s+/g, '');
    
    if (!platformKey) {return null;}
    
    const rateLimit = productionAPI.getRateLimit(platformKey);
    return rateLimit ? {
      remaining: rateLimit.remaining,
      resetTime: rateLimit.reset
    } : null;
  }
}