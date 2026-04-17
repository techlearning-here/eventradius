import React from 'react';
import { MapPin, Globe, Users, Lock, Share2 } from 'lucide-react';

interface EventDetailHeroProps {
  image_url?: string;
  background_image_url?: string;
  event_type?: string;
  is_public?: boolean;
  loading?: boolean;
  onShare?: () => void;
}

export const EventDetailHero: React.FC<EventDetailHeroProps> = ({
  image_url,
  background_image_url,
  event_type,
  is_public,
  loading = false,
  onShare
}) => {
  // Priority: image_url (cover image) > background_image_url > gradient fallback
  const heroImageUrl = image_url || background_image_url;
  const getEventTypeIcon = () => {
    switch(event_type) {
      case 'in_person': return <MapPin className="w-3.5 h-3.5" />;
      case 'online': return <Globe className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  return (
    <div className="relative h-72 md:h-80 overflow-hidden">
      {/* Loading State - Shimmer Effect */}
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse z-10">
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading event...</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Background Image with Parallax Scale */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-1000 hover:scale-110"
        style={{ 
          backgroundImage: heroImageUrl 
            ? `url("${heroImageUrl}")` 
            : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.6) 50%, hsl(var(--primary)/0.3) 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Multi-layer Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />
      
      {/* Content Container */}
      <div className="absolute inset-0 z-20 flex items-end">
        <div className="w-full">
          <div className="p-6 md:p-8">
            <div className="max-w-3xl">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {/* Event Type Badge */}
                {event_type && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-white/10 backdrop-blur-md text-foreground text-xs font-semibold rounded-full border border-white/20 shadow-lg">
                    {getEventTypeIcon()}
                    {event_type === 'in_person' ? 'In Person' : event_type === 'online' ? 'Online' : event_type}
                  </span>
                )}
                
                {/* Public/Private Badge */}
                {is_public ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-lg">
                    <Users className="w-3 h-3" />
                    Public
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-500/90 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-lg">
                    <Lock className="w-3 h-3" />
                    Private
                  </span>
                )}

                {/* Share Button */}
                {onShare && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-white/10 backdrop-blur-md text-foreground hover:text-primary text-xs font-semibold rounded-full border border-white/20 shadow-lg transition-colors"
                    title="Share event"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailHero;
