# CyberConnect Messaging System

## Overview
The messaging system provides real-time communication between cybersecurity professionals, supporting both text and code sharing capabilities.

## Features

### Core Messaging
- **Direct Messages**: One-on-one conversations between users
- **Text Messages**: Standard text communication
- **Code Snippets**: Share code with syntax highlighting for various languages
- **Real-time Status**: Message delivery and read status indicators

### User Experience
- **Conversation List**: View all active conversations with unread indicators
- **Message History**: Persistent message storage across sessions
- **Search Users**: Find and start conversations with other professionals
- **Unread Notifications**: Badge indicators in the sidebar for new messages

### Code Languages Supported
- JavaScript, Python, Bash, PowerShell
- C, C++, Java, Go, Rust
- SQL, YAML, JSON, XML, HTML, CSS

## Components

### MessagesView
Main container component that manages conversations and chat interface

### ConversationList
- Displays all user conversations
- Shows last message preview
- Indicates unread message counts
- Sorted by most recent activity

### ChatInterface
- Message display with sender avatars
- Text and code message types
- Real-time message input
- Language selection for code snippets

### NewMessageModal
- Search and select users to start conversations
- Filter by specializations
- User profile preview with expertise badges

## Data Structure

### Message
```typescript
{
  id: string
  senderId: string
  receiverId: string
  content: string
  type: 'text' | 'code' | 'file'
  codeLanguage?: string
  isRead: boolean
  status: 'sending' | 'sent' | 'delivered' | 'read'
  createdAt: string
}
```

### Conversation
```typescript
{
  id: string
  participants: string[]
  lastMessage?: Message
  lastMessageAt: string
  isGroup: boolean
  unreadCount: number
}
```

## Integration Points
- Links with user profiles in Explore section
- Integrates with existing authentication system
- Uses shared user data store
- Provides navigation from user discovery to messaging

## Future Enhancements
- Group messaging for security teams
- File attachments and image sharing
- Message encryption for sensitive communications
- Video/voice calling capabilities
- Message reactions and threading