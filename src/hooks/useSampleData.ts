import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { User } from '@/types/user'

const SAMPLE_USERS: User[] = [
  {
    id: 'user_sample_1',
    username: 'alex_hunter',
    email: 'alex@cyberconnect.com',
    bio: 'Penetration tester with 5+ years experience in web application security',
    specializations: ['Penetration Testing', 'Bug Bounty', 'Ethical Hacking'],
    followers: ['user_sample_2', 'user_sample_3'],
    following: ['user_sample_2'],
    joinedAt: '2023-01-15T10:00:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user_sample_2',
    username: 'maya_defense',
    email: 'maya@cyberconnect.com',
    bio: 'Blue team specialist focused on incident response and threat hunting',
    specializations: ['Blue Team', 'Incident Response', 'Threat Hunting'],
    followers: ['user_sample_1', 'user_sample_3'],
    following: ['user_sample_1', 'user_sample_3'],
    joinedAt: '2023-02-20T14:30:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user_sample_3',
    username: 'code_ninja',
    email: 'ninja@cyberconnect.com',
    bio: 'Malware researcher and reverse engineering expert',
    specializations: ['Malware Analysis', 'Reverse Engineering', 'Security Research'],
    followers: ['user_sample_1'],
    following: ['user_sample_2'],
    joinedAt: '2023-03-10T09:15:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user_sample_4',
    username: 'red_phantom',
    email: 'phantom@cyberconnect.com',
    bio: 'Red team operative specializing in social engineering and physical security',
    specializations: ['Red Team', 'Social Engineering', 'Physical Security'],
    followers: [],
    following: ['user_sample_1', 'user_sample_2'],
    joinedAt: '2023-04-05T16:45:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  }
]

export function useSampleData() {
  const [allUsers, setAllUsers] = useKV<User[]>('allUsers', [])

  useEffect(() => {
    // Only initialize sample data if no users exist
    if (allUsers.length === 0) {
      setAllUsers(SAMPLE_USERS)
    }
  }, [allUsers.length, setAllUsers])
}