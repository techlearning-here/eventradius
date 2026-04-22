import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { apiClient } from '@/integrations/backend/api';
import { CalendarIcon, MapPin, Plus, ArrowRight, Building2, LayoutGrid, List, Users, RefreshCw, Share2, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/data/cities';
import { SEOHead } from '@/components/SEOHead';
import { EventCard } from '@/components/discover/EventCard';
import { EventDetailOverlay } from '@/components/events/details/EventDetailPage';
import { ShareEventModal } from '@/components/share/ShareEventModal';
import { LocationFilter } from '@/components/discovery/LocationFilter';
import { formatDistance } from '@/hooks/useGeolocation';
import { type Event } from '@/integrations/backend/api';

// Global caches to persist data across page switches
let cachedUserPrefs: UserPrefs | null = null;
let cachedParticipantCounts: Map<string, { interested: number; going: number }> | null = null;
let cachedEventIds: string[] = [];

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
  const { user, role, onboardingCompleted, canSwitchRole, hasOrganizerRole } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [eventsEnabled, setEventsEnabled] = useState(false);
  const { events, loading, error, refetch } = useEvents({ enabled: eventsEnabled });

  // Store last dashboard visit
  useEffect(() => {
    localStorage.setItem('lastDashboard', '/discover');
  }, []);

  // Enable events loading after initial page load (delayed to allow navigation to complete)
  useEffect(() => {
    const timer = setTimeout(() => {
      setEventsEnabled(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Discover page has NO redirect logic - onboarding decision is made in PostAuthRedirect

  useEffect(() => {
    if (error) {
      console.error('API Error:', error);
    }
  }, [loading, error, events]);
  const [prefs, setPrefs] = useState<UserPrefs | null>(cachedUserPrefs);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  
  // Location-based discovery state
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);
  const [radius, setRadius] = useState(25);
  const [useLocation, setUseLocation] = useState(false);
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  
  // Track preview state
  const [previewEventId, setPreviewEventId] = useState<string | null>(null);
  const [previewEvent, setPreviewEvent] = useState<Event | null>(null);
  const [shareEvent, setShareEvent] = useState<Event | null>(null);
  
  // Bulk participant counts for all events - reduces API calls from N to 1
  const [participantCounts, setParticipantCounts] = useState<Map<string, { interested: number; going: number }>>(cachedParticipantCounts || new Map());
  
  // Fetch all participant counts in bulk when events load (with caching)
  useEffect(() => {
    if (events.length === 0) return;
    
    const eventIds = events.map(e => e.id);
    
    // Check if we already have cached data for these exact events
    const hasAllCached = eventIds.length > 0 && eventIds.every(id => cachedParticipantCounts?.has(id));
    if (hasAllCached && cachedEventIds.length === eventIds.length && 
        cachedEventIds.every(id => eventIds.includes(id))) {
      // Use cached data
      setParticipantCounts(cachedParticipantCounts!);
      return;
    }
    
    const fetchBulkParticipants = async () => {
      try {
        const response = await apiClient.getBulkEventParticipants(eventIds);
        
        const countsMap = new Map<string, { interested: number; going: number }>();
        
        Object.entries(response).forEach(([eventId, data]) => {
          countsMap.set(eventId, {
            interested: data.counts.interested,
            going: data.counts.going
          });
        });
        
        // Update global cache
        cachedParticipantCounts = countsMap;
        cachedEventIds = eventIds;
        setParticipantCounts(countsMap);
      } catch (err) {
        console.error('Failed to fetch bulk participants:', err);
      }
    };
    
    // Small delay to batch rapid updates, but faster than component-level delays
    const timeout = setTimeout(fetchBulkParticipants, 50);
    return () => clearTimeout(timeout);
    // Use JSON.stringify of event IDs as stable dependency
  }, [events.length > 0 ? JSON.stringify(events.map(e => e.id).sort()) : '']);
  
  const handlePreviewEvent = (event: Event) => {
    setPreviewEventId(event.id);
    setPreviewEvent(event);
  };

  const handleShare = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    setShareEvent(event);
  };

  useEffect(() => {
    // Skip redirect if we just completed onboarding (prevents redirect loop)
    if (sessionStorage.getItem('onboarding_completed') === 'true') {
      console.log('Discover: skipping second redirect - just completed flag set');
      return;
    }
    
    // Redirect to onboarding if not completed (null for new users, false for incomplete)
    if (user && role === 'user' && onboardingCompleted !== true) {
      navigate('/onboarding');
    }
  }, [user, role, onboardingCompleted, navigate]);

  useEffect(() => {
    // Skip if no user or already cached
    if (!user || role !== 'user' || cachedUserPrefs) return;
    fetchPrefs();
  }, [user?.id, role]);

  const fetchPrefs = async () => {
    if (!user) return;
    
    // Use cached prefs if available
    if (cachedUserPrefs) {
      setPrefs(cachedUserPrefs);
      return;
    }
    
    try {
      const preferences = await apiClient.getUserPreferences();
      if (preferences) {
        const prefsData = {
          interests: preferences.interests || [],
          has_kids: preferences.has_kids || false,
          latitude: preferences.latitude,
          longitude: preferences.longitude,
          distance_range: preferences.distance_range || 50,
          city: preferences.city
        };
        // Update global cache
        cachedUserPrefs = prefsData;
        setPrefs(prefsData);
      }
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
      // Don't throw - let the component continue with default prefs
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  // Handle location updates from LocationFilter component
  const handleLocationChange = async (lat: number, lng: number) => {
    console.log('[Discover] Location updated:', { lat, lng });
    setUserLatitude(lat);
    setUserLongitude(lng);
    setUseLocation(true);
    
    // Save to user preferences
    try {
      await apiClient.updateUserLocation(lat, lng, prefs?.city || undefined, radius);
    } catch (err) {
      console.error('Failed to save location:', err);
    }
  };

  // Handle radius changes
  const handleRadiusChange = async (newRadius: number) => {
    setRadius(newRadius);
    if (useLocation && userLatitude && userLongitude) {
      // Refetch with new radius
      try {
        await apiClient.updateUserLocation(userLatitude, userLongitude, prefs?.city || undefined, newRadius);
      } catch (err) {
        console.error('Failed to update radius:', err);
      }
    }
  };

  // Fetch nearby events when location is enabled
  useEffect(() => {
    const fetchNearbyEvents = async () => {
      if (!useLocation || !userLatitude || !userLongitude) {
        console.log('[Discover] Skipping nearby fetch - location not available:', { useLocation, userLatitude, userLongitude });
        return;
      }
      
      console.log('[Discover] Fetching nearby events:', { lat: userLatitude, lng: userLongitude, radius });
      setNearbyLoading(true);
      try {
        const data = await apiClient.getNearbyEvents(userLatitude, userLongitude, radius);
        console.log('[Discover] Nearby events received:', { count: data.length, events: data.map((e: Event & { distance_km?: number }) => ({ id: e.id, title: e.title, distance: e.distance_km })) });
        setNearbyEvents(data);
      } catch (err) {
        console.error('[Discover] Error fetching nearby events:', err);
        // Fall back to regular events
        setNearbyEvents([]);
      } finally {
        setNearbyLoading(false);
      }
    };
    
    fetchNearbyEvents();
  }, [useLocation, userLatitude, userLongitude, radius]);

  // Load saved location from user preferences
  useEffect(() => {
    if (prefs?.latitude && prefs?.longitude) {
      console.log('[Discover] Loading saved location from preferences:', { 
        lat: prefs.latitude, 
        lng: prefs.longitude, 
        radius: prefs.distance_range 
      });
      setUserLatitude(prefs.latitude);
      setUserLongitude(prefs.longitude);
      if (prefs.distance_range) {
        setRadius(prefs.distance_range);
      }
      setUseLocation(true);
    } else {
      console.log('[Discover] No saved location in preferences');
    }
  }, [prefs]);

  // Clear all caches and refetch
  const handleRefresh = async () => {
    // Clear local caches
    cachedUserPrefs = null;
    cachedParticipantCounts = null;
    cachedEventIds = [];
    // Refetch events (this clears the events cache too)
    await refetch();
    // Refetch user prefs
    if (user && role === 'user') {
      await fetchPrefs();
    }
  };

  // Use nearby events when location is enabled and available, otherwise use all events
  const baseEvents = useMemo(() => {
    if (useLocation && nearbyEvents.length > 0) {
      return nearbyEvents;
    }
    return events;
  }, [useLocation, nearbyEvents, events]);

  const filteredEvents = useMemo(() => {
    return baseEvents.filter((event) => {
      const matchesDate = !date || (event.start_time && new Date(event.start_time).toDateString() === date.toDateString());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(event.category || '');
      return matchesDate && matchesCategory;
    });
  }, [baseEvents, date, selectedCategories]);

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
            <div className="flex items-center justify-center gap-3 mb-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Discover Events</h1>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-50"
                title="Refresh events"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find events that match your interests and connect with your community
            </p>
            
            {/* Location indicator if user has preferences or location is enabled */}
            {(prefs?.city || useLocation) && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg backdrop-blur-sm">
                <Navigation className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {useLocation ? (
                    <>
                      Events near <span className="text-primary font-semibold">your location</span>
                      <span className="text-xs text-muted-foreground ml-2">(within {radius} km)</span>
                    </>
                  ) : prefs?.city ? (
                    <>
                      Events near <span className="text-primary font-semibold">{prefs.city}</span>
                      <span className="text-xs text-muted-foreground ml-2">(within {prefs.distance_range} miles)</span>
                    </>
                  ) : null}
                </span>
              </div>
            )}

            {/* Debug: Location Info */}
            {prefs && (
              <div className="mt-4 inline-flex flex-col items-center gap-1 px-3 py-2 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs text-yellow-800 dark:text-yellow-400 font-mono">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>City: {prefs.city || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Lat: {prefs.latitude?.toFixed(4) || 'N/A'}</span>
                  <span>Lon: {prefs.longitude?.toFixed(4) || 'N/A'}</span>
                  <span>Radius: {prefs.distance_range} mi</span>
                </div>
                {useLocation && (userLatitude || userLongitude) && (
                  <div className="flex items-center gap-4 pt-1 border-t border-yellow-200 dark:border-yellow-800 mt-1">
                    <span className="text-green-600 dark:text-green-400">Live: {userLatitude?.toFixed(4)}, {userLongitude?.toFixed(4)}</span>
                    <span>Using: {useLocation ? 'Live' : 'Prefs'}</span>
                  </div>
                )}
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
                
                {/* Location Filter */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-1">
                    <LocationFilter
                      radius={radius}
                      onRadiusChange={handleRadiusChange}
                      onLocationChange={handleLocationChange}
                      userLatitude={userLatitude}
                      userLongitude={userLongitude}
                    />
                  </div>
                  
                  <div className="lg:col-span-2">
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
                    onClick={handleRefresh} 
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
                    onClick={handleRefresh} 
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
                            
                            {/* Share Button */}
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                onClick={(e) => handleShare(e, event)}
                                className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
                                title="Share event"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
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

                {/* Share Event Modal */}
                {shareEvent && (
                  <ShareEventModal
                    event={shareEvent}
                    isOpen={!!shareEvent}
                    onClose={() => setShareEvent(null)}
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
