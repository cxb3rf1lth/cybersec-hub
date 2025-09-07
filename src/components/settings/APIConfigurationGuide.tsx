import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Key, Shield, CheckCircle, AlertTriangle, Info } from '@/lib/phosphor-icons-wrapper';
import { API_CONFIGS } from '@/lib/config';

export function APIConfigurationGuide() {
  const handleOpenDocs = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getSetupComplexity = (platform: string): 'easy' | 'medium' | 'hard' => {
    const complexityMap: Record<string, 'easy' | 'medium' | 'hard'> = {
      hackerone: 'medium',
      bugcrowd: 'medium', 
      intigriti: 'hard',
      yeswehack: 'medium',
      shodan: 'easy',
      projectdiscovery: 'easy',
      virustotal: 'easy',
      alienvault: 'easy'
    };
    return complexityMap[platform] || 'medium';
  };

  const getComplexityColor = (complexity: 'easy' | 'medium' | 'hard') => {
    switch (complexity) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
    }
  };

  const getSetupSteps = (platform: string): string[] => {
    const steps: Record<string, string[]> = {
      hackerone: [
        'Log into your HackerOne account',
        'Go to Profile Settings → API Tokens',
        'Click "Create API Token"',
        'Set permissions: "Programs:Read", "Reports:Read"',
        'Copy the generated token'
      ],
      bugcrowd: [
        'Access your Bugcrowd researcher dashboard',
        'Navigate to Account Settings → API Access',
        'Generate a new API key',
        'Ensure "Read Programs" and "Read Submissions" scopes',
        'Save the API key securely'
      ],
      intigriti: [
        'Visit Intigriti researcher portal',
        'Go to Settings → Developer',
        'Create OAuth application',
        'Configure redirect URLs',
        'Obtain OAuth token with required scopes'
      ],
      yeswehack: [
        'Log into YesWeHack platform',
        'Access Account Settings → API',
        'Generate new API token',
        'Set scope to "programs:read"',
        'Copy the token'
      ],
      shodan: [
        'Create account on Shodan.io',
        'Go to Account page',
        'Copy your API key',
        'Verify membership for additional quota'
      ],
      projectdiscovery: [
        'Sign up for ProjectDiscovery Cloud',
        'Navigate to API Settings',
        'Generate API key with "Templates" access',
        'Copy the pd_ prefixed key'
      ],
      virustotal: [
        'Register on VirusTotal',
        'Go to User menu → API Key',
        'Copy your personal API key',
        'Note rate limits for free accounts'
      ],
      alienvault: [
        'Create AlienVault OTX account',
        'Visit OTX API page',
        'Generate API key',
        'Copy the 64-character key'
      ]
    };
    return steps[platform] || ['Visit platform documentation', 'Follow setup instructions', 'Generate API key'];
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">API Setup Guide</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Follow these step-by-step guides to obtain API keys for each bug bounty platform and security tool.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(API_CONFIGS).map(([key, config]) => {
          const complexity = getSetupComplexity(key);
          const steps = getSetupSteps(key);
          
          return (
            <Card key={key} className="glass-card hover-border-flow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      {config.platform}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {config.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge 
                      variant="outline" 
                      className={`capitalize ${getComplexityColor(complexity)}`}
                    >
                      {complexity} setup
                    </Badge>
                    <Badge variant={config.required ? 'default' : 'secondary'}>
                      {config.required ? 'Required' : 'Optional'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Setup Steps:
                  </div>
                  <ol className="space-y-2 ml-6">
                    {steps.map((step, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary font-mono text-xs mt-0.5 min-w-[1.5rem]">
                          {index + 1}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {config.scopesRequired && config.scopesRequired.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Shield className="w-4 h-4 text-blue-400" />
                      Required Scopes:
                    </div>
                    <div className="flex flex-wrap gap-1 ml-6">
                      {config.scopesRequired.map((scope) => (
                        <Badge key={scope} variant="outline" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-border pt-4 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleOpenDocs(config.docsUrl)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Official API Documentation
                  </Button>

                  {key === 'hackerone' && (
                    <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-blue-300 font-medium">Pro Tip:</p>
                        <p className="text-blue-200/80">
                          Use identifier-based authentication for better security. Create separate tokens for different applications.
                        </p>
                      </div>
                    </div>
                  )}

                  {key === 'bugcrowd' && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-yellow-300 font-medium">Rate Limits:</p>
                        <p className="text-yellow-200/80">
                          Free accounts: 1000 requests/day. Researcher accounts have higher limits.
                        </p>
                      </div>
                    </div>
                  )}

                  {key === 'intigriti' && (
                    <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-red-300 font-medium">OAuth Required:</p>
                        <p className="text-red-200/80">
                          Intigriti uses OAuth 2.0. You'll need to set up an application and handle token refresh.
                        </p>
                      </div>
                    </div>
                  )}

                  {key === 'shodan' && (
                    <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-green-300 font-medium">Easy Setup:</p>
                        <p className="text-green-200/80">
                          Just copy your API key from the account page. Consider upgrading for more query credits.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-400">✓ Do</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Store API keys securely</li>
                <li>• Use minimum required scopes</li>
                <li>• Rotate keys regularly</li>
                <li>• Monitor usage and rate limits</li>
                <li>• Use different keys for different purposes</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-red-400">✗ Don't</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Share API keys with others</li>
                <li>• Store keys in public repositories</li>
                <li>• Use production keys for testing</li>
                <li>• Ignore rate limit warnings</li>
                <li>• Use overly broad permissions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}