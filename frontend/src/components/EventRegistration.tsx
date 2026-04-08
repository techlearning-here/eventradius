import React, { useState, useEffect } from 'react';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { apiClient } from '@/integrations/backend/api';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';

interface EventRegistrationProps {
  eventId: string;
  onRegister: () => void;
  isRegistered: boolean;
  className?: string;
  onAuthRequired?: () => void;
  targetDate?: Date;
}

export const EventRegistration: React.FC<EventRegistrationProps> = ({
  eventId,
  onRegister,
  isRegistered: initialIsRegistered,
  className = "",
  onAuthRequired,
  targetDate
}) => {
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthWithBackend();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkRegistration();
    }
  }, [user, eventId]);

  const checkRegistration = async () => {
    try {
      // Check if user is participating in the event
      const response = await apiClient.get(`/api/events/${eventId}/participants`);
      const participants = response.data || [];
      const isUserParticipating = participants.some((p: any) => p.user_id === user?.id);
      setIsRegistered(isUserParticipating);
    } catch (error) {
      // If error, assume not registered
      setIsRegistered(false);
    }
  };

  const getEventStatus = () => {
    if (!targetDate) return 'upcoming';
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const distance = target - now;
    const oneHour = 1000 * 60 * 60;

    if (distance < -oneHour) return 'ended';
    if (distance >= -oneHour && distance <= oneHour) return 'happening';
    return 'upcoming';
  };

  const eventStatus = getEventStatus();
  const isPastEvent = eventStatus === 'ended';

  const handleRegister = async () => {
    if (isPastEvent) {
      toast({
        title: 'Event has ended',
        description: 'You cannot register for past events',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to register for events',
          variant: 'destructive'
        });
      }
      return;
    }

    setLoading(true);

    try {
      if (isRegistered) {
        // Leave event
        await apiClient.post(`/api/events/${eventId}/leave`);
        setIsRegistered(false);
        toast({
          title: 'Left Event',
          description: 'You have left this event'
        });
      } else {
        // Join event
        await apiClient.post(`/api/events/${eventId}/join`);
        setIsRegistered(true);
        onRegister();
        toast({
          title: 'Joined Event!',
          description: 'You have successfully joined this event'
        });
      }
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`group flex items-center self-stretch relative overflow-hidden ${className}`}>
      <button
        onClick={handleRegister}
        disabled={loading || isPastEvent}
        className={`flex h-[50px] justify-center items-center gap-2.5 border relative px-2.5 py-3.5 border-solid transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed w-[calc(100%-50px)] z-10 ${
          isPastEvent
            ? 'bg-gray-400 border-gray-400 cursor-not-allowed'
            : 'bg-[#1A1A1A] border-[#1A1A1A] group-hover:w-full group-hover:bg-[#FA76FF] group-hover:border-[#FA76FF]'
        }`}
        aria-label={isPastEvent ? "Event has ended" : isRegistered ? "Unregister from event" : "Register for event"}
      >
        <span className={`text-white text-[13px] font-normal uppercase relative transition-colors duration-300 ${!isPastEvent && 'group-hover:text-black'}`}>
          {loading ? "LOADING..." : isPastEvent ? "EVENT ENDED" : isRegistered ? "UNREGISTER" : "REGISTER"}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-[18px] opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100"
          aria-hidden="true"
        >
          <path d="M0.857178 6H10.3929" stroke="#1A1A1A" strokeWidth="1.5" />
          <path d="M6.39282 10L10.3928 6L6.39282 2" stroke="#1A1A1A" strokeWidth="1.5" />
        </svg>
      </button>
      {!isPastEvent && (
        <div className="flex w-[50px] h-[50px] justify-center items-center border absolute right-0 bg-white rounded-[99px] border-solid border-[#1A1A1A] transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:scale-50 pointer-events-none z-0">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="arrow-icon"
          aria-hidden="true"
        >
          <path d="M0.857178 6H10.3929" stroke="#1A1A1A" strokeWidth="1.5" />
          <path d="M6.39282 10L10.3928 6L6.39282 2" stroke="#1A1A1A" strokeWidth="1.5" />
        </svg>
        </div>
      )}
    </div>
  );
};
