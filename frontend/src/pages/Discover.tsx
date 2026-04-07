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
import { EventDetailOverlay } from '@/components/EventDetailPage';
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
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const catLabel = CATEGORIES.find(c => c.id === event.category)?.label || event.category;

  const handleEventClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOverlayOpen(true);
  };

  return (
    <div className="relative cursor-pointer group" onClick={handleEventClick}>
      <EventDetailOverlay eventId={event.id} isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)} />
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
  const [showDemoEvent, setShowDemoEvent] = useState(false);

  useEffect(() => {
    console.log('Discover redirect check:', { user: !!user, role, onboardingCompleted });
    if (user && role === 'user' && onboardingCompleted === false) {
      console.log('Redirecting to onboarding...');
      navigate('/onboarding');
    }
  }, [user, role, onboardingCompleted, navigate]);

  useEffect(() => {
    console.log('🔍 Debug - Events loading state:', loading);
    console.log('🔍 Debug - Events error state:', error);
    if (loading) {
      console.log('🔍 Debug - Still loading events...');
    }
    if (error) {
      console.log('🔍 Debug - API Error:', error);
    }
  }, [loading, error]);
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
    
    // Only log in development
    if (import.meta.env.DEV) {
      console.log('=== EVENT FILTERING DEBUG ===');
      console.log('Current time:', new Date(now));
      console.log('One hour ago:', new Date(now - oneHour));
      console.log('Total events fetched:', events.length);
    }
    
    const filtered = events.filter((event, index) => {
      // If event has a start_time, use it. If not, treat it as upcoming (not past)
      let target;
      let isPastEvent = false;
      
      if (event.start_time) {
        target = new Date(event.start_time).getTime();
        isPastEvent = target < now - oneHour;
      } else {
        // Events without start_time are considered upcoming
        target = new Date(event.created_at).getTime();
        isPastEvent = false; // Don't filter out events without start_time
      }
      
      const matchesDate = !date || new Date(event.start_time || event.created_at).toDateString() === date.toDateString();
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(event.category || '');
      
      if (import.meta.env.DEV) {
        console.log(`\n--- Event ${index + 1} ---`);
        console.log('ID:', event.id);
        console.log('Title:', event.title);
        console.log('Start time:', event.start_time);
        console.log('Created at:', event.created_at);
        console.log('Target time:', new Date(target));
        console.log('Has start_time:', !!event.start_time);
        console.log('Is past event:', isPastEvent);
        console.log('Matches date filter:', matchesDate);
        console.log('Matches category filter:', matchesCategory);
        console.log('Selected categories:', selectedCategories);
        console.log('Event category:', event.category);
        console.log('Will pass filter:', !isPastEvent && matchesDate && matchesCategory);
      }
      
      return !isPastEvent && matchesDate && matchesCategory;
    });
    
    if (import.meta.env.DEV) {
      console.log('\n=== FILTERING RESULTS ===');
      console.log('Events after filtering:', filtered.length);
      console.log('Filtered events:', filtered.map(e => ({ id: e.id, title: e.title, start_time: e.start_time, category: e.category })));
      console.log('=========================\n');
    }

    return filtered;
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
            {/* Demo Event Button - Only in development */}
            {import.meta.env.DEV && (
              <div className="mb-6 text-center">
                <button
                  onClick={() => setShowDemoEvent(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  View Demo Event (Full Features)
                </button>
              </div>
            )}

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
                <div className="mb-4">
                  <div className="text-6xl text-muted-foreground mb-2">&#x1F4C5;</div>
                  <h3 className="text-2xl font-medium text-foreground mb-2">No Events Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {events.length === 0 ? (
                      <>
                        We couldn't find any events matching your criteria. 
                        <span className="text-foreground font-medium">Try adjusting your filters</span> or check back later.
                      </>
                    ) : (
                      <>
                        There was an issue loading events. 
                        Please try again or contact support if the problem persists.
                      </>
                    )}
                  </p>
                  <div className="flex flex-col gap-3 justify-center">
                    <button onClick={refetch} className="px-6 py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
                      Refresh Events
                    </button>
                    <button onClick={() => navigate('/settings')} className="px-6 py-3 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors">
                      Update Preferences
                    </button>
                  </div>
                </div>
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

      {/* Demo Event Overlay */}
      <EventDetailOverlay 
        eventId="demo" 
        isOpen={showDemoEvent} 
        onClose={() => setShowDemoEvent(false)} 
      />
    </>
  );
};
export default Discover;
