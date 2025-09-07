import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { BadgeGrid } from '@/components/ui/SecurityBadge';
import { CertificationList } from '@/components/ui/CertificationBadge';
import { Users, FileText, Code, Calendar, Edit, Gear, Trophy, Certificate, Shield } from '@/lib/phosphor-icons-wrapper';
import { User, Post } from '@/types/user';
import { PostCard } from '@/components/posts/PostCard';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ThemeSelector } from '@/components/profile/ThemeSelector';

interface ProfileViewProps {
  currentUser: User
  onUserUpdate: (user: User) => void
}

export function ProfileView({ currentUser, onUserUpdate }: ProfileViewProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [posts] = useKVWithFallback<Post[]>('posts', []);
  const [allUsers] = useKVWithFallback<User[]>('allUsers', []);

  const userPosts = posts.filter(post => post.authorId === currentUser.id);
  const followers = allUsers.filter(user => user.following.includes(currentUser.id));
  const following = allUsers.filter(user => currentUser.following.includes(user.id));

  const handleLikePost = (postId: string) => {
    // This would typically update the posts in the parent component
    // For now, it's a placeholder
  };

  const handleUpdateProfile = (updatedUser: User) => {
    onUserUpdate(updatedUser);
    setShowEditModal(false);
  };

  return (
    <div className="h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <Card className="mb-6 glass-card">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="text-2xl">
                    {currentUser.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {currentUser.status && (
                  <StatusIndicator 
                    status={currentUser.status} 
                    size="lg" 
                    className="absolute -bottom-2 -right-2"
                  />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">{currentUser.displayName || currentUser.username}</h1>
                    {currentUser.securityClearance && currentUser.securityClearance.level !== 'none' && (
                      <div className="flex items-center gap-1">
                        <Shield 
                          size={20} 
                          className={
                            currentUser.securityClearance.level === 'top-secret' ? 'text-red-400' :
                            currentUser.securityClearance.level === 'secret' ? 'text-yellow-400' :
                            'text-blue-400'
                          }
                        />
                        <span className={`text-xs font-medium ${
                          currentUser.securityClearance.level === 'top-secret' ? 'text-red-400' :
                          currentUser.securityClearance.level === 'secret' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`}>
                          {currentUser.securityClearance.level.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button onClick={() => setShowEditModal(true)} className="hover-red-glow">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
                
                <p className="text-muted-foreground mb-2">@{currentUser.username}</p>
                <p className="text-muted-foreground mb-3">{currentUser.email}</p>
                
                {currentUser.status && (
                  <div className="mb-4">
                    <StatusIndicator status={currentUser.status} showMessage={true} />
                  </div>
                )}
                
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
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">{currentUser.reputation || 0}</div>
                    <div className="text-xs text-muted-foreground">Reputation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-accent">{currentUser.successfulFindings || 0}</div>
                    <div className="text-xs text-muted-foreground">Findings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">{followers.length}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">{following.length}</div>
                    <div className="text-xs text-muted-foreground">Following</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(currentUser.joinedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Posts ({userPosts.length})
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Badges ({currentUser.badges?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center gap-2">
              <Certificate className="w-4 h-4" />
              Certifications ({currentUser.certifications?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Following ({following.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Gear className="w-4 h-4" />
              Settings
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

          <TabsContent value="badges" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Security Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentUser.badges && currentUser.badges.length > 0 ? (
                  <BadgeGrid badges={currentUser.badges} size="lg" className="gap-4" />
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No badges earned yet</h3>
                    <p className="text-muted-foreground">
                      Start contributing to earn security achievement badges!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Certificate className="w-5 h-5 text-blue-400" />
                  Professional Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentUser.certifications && currentUser.certifications.length > 0 ? (
                  <CertificationList certifications={currentUser.certifications} size="md" layout="grid" />
                ) : (
                  <div className="text-center py-8">
                    <Certificate className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No certifications added</h3>
                    <p className="text-muted-foreground">
                      Add your professional certifications to showcase your expertise!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
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

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <ThemeSelector />
              
              <Card className="panel-dark">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Interface Settings
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Customize your cyberpunk experience
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    More interface customization options coming soon...
                  </div>
                </CardContent>
              </Card>
            </div>
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
  );
}