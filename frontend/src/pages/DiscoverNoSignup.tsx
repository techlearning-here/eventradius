import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEvents } from '@/hooks/useEvents';
import { apiClient } from '@/integrations/backend/api';
import { CalendarIcon, MapPin, ArrowRight, Sparkles, UserPlus, Search, Navigation, Crosshair, LayoutGrid, List, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/data/cities';
import { SEOHead } from '@/components/SEOHead';
import { EventCard } from '@/components/discover/EventCard';
import { EventDetailOverlay } from '@/components/EventDetailPage';
import { type Event } from '@/integrations/backend/api';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';

const RADIUS_MILES = 25;
const MAX_EVENTS = 20;

// Haversine distance calculation (miles)
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const DiscoverNoSignup = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { events, loading, error, refetch } = useEvents({ is_public: true });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  
  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Track preview state
  const [previewEventId, setPreviewEventId] = useState<string | null>(null);
  const [previewEvent, setPreviewEvent] = useState<Event | null>(null);
  
  // Bulk participant counts for all events
  const [participantCounts, setParticipantCounts] = useState<Map<string, { interested: number; going: number }>>(new Map());
  
  // Fetch all participant counts in bulk when events load
  useEffect(() => {
    if (events.length === 0) return;
    
    const fetchBulkParticipants = async () => {
      try {
        const eventIds = events.map(e => e.id);
        const response = await apiClient.getBulkEventParticipants(eventIds);
        
        const countsMap = new Map<string, { interested: number; going: number }>();
        Object.entries(response).forEach(([eventId, data]) => {
          countsMap.set(eventId, {
            interested: data.counts.interested,
            going: data.counts.going
          });
        });
        
        setParticipantCounts(countsMap);
      } catch (err) {
        // Silently fail for non-authenticated users - participant counts are optional
        console.log('Could not fetch participant counts');
      }
    };
    
    const timeout = setTimeout(fetchBulkParticipants, 50);
    return () => clearTimeout(timeout);
  }, [events]);
  
  // Get user location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationLoading(false);
        toast.success('Location found! Showing nearby events.');
      },
      (err) => {
        console.log('Geolocation error:', err);
        setLocationError('Unable to get your location. Showing all events.');
        setLocationLoading(false);
        // Don't show toast for permission denied - user likely blocked it intentionally
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

  const handleRequestLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError(null);
        setLocationLoading(false);
        toast.success('Location updated! Showing nearby events.');
      },
      (err) => {
        toast.error('Could not get your location. Please check browser permissions.');
        setLocationLoading(false);
      }
    );
  };

  const handlePreviewEvent = (event: Event) => {
    setPreviewEventId(event.id);
    setPreviewEvent(event);
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const filteredEvents = useMemo(() => {
    // First filter by date and category
    let filtered = events.filter((event) => {
      const matchesDate = !date || new Date(event.start_time || event.created_at).toDateString() === date.toDateString();
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(event.category || '');
      return matchesDate && matchesCategory;
    });

    // TODO: Enable location-based filtering for production
    // Location filtering is disabled for now - will be enabled in production
    /*
    if (userLocation) {
      filtered = filtered
        .map(event => {
          const eventLat = (event as unknown as { latitude?: number }).latitude;
          const eventLng = (event as unknown as { longitude?: number }).longitude;
          
          if (eventLat && eventLng) {
            const distance = haversineDistance(userLocation.lat, userLocation.lng, eventLat, eventLng);
            return { ...event, distance };
          }
          return { ...event, distance: Infinity };
        })
        .filter(event => event.distance <= RADIUS_MILES)
        .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
        .slice(0, MAX_EVENTS);
    } else {
      filtered = filtered.slice(0, MAX_EVENTS);
    }
    */
    
    // For now, just limit to MAX_EVENTS without location filtering
    filtered = filtered.slice(0, MAX_EVENTS);

    return filtered;
  }, [events, date, selectedCategories]);

  return (
    <>
      <div className="min-h-screen bg-background overflow-y-auto">
        <SEOHead 
          title="Discover Events - EventsRadius" 
          description="Explore public events near you. Find events that match your interests and connect with your community." 
        />
        
        {/* Public Navbar - Simplified for non-authenticated users */}
        <div className="fixed top-0 left-0 right-0 z-[2000] px-4 md:px-8 py-4">
          <div className="max-w-7xl mx-auto">
            <nav className="flex items-center justify-between bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl px-6 py-3 shadow-lg shadow-black/5">
              {/* Site Name / Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  EventsRadius
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
                  <Link
                    to="/discover-nosignup"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-background shadow-sm"
                  >
                    Discover Events
                  </Link>
                  <Link
                    to="/auth"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-all duration-200"
                  >
                    Sign In
                  </Link>
                </div>
                
                <div className="h-6 w-px bg-border mx-2" />
                <ThemeToggle />
              </div>

              {/* Mobile Menu - Simplified */}
              <div className="md:hidden flex items-center gap-2">
                <ThemeToggle />
                <Link
                  to="/auth"
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground"
                >
                  Sign In
                </Link>
              </div>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="pt-32 pb-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">No account required to browse</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Discover Amazing Events
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
                Explore public events happening near you. Sign up to get personalized recommendations and connect with your community.
              </p>
              
              {/* Location indicator */}
              <div className="flex items-center justify-center gap-3">
                {locationLoading ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">Getting your location...</span>
                  </div>
                ) : userLocation ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                    <Navigation className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">
                      Showing events within <span className="font-semibold text-primary">{RADIUS_MILES} miles</span>
                    </span>
                    <button 
                      onClick={handleRequestLocation}
                      className="ml-2 p-1 hover:bg-primary/20 rounded transition-colors"
                      title="Refresh location"
                    >
                      <Crosshair className="w-3 h-3 text-primary" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleRequestLocation}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-muted border border-border hover:border-primary/50 hover:bg-primary/5 rounded-lg transition-all"
                  >
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Enable location to see nearby events</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
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

        {/* Events Grid Section */}
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
                  We're finding the best public events for you...
                </p>
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
                    <Search className="w-16 h-16 text-primary/60" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4">No Events Found</h3>
                <p className="text-muted-foreground text-center max-w-lg mb-8 text-lg leading-relaxed">
                  {events.length === 0 ? (
                    <>
                      There are no public events available at the moment. 
                      Check back later for new events.
                    </>
                  ) : userLocation ? (
                    <>
                      No events found within {RADIUS_MILES} miles of your location.
                      Try adjusting your filters or enable broader search.
                    </>
                  ) : (
                    <>
                      No events match your current filters. 
                      Try adjusting your criteria, explore different categories, or enable location to see nearby events.
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
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'} 
                      {userLocation ? ` within ${RADIUS_MILES} miles` : ' shown'}
                    </h2>
                    <p className="text-muted-foreground">
                      {userLocation 
                        ? `Showing nearest ${MAX_EVENTS} public events by distance`
                        : `Showing first ${MAX_EVENTS} public events (enable location for nearby events)`}
                      {selectedCategories.length > 0 && ` • Filtered by ${selectedCategories.length} categories`}
                      {date && ` • Filtered by date`}
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
                        is_registered: false,
                        counts: counts
                      } : null;
                    })()}
                  />
                )}
              </div>
            )}
          </div>
        </section>

        {/* Sign Up CTA Section */}
        <section className="px-4 md:px-8 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 shadow-lg backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="relative p-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/20 rounded-xl shadow-lg shadow-primary/10">
                      <UserPlus className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Want to see more relevant events?</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Sign up for free to get personalized event recommendations based on your interests and location.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                    <Link
                      to="/auth"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 whitespace-nowrap"
                    >
                      Sign Up Free
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </Link>
                    <Link
                      to="/discover"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-background border border-border text-foreground font-medium rounded-lg hover:bg-accent transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                      <Sparkles className="w-4 h-4 shrink-0" />
                      Try Personalized Discovery
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer - Simple */}
        <footer className="px-4 md:px-8 py-8 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">EventsRadius</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Discover and connect with events that matter to you.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                <Link to="/auth" className="hover:text-foreground transition-colors">Sign In</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default DiscoverNoSignup;
