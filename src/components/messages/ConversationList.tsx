import { useKV } from '@github/spark/hooks'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Conversation, User } from '@/types/user'
import { formatDistanceToNow } from 'date-fns'

interface ConversationListProps {
  conversations: Conversation[]
  currentUserId: string
  selectedConversationId: string | null
  onSelectConversation: (conversationId: string) => void
}

export function ConversationList({ 
  conversations, 
  currentUserId, 
  selectedConversationId, 
  onSelectConversation 
}: ConversationListProps) {
  const [users] = useKV<User[]>('allUsers', [])

  const getOtherParticipant = (conversation: Conversation) => {
    const otherParticipantId = conversation.participants.find(id => id !== currentUserId)
    return users.find(user => user.id === otherParticipantId)
  }

  const sortedConversations = [...conversations].sort((a, b) => 
    new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  )

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <p>No conversations yet</p>
          <p className="text-sm">Start a new conversation to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {sortedConversations.map((conversation) => {
        const otherParticipant = getOtherParticipant(conversation)
        const isSelected = conversation.id === selectedConversationId
        
        if (!otherParticipant) return null

        return (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
              isSelected ? 'bg-muted' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src={otherParticipant.avatar} />
                <AvatarFallback>
                  {otherParticipant.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground truncate">
                    {otherParticipant.username}
                  </h4>
                  {conversation.unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground truncate">
                  {otherParticipant.specializations[0] || 'Security Professional'}
                </p>
                
                {conversation.lastMessage && (
                  <div className="mt-1">
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage.type === 'code' 
                        ? `📝 Code snippet (${conversation.lastMessage.codeLanguage})`
                        : conversation.lastMessage.content
                      }
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { 
                        addSuffix: true 
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}