import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/integrations/backend/api';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

interface Message {
  id: string;
  message_text: string;
  created_at: string;
  sender_name: string;
}

interface Props {
  eventId: string;
  eventCreatorId: string;
  eventStatus: string;
}

export const EventChat = ({ eventId, eventCreatorId, eventStatus }: Props) => {
  const { user } = useAuthWithBackend();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [canPost, setCanPost] = useState(false);

  const isReadOnly = eventStatus === 'completed';

  const checkCanPost = useCallback(async () => {
    if (!user) return;
    // Organizer can always post
    if (user.id === eventCreatorId) {
      setCanPost(true);
      return;
    }
    // Check if user is "going" using backend API
    try {
      const registrations = await apiClient.getUserEvents();
      const isParticipant = registrations.participating.some(event => event.id === eventId);
      setCanPost(isParticipant);
    } catch (error) {
      console.error('Error checking participation:', error);
      setCanPost(false);
    }
  }, [user, eventId, eventCreatorId]);

  const fetchMessages = useCallback(async () => {
    if (!user || isReadOnly) return;
    try {
      const messages = await apiClient.getEventMessages(eventId);
      setMessages(messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  }, [eventId, user, isReadOnly]);

  const sendMessage = useCallback(async () => {
    if (!user || !newMessage.trim() || isReadOnly) return;
    setSending(true);
    try {
      const message = await apiClient.sendEventMessage(eventId, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  }, [user, newMessage, eventId, isReadOnly]);

  const handleSend = () => {
    sendMessage();
  };

  useEffect(() => {
    fetchMessages();
    if (user) checkCanPost();
  }, [eventId, user, fetchMessages, checkCanPost]);

  return (
    <div className="border border-border">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Event Chat</h3>
        {isReadOnly && (
          <p className="text-[10px] text-muted-foreground mt-1">This event has ended. Chat is read-only.</p>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No messages yet</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs">{msg.sender_name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm mt-0.5">{msg.message_text}</p>
            </div>
          ))
        )}
      </div>

      {!isReadOnly && canPost && user && (
        <div className="flex items-center gap-2 p-3 border-t border-border">
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          />
          <button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="p-2 bg-foreground text-background hover:opacity-90 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
      {!isReadOnly && user && !canPost && (
        <p className="text-[10px] text-muted-foreground text-center py-3 border-t border-border">
          Mark "Going" to join the chat
        </p>
      )}
    </div>
  );
};
