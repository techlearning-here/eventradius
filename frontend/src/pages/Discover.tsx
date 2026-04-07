import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { useEvents } from '@/hooks/useEvents';
import { CalendarIcon, MapPin, Plus, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/data/cities';
import { SEOHead } from '@/components/SEOHead';
import { EventParticipationCounts } from '@/components/EventParticipation';
import { type Event } from '@/integrations/backend/api';


interface UserPrefs {
  interests: string[];
  has_kids: boolean;
  latitude: number | null;
  longitude: number | null;
  distance_range: number;
  city: string | null;
}

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 3959;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const EventCard = ({ event }: { event: Event }) => {
  const navigate = useNavigate();
  const catLabel = CATEGORIES.find(c => c.id === event.category)?.label || event.category;

  return (
    <div className="relative cursor-pointer group" onClick={() => navigate(`/event/${event.id}`)}>
      <div className="overflow-hidden mb-3">
        {event.image_url && event.image_url.trim() !== '' ? (
          <div className="aspect-[4/3] bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
            style={{ backgroundImage: `url(${event.image_url})` }} />
        ) : (
          <div className="aspect-[4/3] bg-muted flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-110">
            <div className="text-muted-foreground text-4xl opacity-30">📅</div>
          </div>
        )}
      </div>
      <div className="absolute top-4 left-4 flex flex-col gap-0">
        {event.start_time && (
          <div className="bg-background border border-foreground px-3 h-[23px] flex items-center">
            <div className="text-[11px] font-medium uppercase leading-none">
              {format(new Date(event.start_time), 'MMM d')}
            </div>
          </div>
        )}
        {event.start_time && (
          <div className="bg-background border border-t-0 border-foreground px-3 h-[23px] flex items-center">
            <div className="text-[11px] font-medium leading-none">
              {format(new Date(event.start_time), 'h:mm a')}
            </div>
          </div>
        )}
      </div>
      <div className="absolute top-4 right-4 flex flex-col gap-1">
        {!event.is_public && (
          <span className="bg-blue-500/20 border border-blue-500/30 px-2 h-[23px] flex items-center text-[10px] font-medium uppercase text-blue-400">
            Private
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] uppercase font-medium text-muted-foreground">{catLabel}</span>
        <span className="text-[10px] font-semibold text-green-400">FREE</span>
      </div>
      <h3 className="text-lg font-medium text-foreground">{event.title}</h3>
      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1 text-foreground/80">
        <MapPin className="w-3 h-3" /> {event.location || 'Online'}
      </p>
      <div className="mt-1">
        <EventParticipationCounts eventId={event.id} />
      </div>
    </div>
  );
};

const Discover = () => {
  const { user, role, onboardingCompleted, canSwitchRole, hasOrganizerRole } = useAuthWithBackend();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { events, loading, error, refetch } = useEvents();
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    console.log('Discover redirect check:', { user: !!user, role, onboardingCompleted });
    if (user && role === 'user' && onboardingCompleted === false) {
      console.log('Redirecting to onboarding...');
      navigate('/onboarding');
    }
  }, [user, role, onboardingCompleted, navigate]);

  useEffect(() => {
    if (user && role === 'user') fetchPrefs();
  }, [user, role]);

  const fetchPrefs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_preferences')
      .select('interests, has_kids, latitude, longitude, distance_range, city')
      .eq('user_id', user.id)
      .single();
    if (data) {
      setPrefs(data as UserPrefs);
      setSelectedCategories((data.interests as string[]) || []);
    }
  };


  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const filteredEvents = useMemo(() => {
    const now = Date.now();
    const oneHour = 3600000;
    return events.filter(event => {
      const target = new Date(event.start_time || event.created_at).getTime();
      if (target < now - oneHour) return false;
      if (date) {
        const eventDate = new Date(event.start_time || event.created_at);
        if (eventDate.toDateString() !== date.toDateString()) return false;
      }
      if (selectedCategories.length > 0 && !selectedCategories.includes(event.category || '')) return false;
      // Note: Backend API doesn't provide lat/lng, so distance filtering is not available yet
      return true;
    });
  }, [events, date, selectedCategories]);

  return (
    <>
      <div className="min-h-screen bg-background">
        <SEOHead title="Event Discoverer - Find Events" description="Explore events near you filtered by your interests and location." />
        <Navbar />
        {/* Show RoleSwitcher if user can switch between roles */}
        {user && canSwitchRole && <RoleSwitcher />}

        <section className="pt-28 md:pt-36 pb-6 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Discover Events</h1>
            {prefs?.city && (
              <p className="text-muted-foreground flex items-center gap-2 mb-6">
                <MapPin className="w-4 h-4" /> Showing events near {prefs.city} (within {prefs.distance_range} miles)
              </p>
            )}
          </div>
        </section>

        <section className="px-4 md:px-8 pb-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn("h-9 px-3 text-xs font-medium uppercase tracking-wider border border-border flex items-center gap-2 hover:border-foreground transition-colors", date && "border-foreground bg-foreground text-background")}>
                    <CalendarIcon className="w-3 h-3" />
                    {date ? format(date, 'MMM d') : 'Date'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
              {date && (
                <button onClick={() => setDate(undefined)} className="h-9 px-3 text-xs font-medium uppercase border border-border hover:border-foreground transition-colors">
                  Clear date
                </button>
              )}
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                  className={`h-9 px-3 text-xs font-medium uppercase tracking-wider border transition-colors ${selectedCategories.includes(cat.id) ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'}`}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
              {selectedCategories.length > 0 && (
                <button onClick={() => setSelectedCategories([])} className="h-9 px-3 text-xs font-medium uppercase border border-border hover:border-foreground transition-colors">
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="px-4 md:px-8 pb-16">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="text-center py-16 text-muted-foreground">Loading events...</div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-500 mb-2">Error loading events</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <button onClick={refetch} className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                  Try Again
                </button>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-2">No events found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or distance range in settings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, i) => (
                  <div key={event.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}>
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};
export default Discover;
