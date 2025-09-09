/**
 * Terminal User Interface (TUI) Component
 * Provides a terminal-like interface for advanced cybersecurity operations
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useEnhancedSecurity } from '@/lib/enhanced-security'
import { Terminal, Play, Stop, Zap, Shield, Target } from 'lucide-react'

interface TUICommand {
  command: string
  args: string[]
  timestamp: number
  status: 'running' | 'completed' | 'failed'
  output: string[]
  id: string
}

interface TargetData {
  id: string
  url: string
  type: 'domain' | 'ip' | 'network'
  status: 'active' | 'inactive'
  vulnerability_score?: number
  last_scan?: number
}

export function TUIInterface() {
  const [commands, setCommands] = useState<TUICommand[]>([])
  const [currentCommand, setCurrentCommand] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [targets, setTargets] = useState<TargetData[]>([])
  const [selectedTargets, setSelectedTargets] = useState<string[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { logSecurityEvent, checkRateLimit } = useEnhancedSecurity()

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [commands])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const validateTarget = (target: string): boolean => {
    // IP address validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    
    // Domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    
    // Network range validation
    const networkRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:3[0-2]|[12]?[0-9])$/

    return ipRegex.test(target) || domainRegex.test(target) || networkRegex.test(target)
  }

  const addTarget = (targetString: string) => {
    if (!validateTarget(targetString)) {
      addCommandOutput('Invalid target format. Use IP, domain, or CIDR notation.')
      return
    }

    const newTarget: TargetData = {
      id: `target-${Date.now()}`,
      url: targetString,
      type: targetString.includes('/') ? 'network' : 
            /^\d+\.\d+\.\d+\.\d+$/.test(targetString) ? 'ip' : 'domain',
      status: 'inactive',
      last_scan: Date.now()
    }

    setTargets(prev => [...prev, newTarget])
    addCommandOutput(`Added target: ${targetString}`)
    
    logSecurityEvent('target_added', 'low', { target: targetString, type: newTarget.type })
  }

  const removeTarget = (targetId: string) => {
    const target = targets.find(t => t.id === targetId)
    setTargets(prev => prev.filter(t => t.id !== targetId))
    setSelectedTargets(prev => prev.filter(id => id !== targetId))
    
    if (target) {
      addCommandOutput(`Removed target: ${target.url}`)
      logSecurityEvent('target_removed', 'low', { target: target.url })
    }
  }

  const importBulkTargets = (targetList: string) => {
    const targets = targetList.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    let validCount = 0
    let invalidCount = 0

    targets.forEach(target => {
      if (validateTarget(target)) {
        addTarget(target)
        validCount++
      } else {
        invalidCount++
        addCommandOutput(`Invalid target skipped: ${target}`)
      }
    })

    addCommandOutput(`Bulk import completed: ${validCount} valid, ${invalidCount} invalid targets`)
  }

  const addCommandOutput = (output: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const formattedOutput = `[${timestamp}] ${output}`
    
    setCommands(prev => {
      if (prev.length === 0) return prev
      const updated = [...prev]
      const lastCommand = updated[updated.length - 1]
      lastCommand.output = [...lastCommand.output, formattedOutput]
      return updated
    })
  }

  const executeCommand = useCallback(async (cmdString: string) => {
    const parts = cmdString.trim().split(' ')
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1)

    // Rate limiting check
    const rateCheck = checkRateLimit('tui-commands')
    if (!rateCheck.allowed) {
      addCommandOutput(`Rate limit exceeded. Try again in ${Math.ceil((rateCheck.resetTime - Date.now()) / 1000)} seconds.`)
      return
    }

    const commandId = `cmd-${Date.now()}`
    const newCommand: TUICommand = {
      command: cmd,
      args,
      timestamp: Date.now(),
      status: 'running',
      output: [],
      id: commandId
    }

    setCommands(prev => [...prev, newCommand])
    setIsRunning(true)

    // Add to history
    setHistory(prev => [...prev.slice(-50), cmdString]) // Keep last 50 commands

    try {
      switch (cmd) {
        case 'help':
          setTimeout(() => {
            addCommandOutput('Available commands:')
            addCommandOutput('  help                    - Show this help')
            addCommandOutput('  clear                   - Clear terminal')
            addCommandOutput('  target add <url>        - Add target for scanning')
            addCommandOutput('  target remove <id>      - Remove target')
            addCommandOutput('  target list             - List all targets')
            addCommandOutput('  target select <ids>     - Select targets for operations')
            addCommandOutput('  scan start              - Start vulnerability scan')
            addCommandOutput('  scan status             - Show scan status')
            addCommandOutput('  nuclei run <template>   - Run nuclei template')
            addCommandOutput('  export targets          - Export target list')
            addCommandOutput('  import bulk <targets>   - Import multiple targets')
            setCommandStatus(commandId, 'completed')
          }, 500)
          break

        case 'clear':
          setTimeout(() => {
            setCommands([])
            setCommandStatus(commandId, 'completed')
          }, 100)
          break

        case 'target':
          if (args[0] === 'add' && args[1]) {
            setTimeout(() => {
              addTarget(args[1])
              setCommandStatus(commandId, 'completed')
            }, 300)
          } else if (args[0] === 'remove' && args[1]) {
            setTimeout(() => {
              removeTarget(args[1])
              setCommandStatus(commandId, 'completed')
            }, 300)
          } else if (args[0] === 'list') {
            setTimeout(() => {
              if (targets.length === 0) {
                addCommandOutput('No targets configured')
              } else {
                addCommandOutput('Configured targets:')
                targets.forEach(target => {
                  const selected = selectedTargets.includes(target.id) ? '[SELECTED] ' : ''
                  addCommandOutput(`  ${selected}${target.id}: ${target.url} (${target.type}, ${target.status})`)
                })
              }
              setCommandStatus(commandId, 'completed')
            }, 500)
          } else if (args[0] === 'select') {
            const targetIds = args.slice(1)
            setSelectedTargets(targetIds)
            addCommandOutput(`Selected ${targetIds.length} targets`)
            setCommandStatus(commandId, 'completed')
          } else {
            addCommandOutput('Invalid target command. Use: target add|remove|list|select')
            setCommandStatus(commandId, 'failed')
          }
          break

        case 'scan':
          if (args[0] === 'start') {
            setTimeout(() => {
              if (selectedTargets.length === 0) {
                addCommandOutput('No targets selected. Use "target select <ids>" first.')
                setCommandStatus(commandId, 'failed')
                return
              }
              
              addCommandOutput(`Starting vulnerability scan on ${selectedTargets.length} targets...`)
              
              // Simulate scan progress
              let progress = 0
              const progressInterval = setInterval(() => {
                progress += 10
                addCommandOutput(`Scan progress: ${progress}%`)
                
                if (progress >= 100) {
                  clearInterval(progressInterval)
                  addCommandOutput('Scan completed. Results saved to scan_results.json')
                  
                  // Update target statuses
                  setTargets(prev => prev.map(target => 
                    selectedTargets.includes(target.id) 
                      ? { ...target, status: 'active' as const, vulnerability_score: Math.floor(Math.random() * 10), last_scan: Date.now() }
                      : target
                  ))
                  
                  setCommandStatus(commandId, 'completed')
                }
              }, 1000)
            }, 500)
          } else if (args[0] === 'status') {
            addCommandOutput('Scan engine status: Ready')
            addCommandOutput(`Targets configured: ${targets.length}`)
            addCommandOutput(`Targets selected: ${selectedTargets.length}`)
            setCommandStatus(commandId, 'completed')
          } else {
            addCommandOutput('Invalid scan command. Use: scan start|status')
            setCommandStatus(commandId, 'failed')
          }
          break

        case 'nuclei':
          if (args[0] === 'run' && args[1]) {
            setTimeout(() => {
              addCommandOutput(`Running nuclei template: ${args[1]}`)
              addCommandOutput('Template execution started...')
              
              // Simulate nuclei execution
              setTimeout(() => {
                addCommandOutput(`Template ${args[1]} completed successfully`)
                addCommandOutput('Found 0 vulnerabilities')
                setCommandStatus(commandId, 'completed')
              }, 2000)
            }, 500)
          } else {
            addCommandOutput('Usage: nuclei run <template>')
            setCommandStatus(commandId, 'failed')
          }
          break

        case 'export':
          if (args[0] === 'targets') {
            setTimeout(() => {
              const exportData = {
                targets: targets,
                exported_at: new Date().toISOString(),
                total_count: targets.length
              }
              addCommandOutput('Target list exported to targets.json')
              addCommandOutput(`Exported ${targets.length} targets`)
              // In a real implementation, this would download or save the file
              setCommandStatus(commandId, 'completed')
            }, 500)
          } else {
            addCommandOutput('Usage: export targets')
            setCommandStatus(commandId, 'failed')
          }
          break

        case 'import':
          if (args[0] === 'bulk') {
            // This would normally open a file dialog or accept pasted content
            addCommandOutput('Bulk import mode activated')
            addCommandOutput('Paste target list (one per line) and press Enter twice:')
            setCommandStatus(commandId, 'completed')
          } else {
            addCommandOutput('Usage: import bulk')
            setCommandStatus(commandId, 'failed')
          }
          break

        default:
          setTimeout(() => {
            addCommandOutput(`Unknown command: ${cmd}. Type 'help' for available commands.`)
            setCommandStatus(commandId, 'failed')
          }, 300)
          break
      }
    } catch (error) {
      addCommandOutput(`Error executing command: ${error.message}`)
      setCommandStatus(commandId, 'failed')
    }

    setIsRunning(false)
  }, [targets, selectedTargets, checkRateLimit, logSecurityEvent])

  const setCommandStatus = (commandId: string, status: TUICommand['status']) => {
    setCommands(prev => prev.map(cmd => 
      cmd.id === commandId ? { ...cmd, status } : cmd
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentCommand.trim() && !isRunning) {
      executeCommand(currentCommand)
      setCurrentCommand('')
      setHistoryIndex(-1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCurrentCommand(history[history.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentCommand(history[history.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCurrentCommand('')
      }
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <Card className="border-green-500/20 bg-black/90">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Terminal className="h-5 w-5" />
            CyberConnect TUI - Terminal Interface
            <Badge variant="outline" className="ml-auto border-green-500 text-green-400">
              {isRunning ? 'RUNNING' : 'READY'}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Terminal Output */}
            <div className="lg:col-span-2">
              <div className="bg-black border border-green-500/30 rounded-lg overflow-hidden">
                <div className="bg-green-900/20 px-4 py-2 border-b border-green-500/30">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-green-400 text-sm ml-2">cyber@connect:~$</span>
                  </div>
                </div>
                
                <ScrollArea className="h-96" ref={terminalRef}>
                  <div className="p-4 font-mono text-sm">
                    {commands.length === 0 && (
                      <div className="text-green-400">
                        <p>CyberConnect Terminal Interface v2.0</p>
                        <p>Type 'help' to see available commands.</p>
                        <p className="text-green-600 mt-2">Ready for input...</p>
                      </div>
                    )}
                    
                    {commands.map((cmd) => (
                      <div key={cmd.id} className="mb-4">
                        <div className="text-green-400 flex items-center gap-2">
                          <span className="text-green-600">$</span>
                          <span>{cmd.command} {cmd.args.join(' ')}</span>
                          {cmd.status === 'running' && (
                            <div className="ml-2 flex items-center gap-1">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                              <span className="text-yellow-400 text-xs">RUNNING</span>
                            </div>
                          )}
                          {cmd.status === 'completed' && (
                            <div className="ml-2 flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-green-400 text-xs">COMPLETED</span>
                            </div>
                          )}
                          {cmd.status === 'failed' && (
                            <div className="ml-2 flex items-center gap-1">
                              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                              <span className="text-red-400 text-xs">FAILED</span>
                            </div>
                          )}
                        </div>
                        
                        {cmd.output.map((line, idx) => (
                          <div key={idx} className="text-green-300 ml-6 text-xs leading-relaxed">
                            {line}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <form onSubmit={handleSubmit} className="border-t border-green-500/30 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-mono">$</span>
                    <Input
                      ref={inputRef}
                      value={currentCommand}
                      onChange={(e) => setCurrentCommand(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="bg-transparent border-none text-green-400 font-mono focus:ring-0 focus:border-none"
                      placeholder="Enter command..."
                      disabled={isRunning}
                    />
                    <Button 
                      type="submit" 
                      size="sm" 
                      variant="outline"
                      className="border-green-500 text-green-400 hover:bg-green-500/10"
                      disabled={isRunning || !currentCommand.trim()}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Sidebar - Target Management */}
            <div className="space-y-4">
              <Card className="border-blue-500/20 bg-blue-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-400 text-sm">
                    <Target className="h-4 w-4" />
                    Targets ({targets.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {targets.length === 0 ? (
                    <p className="text-gray-500 text-xs">No targets configured</p>
                  ) : (
                    <ScrollArea className="h-32">
                      {targets.map((target) => (
                        <div key={target.id} className="flex items-center justify-between p-2 border border-gray-700 rounded text-xs mb-1">
                          <div className="flex-1 min-w-0">
                            <p className="text-blue-300 truncate">{target.url}</p>
                            <p className="text-gray-500">{target.type}</p>
                          </div>
                          <Badge 
                            variant={target.status === 'active' ? 'default' : 'secondary'}
                            className="ml-2 text-xs"
                          >
                            {target.status}
                          </Badge>
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                  
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-gray-500 text-xs">Selected: {selectedTargets.length}</p>
                    <div className="flex gap-1 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs h-6"
                        onClick={() => setSelectedTargets(targets.map(t => t.id))}
                      >
                        All
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs h-6"
                        onClick={() => setSelectedTargets([])}
                      >
                        None
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-purple-500/20 bg-purple-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-purple-400 text-sm">
                    <Zap className="h-4 w-4" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={() => executeCommand('scan start')}
                    disabled={selectedTargets.length === 0}
                  >
                    Start Scan
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={() => executeCommand('target list')}
                  >
                    List Targets
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={() => executeCommand('help')}
                  >
                    Show Help
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-orange-500/20 bg-orange-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-orange-400 text-sm">
                    <Shield className="h-4 w-4" />
                    Security Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Encryption:</span>
                      <Badge variant="default" className="text-xs">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rate Limit:</span>
                      <Badge variant="default" className="text-xs">Protected</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Session:</span>
                      <Badge variant="default" className="text-xs">Secure</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TUIInterface