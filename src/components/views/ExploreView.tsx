import { useState } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { UserCard } from '@/components/ui/UserCard'
import { Search, Users, Code, TrendingUp, ChatCircle } from '@/lib/phosphor-icons-wrapper'
import { User, Post, Specialization, Conversation } from '@/types/user'

interface ExploreViewProps {
  currentUser: User
  onNavigateToMessages?: (userId: string) => void
}

const TRENDING_TOPICS = [
  'Zero-Day Exploits', 'API Security', 'Cloud Security', 'SIEM Implementation',
  'Threat Hunting', 'Incident Response', 'Social Engineering', 'Network Forensics'
]

export function ExploreView({ currentUser, onNavigateToMessages }: ExploreViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Specialization | 'All'>('All')
  const [users] = useKVWithFallback<User[]>('allUsers', [])
  const [posts] = useKVWithFallback<Post[]>('posts', [])
  const [following, setFollowing] = useKVWithFallback<string[]>(`following-${currentUser.id}`, currentUser.following)
  const [conversations, setConversations] = useKVWithFallback<Conversation[]>('conversations', [])

  const categories: (Specialization | 'All')[] = [
    'All', 'Red Team', 'Blue Team', 'Bug Bounty', 'Penetration Testing',
    'Ethical Hacking', 'Malware Analysis', 'Security Research'
  ]

  const filteredUsers = (users ?? []).filter(user => {
    if (user.id === currentUser.id) return false
    
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'All' || 
                           user.specializations.includes(selectedCategory as Specialization)
    
    return matchesSearch && matchesCategory
  })

  const trendingPosts = (posts ?? [])
    .filter(post => post.likes.length > 0)
    .sort((a, b) => b.likes.length - a.likes.length)
    .slice(0, 5)

  const handleFollow = (userId: string) => {
  const isFollowing = (following ?? []).includes(userId)
    const newFollowing = isFollowing 
  ? (following ?? []).filter(id => id !== userId)
  : [...(following ?? []), userId]
    
    setFollowing(newFollowing)
  }

  const handleStartMessage = (userId: string) => {
    // Check if conversation already exists
  const existingConversation = (conversations ?? []).find(conv =>
      conv.participants.includes(currentUser.id) && 
      conv.participants.includes(userId) &&
      !conv.isGroup
    )

    if (!existingConversation) {
      // Create new conversation
      const newConversation: Conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        participants: [currentUser.id, userId],
        lastMessageAt: new Date().toISOString(),
        isGroup: false,
        unreadCount: 0
      }

  setConversations((prevConversations = []) => [...prevConversations, newConversation])
    }

    // Navigate to messages with this user
    if (onNavigateToMessages) {
      onNavigateToMessages(userId)
    }
  }

  return (
    <div className="h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Explore</h2>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, posts, or topics..."
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <h3 className="font-semibold">Discover Professionals</h3>
                </div>
              </CardHeader>
              <CardContent>
                {filteredUsers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No users found matching your criteria
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.slice(0, 10).map(user => (
                      <div key={user.id} className="relative">
                        <UserCard 
                          user={user} 
                          variant="compact" 
                          showBadges={true}
                          showStatus={true}
                          className="hover:shadow-lg transition-all duration-300"
                        />
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartMessage(user.id)}
                            className="glass-button"
                          >
                            <ChatCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={(following ?? []).includes(user.id) ? 'secondary' : 'default'}
                            onClick={() => handleFollow(user.id)}
                            className="hover-red-glow"
                          >
                            {(following ?? []).includes(user.id) ? 'Following' : 'Follow'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <h3 className="font-semibold">Trending Topics</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {TRENDING_TOPICS.map(topic => (
                    <div key={topic} className="p-2 rounded hover:bg-muted/50 cursor-pointer">
                      <p className="text-sm font-medium">{topic}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  <h3 className="font-semibold">Popular Posts</h3>
                </div>
              </CardHeader>
              <CardContent>
                {trendingPosts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No trending posts yet</p>
                ) : (
                  <div className="space-y-3">
                    {trendingPosts.map(post => (
                      <div key={post.id} className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {post.likes.length} likes
                          </Badge>
                          {post.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}