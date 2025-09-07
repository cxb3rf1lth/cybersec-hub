import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { BadgeGrid } from '@/components/ui/SecurityBadge';
import { CertificationList } from '@/components/ui/CertificationBadge';
import { UserCard } from '@/components/ui/UserCard';
import { User, UserStatus, SecurityBadge, SecurityCertification } from '@/types/user';
import { Users, Trophy, Certificate } from '@/lib/phosphor-icons-wrapper';

const sampleUser: User = {
  id: 'demo_user',
  username: 'alex_hunter',
  displayName: 'Alex Hunter',
  email: 'alex@cyberconnect.com',
  bio: 'Elite penetration tester with 5+ years of experience in web application security and bug bounty hunting.',
  specializations: ['Penetration Testing', 'Bug Bounty', 'Ethical Hacking'],
  followers: ['user1', 'user2'],
  following: ['user3'],
  joinedAt: '2023-01-15T10:00:00.000Z',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  reputation: 1250,
  successfulFindings: 47,
  status: {
    type: 'on-hunt',
    customMessage: 'Currently analyzing HackerOne targets',
    isActivelyHunting: true,
    currentProject: 'Web Application Security Assessment'
  },
  badges: [
    {
      id: 'badge1',
      type: 'first-blood',
      name: 'First Blood',
      description: 'First to report a critical vulnerability on a major platform',
      icon: '🩸',
      earnedAt: '2024-01-15',
      rarity: 'epic',
      metadata: {
        platform: 'HackerOne',
        severity: 'critical',
        bountyValue: 5000,
        targetCompany: 'TechCorp'
      }
    },
    {
      id: 'badge2',
      type: 'hall-of-fame',
      name: 'Hall of Fame',
      description: 'Inducted into platform hall of fame',
      icon: '🏆',
      earnedAt: '2024-02-20',
      rarity: 'legendary',
      metadata: {
        platform: 'Bugcrowd'
      }
    },
    {
      id: 'badge3',
      type: 'critical-finder',
      name: 'Critical Hunter',
      description: 'Found 10+ critical vulnerabilities',
      icon: '⚡',
      earnedAt: '2024-03-10',
      rarity: 'rare',
      metadata: {
        amount: 12,
        severity: 'critical'
      }
    },
    {
      id: 'badge4',
      type: 'zero-day',
      name: 'Zero Day Hunter',
      description: 'Discovered a zero-day vulnerability',
      icon: '💀',
      earnedAt: '2024-03-01',
      rarity: 'legendary'
    }
  ],
  certifications: [
    {
      id: 'cert1',
      name: 'OSCP',
      organization: 'Offensive Security',
      dateEarned: '2023-06-15',
      credentialId: 'OS-12345',
      level: 'expert',
      category: 'penetration-testing'
    },
    {
      id: 'cert2',
      name: 'CEH',
      organization: 'EC-Council',
      dateEarned: '2023-03-10',
      expiryDate: '2026-03-10',
      credentialId: 'ECC-67890',
      level: 'intermediate',
      category: 'penetration-testing'
    },
    {
      id: 'cert3',
      name: 'CISSP',
      organization: 'ISC²',
      dateEarned: '2023-09-20',
      expiryDate: '2026-09-20',
      credentialId: 'ISC2-11111',
      level: 'expert',
      category: 'general'
    }
  ],
  securityClearance: {
    level: 'secret',
    country: 'US',
    isActive: true,
    expiryDate: '2025-06-15'
  }
};

const statusTypes: UserStatus[] = [
  { type: 'available', customMessage: 'Ready for collaboration' },
  { type: 'busy', customMessage: 'In deep vulnerability analysis' },
  { type: 'away', customMessage: 'Taking a short break' },
  { type: 'in-meeting', customMessage: 'Bug bounty planning session' },
  { type: 'on-hunt', customMessage: 'Actively hunting bugs', isActivelyHunting: true },
  { type: 'analyzing', customMessage: 'Binary analysis in progress' },
  { type: 'offline', lastSeen: '2024-01-15T10:00:00.000Z' }
];

export function StatusBadgeDemo() {
  return (
    <div className="h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Professional Status & Security Badges</h1>
          <p className="text-muted-foreground">
            Enhanced user profiles with status indicators, achievement badges, and certifications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Indicators Demo */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Status Indicators
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusTypes.map((status, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <StatusIndicator status={status} showMessage={true} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* User Card Demo */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Enhanced User Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UserCard 
                user={sampleUser} 
                variant="detailed" 
                showBadges={true}
                showCertifications={true}
                showStatus={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Security Badges Demo */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Security Achievement Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Professional achievements with rarity levels from common to legendary
              </p>
              <BadgeGrid badges={sampleUser.badges || []} size="lg" className="gap-4" />
            </div>
          </CardContent>
        </Card>

        {/* Certifications Demo */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Certificate className="w-5 h-5 text-blue-400" />
              Professional Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Industry certifications with expiration tracking and verification links
              </p>
              <CertificationList 
                certifications={sampleUser.certifications || []} 
                size="md" 
                layout="grid" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Compact User Cards Grid */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>User Cards - Compact View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {statusTypes.slice(0, 4).map((status, index) => (
                <UserCard 
                  key={index}
                  user={{
                    ...sampleUser,
                    id: `user_${index}`,
                    username: `user_${index}`,
                    displayName: `Security Pro ${index + 1}`,
                    status
                  }}
                  variant="compact"
                  showBadges={true}
                  showStatus={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}