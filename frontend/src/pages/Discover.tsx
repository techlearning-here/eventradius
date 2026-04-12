import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { useEvents } from '@/hooks/useEvents';
import { apiClient } from '@/integrations/backend/api';
import { CalendarIcon, MapPin, Plus, ArrowRight, Building2, LayoutGrid, List, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/data/cities';
import { SEOHead } from '@/components/SEOHead';
import { EventCard } from '@/components/discover/EventCard';
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

const Discover = () => {
  const { user, role, onboardingCompleted, canSwitchRole, hasOrganizerRole } = useAuthWithBackend();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { events, loading, error, refetch } = useEvents();
  
  
  useEffect(() => {
    if (user && role === 'user' && onboardingCompleted === false) {
      navigate('/onboarding');
    }
  }, [user, role, onboardingCompleted, navigate]);

  useEffect(() => {
    if (error) {
      console.error('API Error:', error);
    }
  }, [loading, error, events]);
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  
  // Track preview state
  const [previewEventId, setPreviewEventId] = useState<string | null>(null);
  const [previewEvent, setPreviewEvent] = useState<Event | null>(null);
  
  // Bulk participant counts for all events - reduces API calls from N to 1
  const [participantCounts, setParticipantCounts] = useState<Map<string, { interested: number; going: number }>>(new Map());
  
  // Fetch all participant counts in bulk when events load
  useEffect(() => {
    if (events.length === 0) return;
    
    const fetchBulkParticipants = async () => {
      try {
        const eventIds = events.map(e => e.id);
        console.log('[Discover] Fetching bulk participants for', eventIds.length, 'events');
        const response = await apiClient.getBulkEventParticipants(eventIds);
        console.log('[Discover] Bulk participants response:', Object.keys(response).length, 'events');
        
        const countsMap = new Map<string, { interested: number; going: number }>();
        Object.entries(response).forEach(([eventId, data]) => {
          countsMap.set(eventId, {
            interested: data.counts.interested,
            going: data.counts.going
          });
        });
        
        setParticipantCounts(countsMap);
      } catch (err) {
        console.error('Failed to fetch bulk participants:', err);
      }
    };
    
    // Small delay to batch rapid updates, but faster than component-level delays
    const timeout = setTimeout(fetchBulkParticipants, 50);
    return () => clearTimeout(timeout);
  }, [events]);
  
  const handlePreviewEvent = (event: Event) => {
    setPreviewEventId(event.id);
    setPreviewEvent(event);
  };

  useEffect(() => {
    if (user && role === 'user' && onboardingCompleted === false) {
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
    // Only log in development
    if (import.meta.env.DEV) {
      console.log('=== EVENT FILTERING DEBUG ===');
      console.log('Total events fetched:', events.length);
    }
    
    const filtered = events.filter((event, index) => {
      const matchesDate = !date || new Date(event.start_time || event.created_at).toDateString() === date.toDateString();
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(event.category || '');
      
      if (import.meta.env.DEV) {
        console.log(`\n--- Event ${index + 1} ---`);
        console.log('ID:', event.id);
        console.log('Title:', event.title);
        console.log('Matches date filter:', matchesDate);
        console.log('Matches category filter:', matchesCategory);
        console.log('Selected categories:', selectedCategories);
        console.log('Event category:', event.category);
        console.log('Will pass filter:', matchesDate && matchesCategory);
      }
      
      return matchesDate && matchesCategory;
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
      <div className="min-h-screen bg-background overflow-y-auto">
        <SEOHead title="Event Discoverer - Find Events" description="Explore events near you filtered by your interests and location." />
        <Navbar />
        {/* Show RoleSwitcher if user can switch between roles */}
        {user && canSwitchRole && <RoleSwitcher />}

        {/* Small Hero Space */}
        <section className="pt-24 pb-8 px-4 md:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Discover Events</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find events that match your interests and connect with your community
            </p>
            
            {/* Location indicator if user has preferences */}
            {prefs?.city && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg backdrop-blur-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Events near <span className="text-primary font-semibold">{prefs.city}</span>
                </span>
                <span className="text-xs text-muted-foreground">(within {prefs.distance_range} miles)</span>
              </div>
            )}
          </div>
        </section>

        <section className="px-4 md:px-8 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Filter Events</h2>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={cn(
                        "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95",
                        date 
                          ? "bg-teal-100 text-teal-700 border-teal-300 shadow-sm" 
                          : "bg-background border-border hover:border-primary/50 hover:bg-primary/5"
                      )}>
                        <CalendarIcon className="w-4 h-4" />
                        {date ? format(date, 'MMM d') : 'Any Date'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={date} onSelect={setDate} className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  
                  {date && (
                    <button 
                      onClick={() => setDate(undefined)} 
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Clear Date
                    </button>
                  )}
                  
                  <div className="h-6 w-px bg-border" />
                  
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => toggleCategory(cat.id)}
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95",
                        selectedCategories.includes(cat.id)
                          ? "bg-teal-100 text-teal-700 border-teal-300 shadow-sm" 
                          : "bg-background border-border hover:border-primary/50 hover:bg-primary/5"
                      )}
                    >
                      <span className="text-base">{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                  
                  {selectedCategories.length > 0 && (
                    <button 
                      onClick={() => setSelectedCategories([])} 
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground border border-secondary/50 hover:bg-secondary/80 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                {selectedCategories.length > 0 && (
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs text-muted-foreground">Active filters:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedCategories.map(catId => {
                        const cat = CATEGORIES.find(c => c.id === catId);
                        return cat ? (
                          <span key={catId} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                            {cat.emoji} {cat.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 md:px-8 pb-20">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative mb-8">
                  <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Discovering Amazing Events</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  We're finding the best events for you based on your interests and location...
                </p>
                <div className="mt-6 flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">!</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Oops! Something went wrong</h3>
                <p className="text-muted-foreground text-center max-w-md mb-8">
                  We couldn't load the events right now. Please check your connection and try again.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={refetch} 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/90 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center">
                    <CalendarIcon className="w-16 h-16 text-primary/60" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-sm">?</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4">No Events Found</h3>
                <p className="text-muted-foreground text-center max-w-lg mb-8 text-lg leading-relaxed">
                  {events.length === 0 ? (
                    <>
                      There are no events available at the moment. 
                      Check back later or try adjusting your preferences to discover more events.
                    </>
                  ) : (
                    <>
                      No events match your current filters. 
                      Try adjusting your criteria or explore different categories.
                    </>
                  )}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={refetch} 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
                  >
                    Refresh Events
                  </button>
                  {selectedCategories.length > 0 && (
                    <button 
                      onClick={() => setSelectedCategories([])} 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/90 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button 
                    onClick={() => navigate('/settings')} 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-background border border-border text-foreground font-medium rounded-lg hover:bg-accent transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Update Preferences
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'} Found
                    </h2>
                    <p className="text-muted-foreground">
                      {selectedCategories.length > 0 && date
                        ? `Filtered by ${selectedCategories.length} categories and date`
                        : selectedCategories.length > 0
                        ? `Filtered by ${selectedCategories.length} categories`
                        : date
                        ? 'Filtered by date'
                        : 'Showing all available events'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border">
                      <button
                        onClick={() => setViewMode('card')}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                          viewMode === 'card'
                            ? "bg-teal-100 text-teal-700 shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <LayoutGrid className="w-4 h-4" />
                        Card
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                          viewMode === 'list'
                            ? "bg-teal-100 text-teal-700 shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <List className="w-4 h-4" />
                        List
                      </button>
                    </div>
                    <div className="w-px h-6 bg-border" />
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">Live updates</span>
                  </div>
                </div>
                
                {/* Events Display */}
                {viewMode === 'card' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEvents.map((event, i) => (
                      <div key={event.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}>
                        <EventCard 
                          event={event} 
                          onPreview={handlePreviewEvent}
                          participantCounts={participantCounts.get(event.id)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map((event, i) => (
                      <div 
                        key={event.id} 
                        className="animate-fade-in bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                        style={{ animationDelay: `${i * 0.03}s`, animationFillMode: 'both' }}
                        onClick={() => handlePreviewEvent(event)}
                      >
                        <div className="flex gap-4">
                          {/* Event Image */}
                          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-lg overflow-hidden shrink-0">
                            {event.image_url ? (
                              <img 
                                src={event.image_url} 
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                                <CalendarIcon className="w-8 h-8 text-primary/60" />
                              </div>
                            )}
                          </div>
                          
                          {/* Event Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold text-foreground text-lg line-clamp-1">{event.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                              </div>
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full shrink-0">
                                {event.category}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {event.start_time ? format(new Date(event.start_time), 'MMM d, h:mm a') : 'Date TBD'}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span className="line-clamp-1">{event.location}</span>
                                </span>
                              )}
                              {participantCounts.get(event.id) && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {participantCounts.get(event.id)?.going || 0} going
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Event Preview Overlay */}
                {previewEventId && previewEvent && (
                  <EventDetailOverlay
                    eventId={previewEventId}
                    isOpen={!!previewEventId}
                    onClose={() => {
                      setPreviewEventId(null);
                      setPreviewEvent(null);
                    }}
                    eventData={previewEvent}
                    participantData={(() => {
                      const counts = participantCounts.get(previewEventId);
                      return counts ? {
                        is_registered: false, // Will be determined by checkRegistration if needed
                        counts: counts
                      } : null;
                    })()}
                  />
                )}
              </div>
            )}
          </div>
        </section>

        {/* Become an Organizer CTA - Show for users without organizer role */}
        {user && !hasOrganizerRole && (
          <section className="px-4 md:px-8 pb-8">
            <div className="max-w-6xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 shadow-lg backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <div className="relative p-8">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/20 rounded-xl shadow-lg shadow-primary/10">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Ready to Create Events?</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Join our community of event organizers and start creating amazing experiences for others.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/organizer-onboarding')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
                    >
                      Become an Organizer
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

    </>
  );
};
export default Discover;
