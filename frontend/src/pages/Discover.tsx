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
import { dummyEvents } from '@/data/demoEvents';
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
    <div className="relative cursor-pointer group group-hover:active:scale-95 transition-transform duration-150" onClick={handleEventClick}>
      <EventDetailOverlay eventId={event.id} isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)} />
      
      {/* Main Card Content */}
      <div className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-lg hover:bg-accent/50 transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1">
        {/* Event Image */}
        {event.image_url && (
          <div className="relative h-48 w-full overflow-hidden border-b border-border">
            <img 
              src={event.image_url} 
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1540555700478-5be5d670b71d?w=800&h=400&fit=crop&auto=format&dpr=2';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
        
        {/* Event Details */}
        <div className="p-4 space-y-3 bg-background border-t border-border">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-medium text-muted-foreground transition-colors duration-300 group-hover:text-foreground">{catLabel}</span>
              {!event.is_paid_event && (
                <span className="text-[10px] font-semibold text-green-400 transition-colors duration-300 group-hover:text-green-300">FREE</span>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {event.max_participants && `${event.max_participants} max` || 'Open'}
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-foreground line-clamp-2 leading-tight transition-colors duration-300 group-hover:text-primary mb-3">{event.title}</h3>
          
          {event.start_time && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <CalendarIcon className="w-4 h-4" />
              <span>{format(new Date(event.start_time), 'MMM d, yyyy')}</span>
              <span>at</span>
              <span>{format(new Date(event.start_time), 'h:mm a')}</span>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1 text-foreground/80 transition-colors duration-300 group-hover:text-foreground mb-3">
            <MapPin className="w-3 h-3 transition-colors duration-300 group-hover:text-primary" /> {event.location || 'Online'}
          </p>
          
          <div className="pt-3 border-t border-border bg-muted/20 rounded-b-lg">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <EventParticipationCounts eventId={event.id} />
              </div>
              <div className="text-[10px] text-muted-foreground font-medium">
                {event.current_participants || 0} going
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Discover = () => {
  const { user, role, onboardingCompleted, canSwitchRole, hasOrganizerRole } = useAuthWithBackend();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { events, loading, error, refetch } = useEvents();
  const [showDemoEvent, setShowDemoEvent] = useState<string | null>(null);

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
            {/* Demo Event Cards - Only in development */}
            {import.meta.env.DEV && (
              <div className="mb-8 space-y-6 bg-muted/30 rounded-lg p-6 border border-border">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Family Event Demos (Full Features)</h3>
                  <p className="text-muted-foreground">Click any event to see full details and participation features</p>
                </div>
                
                {/* Demo Events Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
                  {Object.values(dummyEvents).map((event, i) => (
                    <div key={event.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}>
                      <EventCard event={event} />
                    </div>
                  ))}
                </div>
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
                        There are no events available at the moment. 
                        Please check back later or try adjusting your filters.
                      </>
                    ) : (
                      <>
                        No events match your current filters. 
                        Try adjusting your criteria or clear all filters.
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

      {/* Demo Event Overlays */}
      <EventDetailOverlay 
        eventId="demo-single-free" 
        isOpen={showDemoEvent === 'demo-single-free'} 
        onClose={() => setShowDemoEvent(null)} 
      />
      <EventDetailOverlay 
        eventId="demo-single-paid" 
        isOpen={showDemoEvent === 'demo-single-paid'} 
        onClose={() => setShowDemoEvent(null)} 
      />
      <EventDetailOverlay 
        eventId="demo-online-free" 
        isOpen={showDemoEvent === 'demo-online-free'} 
        onClose={() => setShowDemoEvent(null)} 
      />
      <EventDetailOverlay 
        eventId="demo-online-paid" 
        isOpen={showDemoEvent === 'demo-online-paid'} 
        onClose={() => setShowDemoEvent(null)} 
      />
      <EventDetailOverlay 
        eventId="demo-hybrid-free" 
        isOpen={showDemoEvent === 'demo-hybrid-free'} 
        onClose={() => setShowDemoEvent(null)} 
      />
      <EventDetailOverlay 
        eventId="demo-recurring-free" 
        isOpen={showDemoEvent === 'demo-recurring-free'} 
        onClose={() => setShowDemoEvent(null)} 
      />
      <EventDetailOverlay 
        eventId="demo-recurring-paid" 
        isOpen={showDemoEvent === 'demo-recurring-paid'} 
        onClose={() => setShowDemoEvent(null)} 
      />
      <EventDetailOverlay 
        eventId="demo-multi-date-free" 
        isOpen={showDemoEvent === 'demo-multi-date-free'} 
        onClose={() => setShowDemoEvent(null)} 
      />
      <EventDetailOverlay 
        eventId="demo-multi-date-paid" 
        isOpen={showDemoEvent === 'demo-multi-date-paid'} 
        onClose={() => setShowDemoEvent(null)} 
      />
    </>
  );
};
export default Discover;
