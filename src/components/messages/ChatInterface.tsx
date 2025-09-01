import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { PaperPlaneTilt, Code, User as UserIcon, Check, Checks } from '@phosphor-icons/react'
import { Conversation, Message, User } from '@/types/user'
import { formatDistanceToNow } from 'date-fns'

interface ChatInterfaceProps {
  conversation: Conversation
  messages: Message[]
  currentUser: User
  onSendMessage: (content: string, type?: 'text' | 'code', codeLanguage?: string) => void
}

export function ChatInterface({ conversation, messages, currentUser, onSendMessage }: ChatInterfaceProps) {
  const [users] = useKV<User[]>('allUsers', [])
  const [messageContent, setMessageContent] = useState('')
  const [messageType, setMessageType] = useState<'text' | 'code'>('text')
  const [codeLanguage, setCodeLanguage] = useState('javascript')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const otherParticipant = users.find(user => 
    conversation.participants.includes(user.id) && user.id !== currentUser.id
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!messageContent.trim()) return

    onSendMessage(
      messageContent.trim(), 
      messageType, 
      messageType === 'code' ? codeLanguage : undefined
    )
    setMessageContent('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const codeLanguages = [
    'javascript', 'python', 'bash', 'powershell', 'c', 'cpp', 'java', 
    'go', 'rust', 'sql', 'yaml', 'json', 'xml', 'html', 'css'
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherParticipant?.avatar} />
            <AvatarFallback>
              {otherParticipant?.username[0].toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">
              {otherParticipant?.username || 'Unknown User'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {otherParticipant?.specializations[0] || 'Security Professional'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUser.id
          const sender = users.find(user => user.id === message.senderId)

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isCurrentUser && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={sender?.avatar} />
                  <AvatarFallback className="text-xs">
                    {sender?.username[0].toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-1' : ''}`}>
                <Card className={`p-3 ${
                  isCurrentUser 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card text-card-foreground'
                }`}>
                  {message.type === 'code' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs opacity-70">
                        <Code className="w-3 h-3" />
                        {message.codeLanguage}
                      </div>
                      <pre className="text-sm font-mono bg-black/10 p-2 rounded overflow-x-auto code-scroll">
                        <code>{message.content}</code>
                      </pre>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </Card>
                
                <p className={`text-xs text-muted-foreground mt-1 flex items-center gap-1 ${
                  isCurrentUser ? 'text-right justify-end' : 'text-left justify-start'
                }`}>
                  <span>
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </span>
                  {isCurrentUser && message.status && (
                    <span className="flex items-center">
                      {message.status === 'sent' && <Check className="w-3 h-3" />}
                      {message.status === 'delivered' && <Checks className="w-3 h-3" />}
                      {message.status === 'read' && <Checks className="w-3 h-3 text-accent" />}
                    </span>
                  )}
                </p>
              </div>

              {isCurrentUser && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="text-xs">
                    {currentUser.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Select value={messageType} onValueChange={(value: 'text' | 'code') => setMessageType(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="code">Code</SelectItem>
              </SelectContent>
            </Select>
            
            {messageType === 'code' && (
              <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {codeLanguages.map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="flex gap-2">
            <Textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={messageType === 'code' ? 'Share your code...' : 'Type a message...'}
              className="flex-1 min-h-[80px] resize-none"
              rows={messageType === 'code' ? 6 : 2}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!messageContent.trim()}
              className="self-end"
            >
              <PaperPlaneTilt className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}