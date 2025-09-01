import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Plus, Code } from '@phosphor-icons/react'
import { PostCard } from '@/components/posts/PostCard'
import { CreatePostModal } from '@/components/posts/CreatePostModal'
import { MatrixDots, ScanLine } from '@/components/ui/loading-animations'
import { User, Post, Activity } from '@/types/user'

interface FeedViewProps {
  currentUser: User
}

export function FeedView({ currentUser }: FeedViewProps) {
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [posts, setPosts] = useKV<Post[]>('posts', [])
  const [activities, setActivities] = useKV<Activity[]>('activities', [])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleCreatePost = (newPost: Post) => {
    setPosts(current => [newPost, ...current])
    
    const activity: Activity = {
      id: Date.now().toString(),
      userId: currentUser.id,
      type: 'post',
      targetId: newPost.id,
      createdAt: new Date().toISOString()
    }
    setActivities(current => [activity, ...current])
    setShowCreatePost(false)
  }

  const handleLikePost = (postId: string) => {
    setPosts(current =>
      current.map(post => {
        if (post.id === postId) {
          const isLiked = post.likes.includes(currentUser.id)
          return {
            ...post,
            likes: isLiked 
              ? post.likes.filter(id => id !== currentUser.id)
              : [...post.likes, currentUser.id]
          }
        }
        return post
      })
    )
  }

  const feedPosts = posts.filter(post => 
    post.authorId === currentUser.id || 
    currentUser.following.includes(post.authorId)
  )

  return (
    <div className="h-screen overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Your Feed</h2>
          <Button onClick={() => setShowCreatePost(true)} disabled={isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-8 text-center space-y-4">
                <ScanLine />
                <div className="flex justify-center">
                  <MatrixDots size="md" />
                </div>
                <p className="text-muted-foreground font-mono">
                  Loading cybersecurity feed...
                </p>
              </CardContent>
            </Card>
            
            {/* Loading skeleton posts */}
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-card/30 border-border animate-pulse">
                <CardHeader className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-24" />
                      <div className="h-3 bg-muted rounded w-16" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : feedPosts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Code className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Welcome to CyberConnect!</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first post or following other cybersecurity professionals.
              </p>
              <Button onClick={() => setShowCreatePost(true)}>
                Create Your First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {feedPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onLike={handleLikePost}
              />
            ))}
          </div>
        )}

        {showCreatePost && (
          <CreatePostModal
            currentUser={currentUser}
            onClose={() => setShowCreatePost(false)}
            onCreatePost={handleCreatePost}
          />
        )}
      </div>
    </div>
  )
}