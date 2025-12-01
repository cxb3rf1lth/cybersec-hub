import { useState } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Copy, Clock } from '@phosphor-icons/react'
import { Post, User } from '@/types/user'
import { toast } from 'sonner'

interface PostCardProps {
  post: Post
  currentUser: User
  onLike: (postId: string) => void
}

export function PostCard({ post, currentUser, onLike }: PostCardProps) {
  const [allUsers] = useKVWithFallback<User[]>('allUsers', [])
  const [showComments, setShowComments] = useState(false)
  
  const author = allUsers.find(user => user.id === post.authorId) || currentUser
  const isLiked = post.likes.includes(currentUser.id)
  const timeAgo = getTimeAgo(post.createdAt)

  const handleCopyCode = async () => {
    if (post.type === 'code') {
      await navigator.clipboard.writeText(post.content)
      toast.success('Code copied to clipboard!')
    }
  }

  const formatCode = (code: string, language?: string) => {
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-2 p-2 bg-muted/30 rounded-t-lg">
          <span className="text-xs font-mono text-muted-foreground">
            {language || 'code'}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyCode}
            className="h-6 px-2"
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
        <pre className="bg-muted/50 p-4 rounded-b-lg overflow-x-auto code-scroll">
          <code className="text-sm font-mono">{code}</code>
        </pre>
      </div>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={author.avatar} />
            <AvatarFallback>{author.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{author.username}</p>
              {author.specializations[0] && (
                <Badge variant="outline" className="text-xs">
                  {author.specializations[0]}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {post.type === 'text' ? (
          <p className="whitespace-pre-wrap">{post.content}</p>
        ) : (
          formatCode(post.content, post.codeLanguage)
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : ''}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            {post.likes.length}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            {post.comments.length}
          </Button>
        </div>

        {showComments && (
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              Comments feature coming soon...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}