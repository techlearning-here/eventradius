import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [canPost, setCanPost] = useState(false);

  const isReadOnly = eventStatus === 'completed';

  useEffect(() => {
    fetchMessages();
    if (user) checkCanPost();
  }, [eventId, user]);

  const checkCanPost = async () => {
    if (!user) return;
    // Organizer can always post
    if (user.id === eventCreatorId) {
      setCanPost(true);
      return;
    }
    // Check if user is "going"
    const { data } = await supabase
      .from('event_participants')
      .select('status')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .maybeSingle();
    setCanPost(data?.status === 'going');
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('event_messages')
      .select('id, message_text, created_at, sender_user_id')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (!data) return;

    // Fetch sender names
    const userIds = [...new Set(data.map(m => m.sender_user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', userIds);

    const nameMap: Record<string, string> = {};
    (profiles || []).forEach(p => { nameMap[p.user_id] = p.display_name || 'User'; });

    setMessages(data.map(m => ({
      id: m.id,
      message_text: m.message_text,
      created_at: m.created_at,
      sender_name: nameMap[m.sender_user_id] || 'User',
    })));
  };

  const handleSend = async () => {
    if (!user || !newMessage.trim() || isReadOnly) return;
    setSending(true);
    try {
      const { error } = await supabase.from('event_messages').insert({
        event_id: eventId,
        sender_user_id: user.id,
        message_text: newMessage.trim(),
      });
      if (error) throw error;
      setNewMessage('');
      await fetchMessages();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e) || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

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
