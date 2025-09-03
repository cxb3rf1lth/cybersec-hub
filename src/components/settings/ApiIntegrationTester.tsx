import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useApiKeys, API_SERVICES, type ApiServiceKey } from '@/lib/api-keys'
import { authenticatedApiService } from '@/lib/api-keys'
import { bugBountyService, threatIntelService } from '@/lib/production-services'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Activity, 
  Shield,
  Bug,
  Database
} from '@phosphor-icons/react'

interface TestResult {
  service: ApiServiceKey
  success: boolean
  duration: number
  error?: string
  data?: any
}

export function ApiIntegrationTester() {
  const { getAllApiKeys, isServiceEnabled } = useApiKeys()
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [progress, setProgress] = useState(0)

  const runAllTests = async () => {
    setTesting(true)
    setResults([])
    setProgress(0)

    const enabledServices = Array.from(getAllApiKeys().entries())
      .filter(([_, config]) => config.enabled)
      .map(([service]) => service)

    if (enabledServices.length === 0) {
      setTesting(false)
      return
    }

    const testResults: TestResult[] = []
    
    for (let i = 0; i < enabledServices.length; i++) {
      const service = enabledServices[i]
      const result = await testService(service)
      testResults.push(result)
      setResults([...testResults])
      setProgress(((i + 1) / enabledServices.length) * 100)
    }

    setTesting(false)
  }

  const testService = async (service: ApiServiceKey): Promise<TestResult> => {
    const startTime = Date.now()
    
    try {
      let testData: any
      
      switch (service) {
        case 'HACKERONE':
          testData = await authenticatedApiService.get('HACKERONE', '/me')
          break
        case 'BUGCROWD':
          testData = await authenticatedApiService.get('BUGCROWD', '/user')
          break
        case 'INTIGRITI':
          testData = await authenticatedApiService.get('INTIGRITI', '/researcher/me')
          break
        case 'YESWEHACK':
          testData = await authenticatedApiService.get('YESWEHACK', '/user')
          break
        case 'SHODAN':
          testData = await authenticatedApiService.get('SHODAN', '/api-info')
          break
        case 'VIRUSTOTAL':
          testData = await authenticatedApiService.get('VIRUSTOTAL', '/file/report?apikey=test&resource=test')
          break
        case 'CVE_CIRCL':
          testData = await authenticatedApiService.get('CVE_CIRCL', '/last/1')
          break
        case 'NVD':
          testData = await authenticatedApiService.get('NVD', '/cves/2.0?resultsPerPage=1')
          break
        case 'SECURITY_ADVISORIES':
          testData = await authenticatedApiService.get('SECURITY_ADVISORIES', '?per_page=1')
          break
        default:
          throw new Error('Test not implemented for this service')
      }

      return {
        service,
        success: true,
        duration: Date.now() - startTime,
        data: testData
      }
    } catch (error) {
      return {
        service,
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  const testBugBountyIntegration = async () => {
    try {
      setTesting(true)
      const platforms: ApiServiceKey[] = ['HACKERONE', 'BUGCROWD', 'INTIGRITI', 'YESWEHACK']
      const enabledPlatforms = platforms.filter(p => isServiceEnabled(p))
      
      if (enabledPlatforms.length === 0) {
        throw new Error('No bug bounty platforms configured')
      }

      const results = await Promise.allSettled(
        enabledPlatforms.map(platform => bugBountyService.syncPrograms(platform))
      )

      const successCount = results.filter(r => r.status === 'fulfilled').length
      console.log(`Bug bounty sync completed: ${successCount}/${enabledPlatforms.length} platforms successful`)
      
    } catch (error) {
      console.error('Bug bounty integration test failed:', error)
    } finally {
      setTesting(false)
    }
  }

  const testThreatIntelligence = async () => {
    try {
      setTesting(true)
      const threats = await threatIntelService.getLatestThreats()
      console.log(`Threat intelligence test completed: ${threats.length} threats retrieved`)
    } catch (error) {
      console.error('Threat intelligence test failed:', error)
    } finally {
      setTesting(false)
    }
  }

  const getServiceIcon = (service: ApiServiceKey) => {
    if (['HACKERONE', 'BUGCROWD', 'INTIGRITI', 'YESWEHACK'].includes(service)) {
      return <Bug size={16} className="text-blue-400" />
    }
    if (['SHODAN', 'VIRUSTOTAL', 'CVE_CIRCL', 'NVD', 'SECURITY_ADVISORIES'].includes(service)) {
      return <Shield size={16} className="text-red-400" />
    }
    return <Database size={16} className="text-green-400" />
  }

  const getResultBadge = (result: TestResult) => {
    if (result.success) {
      return (
        <Badge variant="default" className="bg-green-600/20 text-green-400 border-green-600/30">
          <CheckCircle size={12} className="mr-1" />
          Success
        </Badge>
      )
    }
    return (
      <Badge variant="destructive">
        <XCircle size={12} className="mr-1" />
        Failed
      </Badge>
    )
  }

  const enabledServices = Array.from(getAllApiKeys().entries())
    .filter(([_, config]) => config.enabled)

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} className="text-accent" />
            API Integration Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {enabledServices.length} services configured
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={testBugBountyIntegration}
                  disabled={testing}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Bug size={14} />
                  Test Bug Bounty
                </Button>
                <Button
                  onClick={testThreatIntelligence}
                  disabled={testing}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Shield size={14} />
                  Test Threat Intel
                </Button>
                <Button
                  onClick={runAllTests}
                  disabled={testing || enabledServices.length === 0}
                  className="flex items-center gap-2"
                >
                  {testing ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Activity size={14} />
                  )}
                  Test All APIs
                </Button>
              </div>
            </div>

            {testing && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Testing progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {enabledServices.length === 0 && (
              <Alert>
                <Activity size={16} />
                <AlertDescription>
                  No API services are configured. Go to Profile Settings → Integrations to add API keys.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.service}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50"
                >
                  <div className="flex items-center gap-3">
                    {getServiceIcon(result.service)}
                    <div>
                      <div className="font-medium text-sm">
                        {API_SERVICES[result.service].name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.duration}ms
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getResultBadge(result)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                {results.filter(r => r.success).length}/{results.length} tests passed
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {results.some(r => !r.success) && (
        <Card className="glass-card border-red-600/20">
          <CardHeader>
            <CardTitle className="text-sm text-red-400">Failed Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results
                .filter(r => !r.success)
                .map((result) => (
                  <div key={result.service} className="text-sm">
                    <div className="font-medium">{API_SERVICES[result.service].name}</div>
                    <div className="text-red-400 text-xs">{result.error}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}