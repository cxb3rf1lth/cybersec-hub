export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  specializations: Specialization[]
  followers: string[]
  following: string[]
  joinedAt: string
}

export interface Post {
  id: string
  authorId: string
  content: string
  type: 'text' | 'code'
  codeLanguage?: string
  tags: string[]
  likes: string[]
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  authorId: string
  content: string
  createdAt: string
}

export interface CodeSnippet {
  id: string
  title: string
  description: string
  code: string
  language: string
  authorId: string
  tags: string[]
  likes: string[]
  forks: string[]
  createdAt: string
  updatedAt: string
}

export type Specialization = 
  | 'Red Team' 
  | 'Blue Team' 
  | 'Bug Bounty' 
  | 'Penetration Testing' 
  | 'Ethical Hacking' 
  | 'Malware Analysis' 
  | 'Incident Response' 
  | 'Security Research'
  | 'OSINT'
  | 'Reverse Engineering'

export interface Activity {
  id: string
  userId: string
  type: 'post' | 'follow' | 'like' | 'comment' | 'code_snippet'
  targetId?: string
  content?: string
  createdAt: string
}