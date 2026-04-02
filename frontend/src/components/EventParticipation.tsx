import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchCounts();
    if (user) fetchMyStatus();
  }, [eventId, user]);

  const fetchCounts = async () => {
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

  const fetchMyStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('event_participants')
      .select('status')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .maybeSingle();
    setCurrentStatus((data?.status as ParticipationStatus) || null);
  };

  const handleClick = async (status: ParticipationStatus) => {
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
      } else if (currentStatus) {
        // Update
        await supabase
          .from('event_participants')
          .update({ status })
          .eq('event_id', eventId)
          .eq('user_id', user.id);
        setCurrentStatus(status);
      } else {
        // Insert
        await supabase
          .from('event_participants')
          .insert({ event_id: eventId, user_id: user.id, status });
        setCurrentStatus(status);
      }
      await fetchCounts();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e) || 'Failed to update');
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

  useEffect(() => {
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
  }, [eventId]);

  if (counts.interested === 0 && counts.going === 0) return null;

  return (
    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
      {counts.interested > 0 && <span>👍 {counts.interested}</span>}
      {counts.going > 0 && <span>✅ {counts.going}</span>}
    </div>
  );
};
