/**
 * Production Real-time Messaging Service
 * WebSocket-based messaging with encryption, file sharing, and security features
 */

import { useKVWithFallback } from '@/lib/kv-fallback'
import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { messagingService, webSocketService } from '@/lib/production-services'

export interface Message {
  id: string
  chatId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  type: 'text' | 'image' | 'file' | 'code' | 'vulnerability' | 'system'
  timestamp: string
  edited?: boolean
  editedAt?: string
  replyTo?: {
    messageId: string
    content: string
    senderName: string
  }
  reactions: Array<{
    userId: string
    emoji: string
    timestamp: string
  }>
  metadata?: {
    fileName?: string
    fileSize?: number
    mimeType?: string
    codeLanguage?: string
    vulnSeverity?: 'low' | 'medium' | 'high' | 'critical'
    encrypted?: boolean
  }
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  encrypted: boolean
}

export interface Chat {
  id: string
  type: 'direct' | 'group' | 'team' | 'public'
  name?: string
  description?: string
  avatar?: string
  participants: Array<{
    userId: string
    name: string
    avatar?: string
    role: 'member' | 'admin' | 'owner'
    joinedAt: string
    lastSeen?: string
    permissions: {
      sendMessages: boolean
      editMessages: boolean
      deleteMessages: boolean
      addMembers: boolean
      removeMembers: boolean
    }
  }>
  lastMessage?: {
    content: string
    senderId: string
    timestamp: string
  }
  unreadCount: number
  createdAt: string
  settings: {
    encryptionEnabled: boolean
    allowFileSharing: boolean
    allowExternalLinks: boolean
    retentionDays?: number
    maxFileSize: number
  }
  metadata?: {
    projectId?: string
    teamId?: string
    isArchived: boolean
    tags: string[]
  }
}

export interface TypingIndicator {
  chatId: string
  userId: string
  userName: string
  timestamp: string
}

export interface OnlineStatus {
  userId: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: string
  customStatus?: string
}

// Encryption utilities
class MessageEncryption {
  private static generateKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    )
  }

  static async encrypt(message: string, key: CryptoKey): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      data
    )

    return { encrypted, iv }
  }

  static async decrypt(encryptedData: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<string> {
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encryptedData
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  }
}

