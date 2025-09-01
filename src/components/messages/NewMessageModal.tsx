import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { User } from '@/types/user'

interface NewMessageModalProps {
  currentUser: User
  onClose: () => void
  onStartConversation: (participantId: string) => void
}

export function NewMessageModal({ currentUser, onClose, onStartConversation }: NewMessageModalProps) {
  const [users] = useKV<User[]>('allUsers', [])
  const [searchQuery, setSearchQuery] = useState('')

  // Filter users excluding current user and based on search query
  const filteredUsers = users.filter(user => 
    user.id !== currentUser.id &&
    (user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.specializations.some(spec => 
       spec.toLowerCase().includes(searchQuery.toLowerCase())
     ))
  )

  const handleStartConversation = (userId: string) => {
    onStartConversation(userId)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>New Message</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-10"
            />
          </div>

          {/* Users List */}
          <div className="max-h-80 overflow-y-auto space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No users found</p>
                {searchQuery && (
                  <p className="text-sm">Try adjusting your search</p>
                )}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleStartConversation(user.id)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                >
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {user.username}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.bio || 'Security Professional'}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.specializations.slice(0, 2).map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {user.specializations.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{user.specializations.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}