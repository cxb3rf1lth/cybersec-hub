import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, FileText, Code, Calendar, Edit } from '@phosphor-icons/react'
import { User, Post } from '@/types/user'
import { PostCard } from '@/components/posts/PostCard'
import { EditProfileModal } from '@/components/profile/EditProfileModal'

interface ProfileViewProps {
  currentUser: User
  onUserUpdate: (user: User) => void
}

export function ProfileView({ currentUser, onUserUpdate }: ProfileViewProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [posts] = useKV<Post[]>('posts', [])
  const [allUsers] = useKV<User[]>('allUsers', [])

  const userPosts = posts.filter(post => post.authorId === currentUser.id)
  const followers = allUsers.filter(user => user.following.includes(currentUser.id))
  const following = allUsers.filter(user => currentUser.following.includes(user.id))

  const handleLikePost = (postId: string) => {
    // This would typically update the posts in the parent component
    // For now, it's a placeholder
  }

  const handleUpdateProfile = (updatedUser: User) => {
    onUserUpdate(updatedUser)
    setShowEditModal(false)
  }

  return (
    <div className="h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="text-2xl">
                  {currentUser.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold">{currentUser.username}</h1>
                  <Button onClick={() => setShowEditModal(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
                
                <p className="text-muted-foreground mb-3">{currentUser.email}</p>
                
                {currentUser.bio && (
                  <p className="mb-4">{currentUser.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentUser.specializations.map(spec => (
                    <Badge key={spec} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{followers.length} followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{following.length} following</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(currentUser.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Posts ({userPosts.length})
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Following ({following.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            {userPosts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Code className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">
                    Share your cybersecurity insights with the community!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {userPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onLike={handleLikePost}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="followers" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {followers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No followers yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {followers.map(user => (
                      <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.specializations?.slice(0, 2).map(spec => (
                              <Badge key={spec} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            )) || []}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="following" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {following.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Not following anyone yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {following.map(user => (
                      <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.specializations?.slice(0, 2).map(spec => (
                              <Badge key={spec} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            )) || []}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showEditModal && (
          <EditProfileModal
            user={currentUser}
            onClose={() => setShowEditModal(false)}
            onSave={handleUpdateProfile}
          />
        )}
      </div>
    </div>
  )
}