// WebSocket connection management
class MessageWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private heartbeatInterval: number | null = null
  private listeners: Map<string, Set<Function>> = new Map()

  connect(userId: string, onMessage: (data: any) => void, onStatusChange: (status: string) => void) {
    try {
      const wsUrl = `wss://api.cyberconnect.io/messaging?userId=${userId}&token=${this.getAuthToken()}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('Messaging WebSocket connected')
        onStatusChange('connected')
        this.reconnectAttempts = 0
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'heartbeat') {
            this.handleHeartbeat()
            return
          }

          onMessage(data)
          this.notifyListeners(data.type, data)
        } catch (error) {
          console.error('Failed to parse message:', error)
        }
      }

      this.ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason)
        onStatusChange('disconnected')
        this.stopHeartbeat()
        
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect(userId, onMessage, onStatusChange)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        onStatusChange('error')
      }
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error)
      onStatusChange('error')
    }
  }

  private reconnect(userId: string, onMessage: (data: any) => void, onStatusChange: (status: string) => void) {
    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    
    setTimeout(() => {
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
      this.connect(userId, onMessage, onStatusChange)
    }, delay)
  }

  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'heartbeat', timestamp: Date.now() })
      }
    }, 30000)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private handleHeartbeat() {
    // Server responded to heartbeat - connection is alive
  }

  send(data: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
      return true
    }
    return false
  }

  subscribe(eventType: string, callback: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(callback)
  }

  unsubscribe(eventType: string, callback: Function) {
    this.listeners.get(eventType)?.delete(callback)
  }

  private notifyListeners(eventType: string, data: any) {
    this.listeners.get(eventType)?.forEach(callback => callback(data))
  }

  disconnect() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  private getAuthToken(): string {
    return localStorage.getItem('authToken') || ''
  }
}

// File upload service
class FileUploadService {
  static async uploadFile(file: File, chatId: string, onProgress?: (progress: number) => void): Promise<{ fileId: string; url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('chatId', chatId)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100
            onProgress(progress)
          }
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          resolve(response)
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`))
        }
      }

      xhr.onerror = () => reject(new Error('Upload failed'))

      xhr.open('POST', '/api/messaging/upload')
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('authToken')}`)
      xhr.send(formData)
    })
  }

  static async deleteFile(fileId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/messaging/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      return response.ok
    } catch (error) {
      console.error('Failed to delete file:', error)
      return false
    }
  }
}

export function useRealMessaging(currentUserId: string) {
  const [chats, setChats] = useKVWithFallback<Chat[]>('userChats', [])
  const [messages, setMessages] = useKVWithFallback<Record<string, Message[]>>('chatMessages', {})
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([])
  const [onlineUsers, setOnlineUsers] = useState<OnlineStatus[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')
  const [isLoading, setIsLoading] = useState(false)

  const wsRef = useRef<MessageWebSocket | null>(null)
  const typingTimeoutRef = useRef<Record<string, number>>({})
  const encryptionKeysRef = useRef<Record<string, CryptoKey>>({})

  useEffect(() => {
    initializeWebSocket()
    return () => {
      wsRef.current?.disconnect()
    }
  }, [currentUserId])

  const initializeWebSocket = useCallback(async () => {
    if (!currentUserId) return

    try {
      // Initialize messaging service with production WebSocket
      await messagingService.initializeMessaging(currentUserId)
      
      // Set up event handlers for real-time messaging
      webSocketService.on('message', handleNewMessage)
      webSocketService.on('message_update', handleMessageUpdate)
      webSocketService.on('typing_start', handleTypingStart)
      webSocketService.on('typing_stop', handleTypingStop)
      webSocketService.on('user_status', handleUserStatusUpdate)
      webSocketService.on('chat_update', handleChatUpdate)
      webSocketService.on('message_reaction', handleMessageReaction)
      
      setConnectionStatus('connected')
    } catch (error) {
      console.error('Failed to initialize messaging:', error)
      setConnectionStatus('error')
    }
  }, [currentUserId])

  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'message':
        handleNewMessage(data.payload)
        break
      case 'message_update':
        handleMessageUpdate(data.payload)
        break
      case 'typing_start':
        handleTypingStart(data.payload)
        break
      case 'typing_stop':
        handleTypingStop(data.payload)
        break
      case 'user_status':
        handleUserStatusUpdate(data.payload)
        break
      case 'chat_update':
        handleChatUpdate(data.payload)
        break
      case 'message_reaction':
        handleMessageReaction(data.payload)
        break
    }
  }, [])

  const handleNewMessage = useCallback((messageData: Message) => {
    setMessages(current => ({
      ...current,
      [messageData.chatId]: [...(current[messageData.chatId] || []), messageData]
    }))

    // Update chat's last message
    setChats(current => 
      current.map(chat => 
        chat.id === messageData.chatId
          ? {
              ...chat,
              lastMessage: {
                content: messageData.content,
                senderId: messageData.senderId,
                timestamp: messageData.timestamp
              },
              unreadCount: messageData.senderId !== currentUserId ? chat.unreadCount + 1 : chat.unreadCount
            }
          : chat
      )
    )

    // Show notification for messages from others
    if (messageData.senderId !== currentUserId) {
      showMessageNotification(messageData)
    }
  }, [currentUserId])

  const handleMessageUpdate = useCallback((updateData: { messageId: string; chatId: string; updates: Partial<Message> }) => {
    setMessages(current => ({
      ...current,
      [updateData.chatId]: current[updateData.chatId]?.map(msg => 
        msg.id === updateData.messageId ? { ...msg, ...updateData.updates } : msg
      ) || []
    }))
  }, [])

  const handleTypingStart = useCallback((typingData: TypingIndicator) => {
    setTypingIndicators(current => [
      ...current.filter(t => !(t.chatId === typingData.chatId && t.userId === typingData.userId)),
      typingData
    ])

    // Clear typing indicator after 5 seconds
    setTimeout(() => {
      setTypingIndicators(current => 
        current.filter(t => !(t.chatId === typingData.chatId && t.userId === typingData.userId))
      )
    }, 5000)
  }, [])

  const handleTypingStop = useCallback((typingData: Pick<TypingIndicator, 'chatId' | 'userId'>) => {
    setTypingIndicators(current => 
      current.filter(t => !(t.chatId === typingData.chatId && t.userId === typingData.userId))
    )
  }, [])

  const handleUserStatusUpdate = useCallback((statusData: OnlineStatus) => {
    setOnlineUsers(current => {
      const filtered = current.filter(u => u.userId !== statusData.userId)
      return [...filtered, statusData]
    })
  }, [])

  const handleChatUpdate = useCallback((chatData: Partial<Chat> & { id: string }) => {
    setChats(current => 
      current.map(chat => 
        chat.id === chatData.id ? { ...chat, ...chatData } : chat
      )
    )
  }, [])

  const handleMessageReaction = useCallback((reactionData: { messageId: string; chatId: string; reaction: any }) => {
    setMessages(current => ({
      ...current,
      [reactionData.chatId]: current[reactionData.chatId]?.map(msg => 
        msg.id === reactionData.messageId 
          ? { 
              ...msg, 
              reactions: [
                ...msg.reactions.filter(r => !(r.userId === reactionData.reaction.userId && r.emoji === reactionData.reaction.emoji)),
                reactionData.reaction
              ]
            }
          : msg
      ) || []
    }))
  }, [])

  const showMessageNotification = useCallback((message: Message) => {
    if (Notification.permission === 'granted') {
      const chat = chats.find(c => c.id === message.chatId)
      const chatName = chat?.name || message.senderName
      
      new Notification(`${message.senderName} in ${chatName}`, {
        body: message.type === 'text' ? message.content : `Sent a ${message.type}`,
        icon: message.senderAvatar || '/default-avatar.png',
        tag: message.chatId
      })
    }
  }, [chats])

  const sendMessage = useCallback(async (
    chatId: string,
    content: string,
    type: Message['type'] = 'text',
    replyTo?: Message['replyTo'],
    metadata?: Message['metadata']
  ): Promise<Message> => {
    try {
      // Use production messaging service
      const message = await messagingService.sendMessage(chatId, content, type)
      
      // Update local state
      setMessages(current => ({
        ...current,
        [chatId]: [...(current[chatId] || []), message]
      }))

      // Update chat's last message
      setChats(current => 
        current.map(chat => 
          chat.id === chatId
            ? {
                ...chat,
                lastMessage: {
                  content: message.content,
                  senderId: message.senderId,
                  timestamp: message.timestamp
                }
              }
            : chat
        )
      )

      return message
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
      throw error
    }
  }, [])

  const sendFile = useCallback(async (chatId: string, file: File, onProgress?: (progress: number) => void): Promise<Message> => {
    try {
      setIsLoading(true)
      
      // Use production file upload service
      const result = await messagingService.uploadFile(chatId, file)
      
      // Create message with file
      const message = await sendMessage(
        chatId,
        result.url,
        file.type.startsWith('image/') ? 'image' : 'file',
        undefined,
        {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type
        }
      )

      return message
    } catch (error) {
      console.error('File send failed:', error)
      toast.error('Failed to send file')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [sendMessage])

  const editMessage = useCallback(async (messageId: string, chatId: string, newContent: string): Promise<void> => {
    const message = messages[chatId]?.find(m => m.id === messageId)
    if (!message || message.senderId !== currentUserId) {
      throw new Error('Cannot edit this message')
    }

    const sent = wsRef.current?.send({
      type: 'edit_message',
      payload: {
        messageId,
        chatId,
        content: newContent,
        editedAt: new Date().toISOString()
      }
    })

    if (!sent) {
      throw new Error('Failed to edit message')
    }
  }, [messages, currentUserId])

  const deleteMessage = useCallback(async (messageId: string, chatId: string): Promise<void> => {
    const message = messages[chatId]?.find(m => m.id === messageId)
    if (!message || message.senderId !== currentUserId) {
      throw new Error('Cannot delete this message')
    }

    const sent = wsRef.current?.send({
      type: 'delete_message',
      payload: { messageId, chatId }
    })

    if (!sent) {
      throw new Error('Failed to delete message')
    }

    // Remove locally
    setMessages(current => ({
      ...current,
      [chatId]: current[chatId]?.filter(msg => msg.id !== messageId) || []
    }))
  }, [messages, currentUserId])

  const addReaction = useCallback(async (messageId: string, chatId: string, emoji: string): Promise<void> => {
    const sent = wsRef.current?.send({
      type: 'add_reaction',
      payload: {
        messageId,
        chatId,
        emoji,
        userId: currentUserId,
        timestamp: new Date().toISOString()
      }
    })

    if (!sent) {
      throw new Error('Failed to add reaction')
    }
  }, [currentUserId])

  const startTyping = useCallback((chatId: string) => {
    // Clear existing timeout for this chat
    if (typingTimeoutRef.current[chatId]) {
      clearTimeout(typingTimeoutRef.current[chatId])
    }

    wsRef.current?.send({
      type: 'typing_start',
      payload: { chatId, userId: currentUserId, userName: 'You' }
    })

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current[chatId] = window.setTimeout(() => {
      stopTyping(chatId)
    }, 3000)
  }, [currentUserId])

  const stopTyping = useCallback((chatId: string) => {
    if (typingTimeoutRef.current[chatId]) {
      clearTimeout(typingTimeoutRef.current[chatId])
      delete typingTimeoutRef.current[chatId]
    }

    wsRef.current?.send({
      type: 'typing_stop',
      payload: { chatId, userId: currentUserId }
    })
  }, [currentUserId])

  const createChat = useCallback(async (type: Chat['type'], participants: string[], name?: string): Promise<Chat> => {
    const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newChat: Chat = {
      id: chatId,
      type,
      name,
      participants: participants.map(userId => ({
        userId,
        name: 'User', // Would be resolved from user service
        role: userId === currentUserId ? 'owner' : 'member',
        joinedAt: new Date().toISOString(),
        permissions: {
          sendMessages: true,
          editMessages: false,
          deleteMessages: false,
          addMembers: type === 'group',
          removeMembers: false
        }
      })),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      settings: {
        encryptionEnabled: type === 'direct',
        allowFileSharing: true,
        allowExternalLinks: true,
        maxFileSize: 100 * 1024 * 1024 // 100MB
      },
      metadata: {
        isArchived: false,
        tags: []
      }
    }

    const sent = wsRef.current?.send({
      type: 'create_chat',
      payload: newChat
    })

    if (!sent) {
      throw new Error('Failed to create chat')
    }

    setChats(current => [newChat, ...current])
    return newChat
  }, [currentUserId])

  const markAsRead = useCallback((chatId: string) => {
    setChats(current => 
      current.map(chat => 
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    )

    wsRef.current?.send({
      type: 'mark_read',
      payload: { chatId, userId: currentUserId }
    })
  }, [currentUserId])

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        toast.success('Notifications enabled')
      }
    }
  }, [])

  return {
    chats,
    messages,
    typingIndicators,
    onlineUsers,
    connectionStatus,
    isLoading,
    sendMessage,
    sendFile,
    editMessage,
    deleteMessage,
    addReaction,
    startTyping,
    stopTyping,
    createChat,
    markAsRead,
    requestNotificationPermission
  }
}