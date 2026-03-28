import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from './Navbar';
import { EventCountdown } from './EventCountdown';
import { EventMeta } from './EventMeta';
import { EventHeader } from './EventHeader';
import { EventDescription } from './EventDescription';
import { EventLocation } from './EventLocation';
import { EventRegistration } from './EventRegistration';
import { EventParticipation } from './EventParticipation';
import { EventChat } from './EventChat';
import { AuthSheet } from './AuthSheet';
import { SEOHead } from './SEOHead';

interface Event {
  id: string;
  title: string;
  creator: string;
  description: string;
  date: string;
  time: string;
  address: string;
  background_image_url: string;
  target_date: string;
  event_type: string;
  event_status: string;
  created_by: string;
}

export const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchEvent();
    checkRegistration();
  }, [id]);

  const fetchEvent = async () => {
    const { data, error } = id
      ? await supabase.from('events').select('*').eq('id', id).maybeSingle()
      : await supabase.from('events').select('*').limit(1).maybeSingle();

    if (error) {
      if (import.meta.env.DEV) console.error('Error fetching event:', error);
      setNotFound(true);
    } else if (!data) {
      setNotFound(true);
    } else {
      setEvent(data as unknown as Event);
    }
    setLoading(false);
  };

  const checkRegistration = async () => {
    if (!id) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { data } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('event_id', id)
      .maybeSingle();
    setIsRegistered(!!data);
  };

  const handleGetDirections = () => {
    if (event) {
      window.open(`https://maps.google.com/maps?q=${encodeURIComponent(event.address)}`, '_blank');
    }
  };

  // Show chat for events that have/had preview type or have messages
  const showChat = event && (event.event_type === 'preview' || event.event_status === 'collecting_interest');

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-foreground text-2xl">Loading...</div>
    </div>;
  }

  if (notFound || !event) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background px-4">
        <SEOHead title="Event Not Found" description="The event you're looking for doesn't exist or has been removed." />
        <Navbar />
        <div className="text-center mt-20">
          <h1 className="text-4xl font-medium mb-4">Event Not Found</h1>
          <p className="text-lg text-muted-foreground mb-8">The event you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/discover')}
            className="px-6 py-3 bg-foreground text-background border border-foreground hover:opacity-90 transition-colors uppercase text-sm font-medium">
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return <>
    <SEOHead
      title={event.title}
      description={event.description.substring(0, 160)}
      image={event.background_image_url}
      keywords={`event, ${event.title}, ${event.address}, community event`}
    />
    <Navbar />

    <main className="flex h-screen justify-center items-start w-full relative bg-background mx-auto my-0 max-lg:flex-col max-lg:h-auto">
      <div className="flex flex-col justify-end items-start fixed h-screen w-[calc(100%-540px)] pl-[49px] pr-[590px] pt-[calc(100vh-97px)] pb-12 left-0 top-0 overflow-hidden max-lg:relative max-lg:w-full max-lg:h-[400px] max-lg:bg-cover max-lg:bg-center max-lg:pt-80 max-lg:pb-6 max-lg:px-4 max-lg:right-0 max-sm:h-[300px] max-sm:pt-60 max-sm:pb-6 max-sm:px-4" role="img" aria-label="Event background image">
        <div className="absolute inset-0 animate-[zoom-in_1.2s_ease-out_forwards]" style={{
          backgroundImage: `url("${event.background_image_url}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}></div>
        <div className="relative z-10 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
          <EventCountdown targetDate={new Date(event.target_date)} />
        </div>
      </div>

      <aside className="flex w-[540px] flex-col justify-start items-start fixed h-screen box-border right-0 top-0 bg-background overflow-y-auto max-lg:relative max-lg:w-full max-lg:h-auto max-lg:right-auto max-lg:top-0 max-lg:overflow-y-visible">
        <div className="flex w-full flex-col items-start gap-10 relative p-10 pb-24 max-lg:w-full max-lg:px-4 max-lg:py-6 max-lg:pb-6 max-lg:gap-8 opacity-0 animate-fade-in [animation-delay:200ms]">
          {/* Event type badge */}
          {event.event_type === 'preview' && (
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-blue-500/20 text-blue-600 border border-blue-500/30">
              Preview Event · {event.event_status === 'collecting_interest' ? 'Collecting Interest' : event.event_status}
            </span>
          )}

          <div className="flex flex-col items-start gap-4 self-stretch relative">
            <EventMeta date={event.date} time={event.time} />
            <EventHeader title={event.title} creator={event.creator} />
          </div>

          <EventDescription description={event.description} />
          <EventLocation address={event.address} onGetDirections={handleGetDirections} />

          {/* Participation */}
          <EventParticipation eventId={event.id} onAuthRequired={() => setIsAuthOpen(true)} />

          {/* Chat for preview events */}
          {showChat && (
            <EventChat eventId={event.id} eventCreatorId={event.created_by} eventStatus={event.event_status} />
          )}
        </div>

        <div className="fixed bottom-0 right-0 w-[540px] bg-background py-6 border-t border-border max-lg:relative max-lg:w-full max-lg:py-6 max-lg:border-t-0">
          <div className="px-10 max-lg:px-4">
            <EventRegistration
              eventId={event.id}
              onRegister={checkRegistration}
              isRegistered={isRegistered}
              onAuthRequired={() => setIsAuthOpen(true)}
              targetDate={new Date(event.target_date)}
              className="opacity-0 animate-fade-in [animation-delay:400ms]"
            />
          </div>
        </div>
      </aside>
    </main>
    <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
  </>;
};
