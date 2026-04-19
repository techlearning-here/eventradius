import React from 'react';
import { EventMeta } from './EventMeta';
import { EventHeader } from './EventHeader';
import { EventDescription } from './EventDescription';
import { EventLocation } from './EventLocation';
import { EventParticipation } from '../EventParticipation';
import { EventRegistration } from './EventRegistration';
import { EventChat } from './EventChat';
import { EventCountdown } from './EventCountdown';
import { AuthSheet } from './AuthSheet';

interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  image_url?: string;
  category?: string;
  max_participants?: number;
  is_public: boolean;
  organizer_id: string;
  created_at: string;
  updated_at: string;
  current_participants?: number;
  is_paid_event?: boolean;
  ticket_pricing_description?: string;
  ticketing_website?: string;
  timezone?: string;
  organizer_email?: string;
  organizer_phone?: string;
  organizer_website?: string;
  // Legacy fields for compatibility
  creator?: string;
  date?: string;
  time?: string;
  address?: string;
  background_image_url?: string;
  target_date?: string;
  event_type?: string;
  event_status?: string;
  created_by?: string;
}

interface EventDetailsDisplayProps {
  event: Event;
  isRegistered?: boolean;
  onRegister?: () => void;
  onAuthRequired?: () => void;
  showRegistration?: boolean;
  showChat?: boolean;
  showCountdown?: boolean;
  className?: string;
  containerClassName?: string;
}

export const EventDetailsDisplay: React.FC<EventDetailsDisplayProps> = ({
  event,
  isRegistered = false,
  onRegister,
  onAuthRequired,
  showRegistration = true,
  showChat = true,
  showCountdown = true,
  className = "",
  containerClassName = ""
}) => {
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const [registered, setRegistered] = React.useState(isRegistered);

  const handleGetDirections = () => {
    if (event) {
      window.open(`https://maps.google.com/maps?q=${encodeURIComponent(event.address)}`, '_blank');
    }
  };

  const handleAuthRequired = () => {
    setIsAuthOpen(true);
    onAuthRequired?.();
  };

  const handleRegister = () => {
    setRegistered(true);
    onRegister?.();
  };

  const shouldShowChat = showChat && event && (event.event_type === 'preview' || event.event_status === 'collecting_interest');

  return (
    <div className={`flex h-screen justify-center items-start w-full relative bg-background mx-auto my-0 max-lg:flex-col max-lg:h-auto ${containerClassName}`}>
      {/* Background Image Section */}
      <div className="flex flex-col justify-end items-start fixed h-screen w-[calc(100%-540px)] pl-[49px] pr-[590px] pt-[calc(100vh-97px)] pb-12 left-0 top-0 overflow-hidden max-lg:relative max-lg:w-full max-lg:h-[400px] max-lg:bg-cover max-lg:bg-center max-lg:pt-80 max-lg:pb-6 max-lg:px-4 max-lg:right-0 max-sm:h-[300px] max-sm:pt-60 max-sm:pb-6 max-sm:px-4" role="img" aria-label="Event background image">
        <div className="absolute inset-0 animate-[zoom-in_1.2s_ease-out_forwards]" style={{
          backgroundImage: event.background_image_url 
            ? `url("${event.background_image_url}")` 
            : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          backgroundSize: event.background_image_url ? 'cover' : 'auto',
          backgroundPosition: 'center'
        }}></div>
        
        {showCountdown && event.target_date && (
          <div className="relative z-10 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
            <EventCountdown targetDate={new Date(event.target_date)} />
          </div>
        )}
      </div>

      {/* Event Content Sidebar */}
      <aside className="flex w-[540px] flex-col justify-start items-start fixed h-screen box-border right-0 top-0 bg-background overflow-y-auto max-lg:relative max-lg:w-full max-lg:h-auto max-lg:right-auto max-lg:top-0 max-lg:overflow-y-visible">
        <div className={`flex w-full flex-col items-start gap-10 relative p-10 pb-24 max-lg:w-full max-lg:px-4 max-lg:py-6 max-lg:pb-6 max-lg:gap-8 opacity-0 animate-fade-in [animation-delay:200ms] ${className}`}>
          {/* Event type badge */}
          {event.event_type === 'preview' && (
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-blue-500/20 text-blue-600 border border-blue-500/30">
              Preview Event · {event.event_status === 'collecting_interest' ? 'Collecting Interest' : event.event_status}
            </span>
          )}

          <div className="flex flex-col items-start gap-4 self-stretch relative">
            <EventMeta 
              date={event.date} 
              time={event.time} 
              timezone={event.timezone} 
              contact={{
                email: event.organizer_email,
                phone: event.organizer_phone,
                website: event.organizer_website
              }} 
            />
            <EventHeader title={event.title} creator={event.creator} />
          </div>

          <EventDescription description={event.description} />
          <EventLocation address={event.address} onGetDirections={handleGetDirections} />

          {/* Participation */}
          <EventParticipation eventId={event.id} event={event} onAuthRequired={handleAuthRequired} />

          {/* Chat for preview events */}
          {shouldShowChat && (
            <EventChat eventId={event.id} eventCreatorId={event.created_by} eventStatus={event.event_status} />
          )}
        </div>

        {/* Registration Section */}
        {showRegistration && (
          <div className="fixed bottom-0 right-0 w-[540px] bg-background py-6 border-t border-border max-lg:relative max-lg:w-full max-lg:py-6 max-lg:border-t-0">
            <div className="px-10 max-lg:px-4">
              <EventRegistration
                eventId={event.id}
                onRegister={handleRegister}
                isRegistered={registered}
                onAuthRequired={handleAuthRequired}
                targetDate={new Date(event.target_date)}
                className="opacity-0 animate-fade-in [animation-delay:400ms]"
              />
            </div>
          </div>
        )}
      </aside>

      {/* Authentication Modal */}
      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};
