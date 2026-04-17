import React, { useEffect } from 'react';
import { Event, OrganizerProfile } from '../types';

interface EventHeaderProps {
  event: Event;
  organizerProfile: OrganizerProfile | null;
  onClose: () => void;
  formatLabel: (text: string | null | undefined) => string;
}

export const EventHeader: React.FC<EventHeaderProps> = ({
  event,
  organizerProfile,
  onClose,
  formatLabel
}) => {
  // Priority: image_url (cover image) > background_image_url > fallback
  const heroImageUrl = event.image_url || event.background_image_url;
  
  // Debug log for tags and header fields
  useEffect(() => {
    console.log('[EventHeader] Debug - Header fields:', {
      title: event.title,
      category: event.category,
      event_type: event.event_type,
      is_public: event.is_public,
      tags: event.tags,
      tagsCount: event.tags?.length || 0,
      hasCoverImage: !!event.image_url,
      hasBackgroundImage: !!event.background_image_url,
    });
  }, [event.title, event.category, event.event_type, event.is_public, event.tags, event.image_url, event.background_image_url]);
  return (
    <>
      {/* Title Bar */}
      <div className="bg-gradient-to-r from-background via-background/95 to-background border-b border-border/50 backdrop-blur-sm px-8 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-background/50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back to Events</span>
            </button>
            <div className="h-4 w-px bg-border"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Category:</span>
              <span className="text-sm font-medium text-foreground capitalize px-2 py-1 bg-primary/10 text-primary rounded-md">{event.category}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section with Background */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105 transition-all duration-700"
          style={{ 
            backgroundImage: heroImageUrl 
              ? `url("${heroImageUrl}")` 
              : `url("https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&h=600&fit=crop")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        
        {/* Hero Content Container - Transparent */}
        <div className="absolute inset-0 z-20 flex items-end">
          <div className="w-full">
            <div className="p-8">
              <div className="max-w-3xl">
                {/* Event Type Badge */}
                {event.event_type && (
                  <span className="inline-block px-4 py-2 bg-white/95 backdrop-blur-sm text-primary text-sm font-semibold rounded-full mb-4 border border-white/30 shadow-lg">
                    {event.event_type === 'in_person' ? 'In Person Event' : event.event_type}
                  </span>
                )}
                
                {event.is_public && (
                  <span className="px-4 py-2 bg-white/30 backdrop-blur-sm text-white text-sm font-semibold rounded-full border border-white/50 shadow-lg ml-4">
                    Public Event
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Title Section */}
      <div className="bg-background border-b border-border">
        <div className="p-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {event.title}
          </h1>
          <div className="flex items-center gap-4">
            <span className="font-medium">By {organizerProfile?.business_name || organizerProfile?.full_name || event.creator || event.organizer_email || 'Event Organizer'}</span>
          </div>
          {event.tags && event.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {event.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  #{formatLabel(tag)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EventHeader;
