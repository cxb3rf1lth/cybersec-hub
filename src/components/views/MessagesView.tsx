import { useState } from 'react';
import { useKVWithFallback } from '@/lib/kv-fallback';
import { ConversationList } from '@/components/messages/ConversationList';
import { ChatInterface } from '@/components/messages/ChatInterface';
import { NewMessageModal } from '@/components/messages/NewMessageModal';
import { Button } from '@/components/ui/button';
import { PencilSimple } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { User, Conversation, Message } from '@/types/user';

interface MessagesViewProps {
  currentUser: User
}

export function MessagesView({ currentUser }: MessagesViewProps) {
  const [conversations, setConversations] = useKVWithFallback<Conversation[]>('conversations', []);
  const [messages, setMessages] = useKVWithFallback<Message[]>('messages', []);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const handleSendMessage = async (content: string, type: 'text' | 'code' = 'text', codeLanguage?: string) => {
    if (!selectedConversation) {return;}

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: currentUser.id,
      receiverId: selectedConversation.participants.find(p => p !== currentUser.id) || '',
      content,
      type,
      codeLanguage,
      isRead: false,
      createdAt: new Date().toISOString(),
      status: 'sent'
    };

    // Add message to messages array
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Update conversation with last message
    setConversations((prevConversations) => 
      prevConversations.map(conv => 
        conv.id === selectedConversation.id 
          ? { 
              ...conv, 
              lastMessage: newMessage, 
              lastMessageAt: newMessage.createdAt 
            }
          : conv
      )
    );

    // Show success toast
    if (type === 'code') {
      toast.success(`Code snippet sent (${codeLanguage})`);
    } else {
      toast.success('Message sent');
    }
  };

  const handleStartConversation = (participantId: string) => {
    // Check if conversation already exists
    const existingConversation = conversations.find(conv => 
      conv.participants.includes(currentUser.id) && 
      conv.participants.includes(participantId) &&
      !conv.isGroup
    );

    if (existingConversation) {
      setSelectedConversationId(existingConversation.id);
      setShowNewMessage(false);
      return;
    }

    // Create new conversation
    const newConversation: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participants: [currentUser.id, participantId],
      lastMessageAt: new Date().toISOString(),
      isGroup: false,
      unreadCount: 0
    };

    setConversations((prevConversations) => [...prevConversations, newConversation]);
    setSelectedConversationId(newConversation.id);
    setShowNewMessage(false);
  };

  const getConversationMessages = (conversationId: string) => {
    return messages.filter(msg => {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) {return false;}
      
      return conversation.participants.includes(msg.senderId) && 
             conversation.participants.includes(msg.receiverId);
    }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  return (
    <div className="h-screen flex">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Messages</h2>
            <Button 
              size="sm" 
              onClick={() => setShowNewMessage(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <PencilSimple className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <ConversationList
          conversations={conversations}
          currentUserId={currentUser.id}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
        />
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatInterface
            conversation={selectedConversation}
            messages={getConversationMessages(selectedConversation.id)}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
              <p>Choose a conversation or start a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
        <NewMessageModal
          currentUser={currentUser}
          onClose={() => setShowNewMessage(false)}
          onStartConversation={handleStartConversation}
        />
      )}
    </div>
  );
}