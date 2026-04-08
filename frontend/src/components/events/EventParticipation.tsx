import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { ThumbsUp, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

type ParticipationStatus = 'interested' | 'going' | 'not_going';

interface Props {
  eventId: string;
  onAuthRequired?: () => void;
}

export const EventParticipation = ({ eventId, onAuthRequired }: Props) => {
  const { user } = useAuthWithBackend();
  const [currentStatus, setCurrentStatus] = useState<ParticipationStatus | null>(null);
  const [counts, setCounts] = useState({ interested: 0, going: 0 });
  const [loading, setLoading] = useState(false);

  // Check if this is a demo event
  const isDemoEvent = eventId && eventId.startsWith('demo-');

  const fetchCounts = useCallback(async () => {
    const { data } = await supabase
      .from('event_participants')
      .select('status')
      .eq('event_id', eventId);
    if (data) {
      setCounts({
        interested: data.filter(p => p.status === 'interested').length,
        going: data.filter(p => p.status === 'going').length,
      });
    }
  }, [eventId]);

  const fetchMyStatus = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('event_participants')
      .select('status')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .maybeSingle();
    setCurrentStatus((data?.status as ParticipationStatus) || null);
  }, [eventId, user]);

  useEffect(() => {
    if (isDemoEvent) {
      // Use mock data for demo events
      setCounts({
        interested: Math.floor(Math.random() * 10) + 5,
        going: Math.floor(Math.random() * 20) + 10
      });
      setCurrentStatus(null); // Demo events start with no participation
    } else {
      fetchCounts();
      if (user) fetchMyStatus();
    }
  }, [eventId, user, isDemoEvent, fetchCounts, fetchMyStatus]);

  const handleClick = async (status: ParticipationStatus) => {
    if (isDemoEvent) {
      // Mock participation for demo events
      if (currentStatus === status) {
        setCurrentStatus(null);
        setCounts(prev => ({
          ...prev,
          [status]: Math.max(0, prev[status] - 1)
        }));
      } else {
        setCurrentStatus(status);
        setCounts(prev => ({
          interested: currentStatus ? prev.interested - 1 : prev.interested,
          going: currentStatus ? prev.going - 1 : prev.going,
          [status]: prev[status] + 1
        }));
      }
      return;
    }

    if (!user) {
      onAuthRequired?.();
      return;
    }
    setLoading(true);
    try {
      if (currentStatus === status) {
        // Remove participation
        await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
        setCurrentStatus(null);
      } else {
        // Add or update participation
        await supabase
          .from('event_participants')
          .upsert({
            event_id: eventId,
            user_id: user.id,
            status,
          });
        setCurrentStatus(status);
      }
      await fetchCounts();
    } catch (error) {
      console.error('Error updating participation:', error);
    } finally {
      setLoading(false);
    }
  };

  const buttons: { status: ParticipationStatus; label: string; icon: typeof ThumbsUp }[] = [
    { status: 'interested', label: 'Interested', icon: ThumbsUp },
    { status: 'going', label: 'Going', icon: Check },
    { status: 'not_going', label: 'Not Going', icon: X },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>👍 Interested: {counts.interested}</span>
        <span>✅ Going: {counts.going}</span>
      </div>
      <div className="flex gap-2">
        {buttons.map(({ status, label, icon: Icon }) => (
          <button
            key={status}
            onClick={() => handleClick(status)}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium uppercase tracking-wider border transition-colors disabled:opacity-50 ${
              currentStatus === status
                ? 'bg-foreground text-background border-foreground'
                : 'border-border hover:border-foreground'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export const EventParticipationCounts = ({ eventId }: { eventId: string }) => {
  const [counts, setCounts] = useState({ interested: 0, going: 0 });

  // Check if this is a demo event
  const isDemoEvent = eventId && eventId.startsWith('demo-');

  useEffect(() => {
    if (isDemoEvent) {
      // Use mock data for demo events
      setCounts({
        interested: Math.floor(Math.random() * 10) + 5,
        going: Math.floor(Math.random() * 20) + 10
      });
    } else {
      const fetch = async () => {
        const { data } = await supabase
          .from('event_participants')
          .select('status')
          .eq('event_id', eventId);
        if (data) {
          setCounts({
            interested: data.filter(p => p.status === 'interested').length,
            going: data.filter(p => p.status === 'going').length,
          });
        }
      };
      fetch();
    }
  }, [eventId, isDemoEvent]);

  if (counts.interested === 0 && counts.going === 0) return null;

  return (
    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
      {counts.interested > 0 && <span>👍 {counts.interested}</span>}
      {counts.going > 0 && <span>✅ {counts.going}</span>}
    </div>
  );
};
